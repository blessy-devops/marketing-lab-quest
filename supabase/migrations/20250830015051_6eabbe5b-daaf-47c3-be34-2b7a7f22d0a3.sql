
-- Garante a extensão (idempotente; não faz nada se já estiver instalada)
CREATE EXTENSION IF NOT EXISTS vector;

-- Remove a função anterior se existir (para idempotência/ajustes)
DROP FUNCTION IF EXISTS public.match_experiments(double precision[], double precision, integer);

-- Cria função de busca semântica por similaridade de cosseno
CREATE OR REPLACE FUNCTION public.match_experiments(
  query_embedding double precision[],
  match_threshold double precision DEFAULT 0.8,
  match_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  experimento_id uuid,
  modelo text,
  chunk_texto text,
  chunk_tipo text,
  created_at timestamptz,
  similarity double precision
)
LANGUAGE sql
STABLE
AS $function$
  WITH q AS (
    SELECT array_to_vector(query_embedding, 1536, true) AS qvec
  )
  SELECT
    e.id,
    e.experimento_id,
    e.modelo,
    e.chunk_texto,
    e.chunk_tipo,
    e.created_at,
    1 - (e.embedding <=> q.qvec) AS similarity
  FROM public.experimento_embeddings e
  CROSS JOIN q
  WHERE e.embedding IS NOT NULL
    AND (1 - (e.embedding <=> q.qvec)) >= match_threshold
  ORDER BY e.embedding <=> q.qvec
  LIMIT match_count;
$function$;
