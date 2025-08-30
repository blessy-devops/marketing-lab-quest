import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { oraculoService } from '@/services/oraculo.service';

export function useOraculo() {
  const [loading, setLoading] = useState(false);
  const [resposta, setResposta] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

  const consultarOraculo = useCallback(async (
    pergunta: string,
    contexto: string = '',
    tipo: string = 'geral',
    conversationId?: string,
    userId?: string
  ) => {
    // Validação
    if (!pergunta || pergunta.trim().length < 10) {
      toast.error('A pergunta deve ter pelo menos 10 caracteres');
      return null;
    }

    // Prevenir múltiplas consultas concorrentes
    if (loading) {
      toast.error('Aguarde a consulta atual terminar');
      return null;
    }

    setLoading(true);
    setErro(null);

    let loadingToastId: string | number | undefined;

    try {
      // Mostrar toast de loading
      loadingToastId = toast.loading('Consultando o Oráculo...');

      // Fazer a chamada
      const resultado = await oraculoService.consultar({
        pergunta: pergunta.trim(),
        contexto: contexto.trim(),
        tipo,
        conversation_id: conversationId,
      }, userId);

      // Verificar resposta
      if (resultado && resultado.resposta) {
        setResposta(resultado);
        
        // Salvar no histórico
        oraculoService.salvarHistorico(pergunta, resultado);

        // Toast de sucesso
        if (resultado.metadados?.cache) {
          toast.success('Resposta recuperada do cache!', {
            description: 'Resposta instantânea baseada em consulta anterior'
          });
        } else {
          toast.success('Análise concluída!', {
            description: `Processado em ${resultado.metadados?.tempo_resposta_ms || 0}ms`
          });
        }

        return resultado;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error: any) {
      console.error('Erro:', error);
      setErro(error.message);
      
      let errorMessage = 'Tente novamente em alguns segundos';
      if (error.name === 'AbortError') {
        errorMessage = 'Tempo esgotado - verifique sua conexão';
      } else if (error.message === 'Failed to fetch') {
        errorMessage = 'Erro de conexão - verifique a configuração do webhook';
      }
      
      toast.error('Erro ao consultar o Oráculo', {
        description: errorMessage
      });
      
      return null;
    } finally {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      setLoading(false);
    }
  }, [loading]);

  const limparResposta = useCallback(() => {
    setResposta(null);
    setErro(null);
  }, []);

  return {
    consultarOraculo,
    limparResposta,
    loading,
    resposta,
    erro,
    historico: oraculoService.obterHistorico(),
    limparHistorico: oraculoService.limparHistorico
  };
}