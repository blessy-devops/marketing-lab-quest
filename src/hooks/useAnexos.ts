import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Anexo {
  id: string;
  experimento_id: string;
  tipo: string;
  url: string;
  descricao?: string;
  storage_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  is_link?: boolean;
  created_at: string;
}

export function useAnexos(experimentoId?: string) {
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnexos = async () => {
    if (!experimentoId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anexos')
        .select('*')
        .eq('experimento_id', experimentoId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(`Erro ao carregar anexos: ${error.message}`);
        return;
      }

      setAnexos(data || []);
    } catch (error) {
      toast.error('Erro inesperado ao carregar anexos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnexos();
  }, [experimentoId]);

  const refreshAnexos = () => {
    fetchAnexos();
  };

  return {
    anexos,
    loading,
    refreshAnexos,
    setAnexos
  };
}