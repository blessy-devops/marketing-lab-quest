import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TipoComSubtipos {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  icone?: string;
  cor: string;
  ordem: number;
  ativo: boolean;
  subtipos_experimento: Array<{
    id: string;
    nome: string;
    descricao?: string;
    exemplos?: string;
    ordem: number;
    ativo: boolean;
  }>;
}

export interface SugestaoTipo {
  canal: string;
  peso: number;
  tipos_experimento: {
    id: string;
    codigo: string;
    nome: string;
    descricao?: string;
    icone?: string;
    cor: string;
  };
}

export function useTiposExperimentoAtivos() {
  return useQuery({
    queryKey: ['tipos-experimento-ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_experimento')
        .select(`
          *,
          subtipos_experimento!inner (
            id,
            nome,
            descricao,
            exemplos,
            ordem,
            ativo
          )
        `)
        .eq('ativo', true)
        .eq('subtipos_experimento.ativo', true)
        .order('ordem');
      
      if (error) throw error;
      
      // Sort subtipos by ordem
      const sortedData = data?.map(tipo => ({
        ...tipo,
        subtipos_experimento: tipo.subtipos_experimento?.sort((a, b) => a.ordem - b.ordem) || []
      })) || [];
      
      return sortedData as TipoComSubtipos[];
    },
  });
}

export function useSugestoesTipos(canaisSelecionados: string[]) {
  return useQuery({
    queryKey: ['sugestoes-tipos', canaisSelecionados],
    queryFn: async () => {
      if (!canaisSelecionados.length) return [];
      
      const { data, error } = await supabase
        .from('canal_tipo_sugestao')
        .select(`
          canal,
          peso,
          tipos_experimento (
            id,
            codigo,
            nome,
            descricao,
            icone,
            cor
          )
        `)
        .in('canal', canaisSelecionados)
        .order('peso', { ascending: false });
      
      if (error) throw error;
      return data as SugestaoTipo[];
    },
    enabled: canaisSelecionados.length > 0,
  });
}

export function useTipoExperimentoById(tipoId?: string) {
  return useQuery({
    queryKey: ['tipo-experimento', tipoId],
    queryFn: async () => {
      if (!tipoId) return null;
      
      const { data, error } = await supabase
        .from('tipos_experimento')
        .select(`
          *,
          subtipos_experimento (
            id,
            nome,
            descricao,
            exemplos,
            ordem,
            ativo
          )
        `)
        .eq('id', tipoId)
        .eq('subtipos_experimento.ativo', true)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data?.subtipos_experimento) {
        data.subtipos_experimento.sort((a, b) => a.ordem - b.ordem);
      }
      
      return data as TipoComSubtipos | null;
    },
    enabled: !!tipoId,
  });
}