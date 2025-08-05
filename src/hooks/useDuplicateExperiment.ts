import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDuplicateExperiment() {
  const [duplicating, setDuplicating] = useState(false);
  const navigate = useNavigate();

  const duplicateExperiment = async (experimentoId: string) => {
    setDuplicating(true);
    
    try {
      // Buscar experimento original
      const { data: originalExperiment, error: fetchError } = await supabase
        .from('experimentos')
        .select('*')
        .eq('id', experimentoId)
        .single();

      if (fetchError) {
        toast.error(`Erro ao buscar experimento: ${fetchError.message}`);
        return null;
      }

      // Criar cópia com modificações
      const duplicatedData = {
        ...originalExperiment,
        id: undefined, // Deixar o banco gerar novo ID
        nome: `[CÓPIA] ${originalExperiment.nome}`,
        data_inicio: null,
        data_fim: null,
        status: 'planejado',
        created_at: undefined,
        updated_at: undefined
      };

      // Inserir nova cópia
      const { data: newExperiment, error: insertError } = await supabase
        .from('experimentos')
        .insert(duplicatedData)
        .select()
        .single();

      if (insertError) {
        toast.error(`Erro ao duplicar experimento: ${insertError.message}`);
        return null;
      }

      // Buscar e duplicar anexos (apenas links, não arquivos)
      const { data: originalAnexos } = await supabase
        .from('anexos')
        .select('*')
        .eq('experimento_id', experimentoId)
        .eq('is_link', true); // Só duplicar links

      if (originalAnexos && originalAnexos.length > 0) {
        const duplicatedAnexos = originalAnexos.map(anexo => ({
          ...anexo,
          id: undefined,
          experimento_id: newExperiment.id,
          created_at: undefined
        }));

        await supabase
          .from('anexos')
          .insert(duplicatedAnexos);
      }

      toast.success('Experimento duplicado com sucesso!');
      
      // Navegar para edição da cópia
      navigate(`/experimentos/${newExperiment.id}/editar`);
      
      return newExperiment;
    } catch (error) {
      toast.error('Erro inesperado ao duplicar experimento');
      return null;
    } finally {
      setDuplicating(false);
    }
  };

  return {
    duplicateExperiment,
    duplicating
  };
}