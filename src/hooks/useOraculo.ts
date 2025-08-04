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
    tipo: string = 'geral'
  ) => {
    // Validação
    if (!pergunta || pergunta.trim().length < 10) {
      toast.error('A pergunta deve ter pelo menos 10 caracteres');
      return null;
    }

    setLoading(true);
    setErro(null);

    try {
      // Mostrar toast de loading
      const toastId = toast.loading('Consultando o Oráculo...');

      // Fazer a chamada
      const resultado = await oraculoService.consultar({
        pergunta: pergunta.trim(),
        contexto: contexto.trim(),
        tipo
      });

      // Dismiss loading toast
      toast.dismiss(toastId);

      // Verificar resposta
      if (resultado.sucesso) {
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
            description: `${resultado.metadados?.experimentos_analisados || 0} experimentos analisados`
          });
        }

        return resultado;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error: any) {
      console.error('Erro:', error);
      setErro(error.message);
      
      toast.error('Erro ao consultar o Oráculo', {
        description: 'Tente novamente em alguns segundos'
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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