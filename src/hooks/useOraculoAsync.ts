

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[] | null;
  status?: 'loading' | 'complete';
  timestamp: string;
}

export function useOraculoAsync() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const enviarPergunta = useCallback(async (
    pergunta: string,
    conversationId: string,
    userId: string
  ) => {
    if (!pergunta || pergunta.trim().length < 10) {
      toast.error('A pergunta deve ter pelo menos 10 caracteres');
      return false;
    }

    if (loading) {
      toast.error('Aguarde a consulta atual terminar');
      return false;
    }

    setLoading(true);
    setErro(null);

    try {
      // Adicionar mensagem do usuário imediatamente
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: pergunta,
        timestamp: new Date().toISOString(),
      };

      // Adicionar placeholder de loading para o assistente
      const assistantPlaceholder: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        status: 'loading',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage, assistantPlaceholder]);

      console.log('🚀 Enviando pergunta para Edge Function:', { 
        pergunta: pergunta.substring(0, 50) + '...', 
        conversationId, 
        userId 
      });

      // Obter sessão atual para autenticação
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session?.access_token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Chamar a Edge Function com autenticação explícita
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('oraculo-trigger', {
        body: {
          question: pergunta,
          conversationId,
          userId,
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });
      const endTime = performance.now();

      console.log(`⚡ Edge Function respondeu em ${Math.round(endTime - startTime)}ms`);

      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        throw new Error(`Erro na Edge Function: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ Edge Function não retornou sucesso:', data);
        throw new Error('Edge Function não retornou sucesso');
      }

      console.log('✅ Edge Function chamada com sucesso - aguardando resposta via Realtime');
      toast.success('Pergunta enviada! Aguarde a resposta...', {
        description: 'O Oráculo está processando sua consulta'
      });

      // Iniciar watchdog de 30s para fallback silencioso se Realtime falhar
      setTimeout(() => {
        setMessages(prev => {
          const hasLoadingMessage = prev.some(msg => msg.role === 'assistant' && msg.status === 'loading');
          if (hasLoadingMessage) {
            console.log('🔄 Watchdog: Realtime demorou, tentando fallback...');
            // Chamar fallback inline para evitar dependência circular
            tentarFallback(conversationId);
          }
          return prev;
        });
      }, 30000);

      // Iniciar alerta de 2 minutos para resposta demorada
      setTimeout(() => {
        setMessages(prev => {
          const hasLoadingMessage = prev.some(msg => msg.role === 'assistant' && msg.status === 'loading');
          if (hasLoadingMessage) {
            console.log('⚠️ Alerta: Resposta demorou mais de 2 minutos');
            toast.warning('Resposta demorou', {
              description: 'O Oráculo está demorando para responder. Pode haver alta demanda.',
              duration: 5000
            });
          }
          return prev;
        });
      }, 120000);

      return true;

    } catch (error: any) {
      console.error('Erro ao enviar pergunta:', error);
      setErro(error.message);
      
      // Remover o placeholder de loading em caso de erro
      setMessages(prev => prev.filter(msg => msg.status !== 'loading'));
      
      toast.error('Erro ao enviar pergunta', {
        description: error.message || 'Tente novamente em alguns segundos'
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Função auxiliar para fallback (inline para evitar dependência circular)
  const tentarFallback = async (conversationId: string) => {
    try {
      console.log('🆘 Fallback: Buscando última mensagem do assistente...');
      
      const { data, error } = await supabase
        .from('oraculo_historico')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('role', 'assistant')
        .neq('role', 'system')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const latestAssistant = data[0];
        console.log('✅ Fallback: Encontrada resposta do assistente');
        
        // Garantir que sources é um array ou null
        const sources = Array.isArray(latestAssistant.sources) ? latestAssistant.sources : null;
        atualizarMensagemAssistente(latestAssistant.content, sources);
      } else {
        console.log('⚠️ Fallback: Nenhuma nova resposta encontrada');
        toast.error('Resposta demorou para chegar', {
          description: 'Tente recarregar a conversa ou enviar novamente',
          action: {
            label: 'Recarregar',
            onClick: () => carregarHistorico(conversationId)
          }
        });
      }
    } catch (error) {
      console.error('❌ Erro no fallback:', error);
      toast.error('Erro ao tentar recuperar resposta', {
        description: 'Tente recarregar a página'
      });
    }
  };

  const atualizarMensagemAssistente = useCallback((novoContent: string, sources?: any[]) => {
    console.log('🔄 Atualizando mensagem do assistente:', { 
      contentLength: novoContent?.length || 0,
      sourcesCount: sources?.length || 0 
    });
    
    setMessages(prev => prev.map(msg => {
      if (msg.role === 'assistant' && msg.status === 'loading') {
        return {
          ...msg,
          content: novoContent,
          sources,
          status: 'complete',
        };
      }
      return msg;
    }));
  }, []);

  const carregarHistorico = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setErro(null);
      
      console.log('📚 Carregando histórico para conversa:', conversationId);
      
      // Usar Promise.race para timeout de 15s
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('⏰ Timeout ao carregar histórico após 15s');
          reject(new Error('Timeout'));
        }, 15000);
      });

      const dataPromise = supabase
        .from('oraculo_historico')
        .select('*')
        .eq('conversation_id', conversationId)
        .neq('role', 'system') // Excluir mensagens de título
        .order('created_at', { ascending: true });

      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Erro ao carregar histórico:', error);
        throw error;
      }

      const historicoMessages: Message[] = (data || []).map((record: any) => ({
        id: record.id,
        role: record.role,
        content: record.content || '',
        sources: Array.isArray(record.sources) ? record.sources : null,
        status: 'complete',
        timestamp: record.created_at,
      }));

      console.log('✅ Histórico carregado:', historicoMessages.length, 'mensagens');
      setMessages(historicoMessages);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      
      if (error.message === 'Timeout') {
        setErro('Timeout ao carregar histórico - tente novamente');
        toast.error('Timeout ao carregar histórico', {
          description: 'A conexão está lenta, tente novamente'
        });
      } else {
        setErro('Erro ao carregar histórico da conversa');
        toast.error('Erro ao carregar histórico');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const tentarFallbackHistorico = useCallback(async (conversationId: string) => {
    return tentarFallback(conversationId);
  }, [carregarHistorico]);

  const limparMensagens = useCallback(() => {
    setMessages([]);
    setErro(null);
  }, []);

  return {
    enviarPergunta,
    atualizarMensagemAssistente,
    carregarHistorico,
    limparMensagens,
    loading,
    messages,
    erro,
  };
}

