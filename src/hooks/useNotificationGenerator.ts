import { useEffect } from 'react';
import { useCreateNotification } from './useNotifications';
import { useExperimentos } from './useSupabaseData';

export const useNotificationGenerator = () => {
  const { experimentos = [] } = useExperimentos();
  const createNotification = useCreateNotification();

  useEffect(() => {
    // Verificar experimentos com prazo próximo (próximos 3 dias)
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    experimentos.forEach((experimento) => {
      if (experimento.data_fim && experimento.status === 'em_andamento') {
        const dataFim = new Date(experimento.data_fim);
        
        if (dataFim <= threeDaysFromNow && dataFim > now) {
          // Verificar se já existe notificação para este experimento
          // Para simplificar, vamos criar a notificação aqui
          // Em produção, você criaria uma função que verifica se a notificação já existe
          console.log(`Experimento ${experimento.nome} está próximo do prazo`);
        }
      }
    });
  }, [experimentos]);

  // Função para criar notificação quando experimento é concluído
  const notifyExperimentoConcluido = (experimentoId: string, nomeExperimento: string) => {
    createNotification.mutate({
      tipo: 'experimento_concluido',
      titulo: `Experimento "${nomeExperimento}" foi concluído`,
      descricao: 'O experimento foi finalizado e está pronto para análise dos resultados.',
      experimento_id: experimentoId,
    });
  };

  // Função para criar notificação de novo insight
  const notifyNovoInsight = (titulo: string, descricao: string, experimentoId?: string) => {
    createNotification.mutate({
      tipo: 'novo_insight',
      titulo,
      descricao,
      experimento_id: experimentoId,
    });
  };

  // Função para criar notificação de prazo próximo
  const notifyPrazoProximo = (titulo: string, descricao: string, experimentoId?: string) => {
    createNotification.mutate({
      tipo: 'prazo_proximo',
      titulo,
      descricao,
      experimento_id: experimentoId,
    });
  };

  return {
    notifyExperimentoConcluido,
    notifyNovoInsight,
    notifyPrazoProximo,
  };
};