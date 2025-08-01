import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TipoExperimento {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  icone?: string;
  cor: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubtipoExperimento {
  id: string;
  tipo_id: string;
  nome: string;
  descricao?: string;
  exemplos?: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CanalTipoSugestao {
  id: string;
  canal: string;
  tipo_id: string;
  peso: number;
  created_at: string;
}

export function useTiposExperimento() {
  return useQuery({
    queryKey: ['tipos-experimento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_experimento')
        .select('*')
        .order('ordem');
      
      if (error) throw error;
      return data as TipoExperimento[];
    },
  });
}

export function useSubtiposExperimento(tipoId?: string) {
  return useQuery({
    queryKey: ['subtipos-experimento', tipoId],
    queryFn: async () => {
      let query = supabase
        .from('subtipos_experimento')
        .select('*')
        .order('ordem');
      
      if (tipoId) {
        query = query.eq('tipo_id', tipoId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SubtipoExperimento[];
    },
    enabled: !!tipoId,
  });
}

export function useCanalTipoSugestoes() {
  return useQuery({
    queryKey: ['canal-tipo-sugestoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('canal_tipo_sugestao')
        .select('*');
      
      if (error) throw error;
      return data as CanalTipoSugestao[];
    },
  });
}

export function useCreateTipoExperimento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<TipoExperimento, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('tipos_experimento')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-experimento'] });
      toast({
        title: "Tipo criado",
        description: "O tipo de experimento foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar tipo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTipoExperimento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<TipoExperimento> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('tipos_experimento')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-experimento'] });
      toast({
        title: "Tipo atualizado",
        description: "O tipo de experimento foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar tipo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSubtipoExperimento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SubtipoExperimento> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('subtipos_experimento')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtipos-experimento'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar subtipo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCreateSubtipoExperimento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<SubtipoExperimento, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('subtipos_experimento')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtipos-experimento'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar subtipo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteSubtipoExperimento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subtipos_experimento')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtipos-experimento'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir subtipo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCanalTipoSugestao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ canal, tipoId, peso }: { canal: string; tipoId: string; peso: number }) => {
      // Primeiro, remove a sugestão existente se houver
      await supabase
        .from('canal_tipo_sugestao')
        .delete()
        .eq('canal', canal)
        .eq('tipo_id', tipoId);

      // Se peso > 0, cria nova sugestão
      if (peso > 0) {
        const { error } = await supabase
          .from('canal_tipo_sugestao')
          .insert({ canal, tipo_id: tipoId, peso });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canal-tipo-sugestoes'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar sugestão",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}