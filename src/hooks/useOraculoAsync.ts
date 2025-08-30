
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

      // Chamar a Edge Function
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('oraculo-trigger', {
        body: {
          question: pergunta,
          conversationId,
          userId,
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

  const limparMensagens = useCallback(() => {
    setMessages([]);
    setErro(null);
  }, []);

  return {
    enviarPergunta,
    atualizarMensagemAssistente,
    limparMensagens,
    loading,
    messages,
    erro,
  };
}
