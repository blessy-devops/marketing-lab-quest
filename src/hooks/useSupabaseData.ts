import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Experimento {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  data_inicio: string | null;
  data_fim: string | null;
  responsavel: string | null;
  canais: string[] | null;
  hipotese: string | null;
  contexto_narrativo: string | null;
  contexto_negocio: any | null;
  created_at: string;
  updated_at: string;
}

export interface Metrica {
  id: string;
  experimento_id: string;
  tipo: 'esperada' | 'realizada';
  nome: string;
  valor: number | null;
  unidade: string | null;
}

export interface Resultado {
  id: string;
  experimento_id: string;
  sucesso: boolean | null;
  roi: number | null;
  aprendizados: string | null;
  fatos: string | null;
  causas: string | null;
  acoes: string | null;
}

export interface ExperimentoEmbedding {
  id: string;
  experimento_id: string;
  modelo: string;
  embedding: number[];
  chunk_texto: string | null;
  chunk_tipo: string | null;
  created_at: string;
}

export function useExperimentos() {
  const [experimentos, setExperimentos] = useState<Experimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExperimentos() {
      try {
        const { data, error } = await supabase
          .from('experimentos')
          .select(`
            id,
            nome,
            tipo,
            status,
            data_inicio,
            data_fim,
            responsavel,
            canais,
            hipotese,
            contexto_narrativo,
            contexto_negocio,
            created_at,
            updated_at
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setExperimentos(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar experimentos');
      } finally {
        setLoading(false);
      }
    }

    fetchExperimentos();
  }, []);

  return { experimentos, loading, error };
}

export function useResultados() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResultados() {
      try {
        const { data, error } = await supabase
          .from('resultados')
          .select('*');

        if (error) throw error;
        setResultados(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar resultados');
      } finally {
        setLoading(false);
      }
    }

    fetchResultados();
  }, []);

  return { resultados, loading, error };
}

export function useExperimentosComResultados() {
  const [data, setData] = useState<(Experimento & { resultado?: Resultado })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch experiments with explicit field selection
        const { data: experimentosData, error: expError } = await supabase
          .from('experimentos')
          .select(`
            id,
            nome,
            tipo,
            status,
            data_inicio,
            data_fim,
            responsavel,
            canais,
            hipotese,
            contexto_narrativo,
            contexto_negocio,
            created_at,
            updated_at
          `)
          .order('created_at', { ascending: false });

        if (expError) throw expError;

        // Fetch results separately
        const { data: resultadosData, error: resError } = await supabase
          .from('resultados')
          .select('*');

        if (resError) throw resError;

        // Combine the data
        const processedData = experimentosData?.map(exp => ({
          ...exp,
          resultado: resultadosData?.find(res => res.experimento_id === exp.id) || undefined
        })) || [];

        setData(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalExperimentos: 0,
    taxaSucesso: 0,
    experimentosEmAndamento: 0,
    roiMedio: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Buscar todos os experimentos
        const { data: experimentos, error: expError } = await supabase
          .from('experimentos')
          .select('*');

        if (expError) throw expError;

        // Buscar todos os resultados
        const { data: resultados, error: resError } = await supabase
          .from('resultados')
          .select('*');

        if (resError) throw resError;

        const totalExperimentos = experimentos?.length || 0;
        const experimentosEmAndamento = experimentos?.filter(exp => exp.status === 'em_andamento').length || 0;
        
        const experimentosComSucesso = resultados?.filter(res => res.sucesso === true).length || 0;
        const taxaSucesso = totalExperimentos > 0 ? (experimentosComSucesso / totalExperimentos) * 100 : 0;
        
        const roisValidos = resultados?.filter(res => res.roi !== null).map(res => res.roi as number) || [];
        const roiMedio = roisValidos.length > 0 
          ? roisValidos.reduce((acc, roi) => acc + roi, 0) / roisValidos.length 
          : 0;

        setMetrics({
          totalExperimentos,
          taxaSucesso: Math.round(taxaSucesso * 10) / 10,
          experimentosEmAndamento,
          roiMedio: Math.round(roiMedio * 100) / 100
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao calcular métricas');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}

export function useEmbeddings(experimentoId?: string) {
  const [embeddings, setEmbeddings] = useState<ExperimentoEmbedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmbeddings() {
      try {
        let query = supabase
          .from('experimento_embeddings')
          .select('*')
          .order('created_at', { ascending: false });

        if (experimentoId) {
          query = query.eq('experimento_id', experimentoId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setEmbeddings(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar embeddings');
      } finally {
        setLoading(false);
      }
    }

    fetchEmbeddings();
  }, [experimentoId]);

  return { embeddings, loading, error };
}

export async function createEmbedding(embedding: Omit<ExperimentoEmbedding, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('experimento_embeddings')
    .insert([embedding])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEmbeddings(experimentoId: string) {
  const { error } = await supabase
    .from('experimento_embeddings')
    .delete()
    .eq('experimento_id', experimentoId);

  if (error) throw error;
}

export async function searchSimilarExperiments(embedding: number[], limit: number = 10) {
  // Esta função será implementada quando tivermos a extensão pgvector configurada
  // Por enquanto, retornamos uma estrutura vazia
  const { data, error } = await supabase.rpc('match_experiments', {
    query_embedding: embedding,
    match_threshold: 0.8,
    match_count: limit
  });

  if (error) {
    console.warn('Função de busca semântica ainda não implementada:', error.message);
    return [];
  }

  return data || [];
}
