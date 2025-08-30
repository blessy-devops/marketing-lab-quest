
-- 1) Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2) Create experimento_embeddings table
CREATE TABLE public.experimento_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experimento_id UUID REFERENCES public.experimentos(id) ON DELETE CASCADE,
  modelo TEXT NOT NULL,
  embedding vector(1536), -- tamanho padrão para modelos OpenAI
  chunk_texto TEXT,
  chunk_tipo TEXT, -- Ex: 'completo', 'hipotese', 'resultados'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Enable RLS and add policies
ALTER TABLE public.experimento_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view embeddings for accessible experiments"
  ON public.experimento_embeddings
  FOR SELECT
  USING (public.user_can_access_experiment(experimento_id));

CREATE POLICY "Users can insert embeddings for accessible experiments"
  ON public.experimento_embeddings
  FOR INSERT
  WITH CHECK (public.user_can_access_experiment(experimento_id));

CREATE POLICY "Users can update embeddings for accessible experiments"
  ON public.experimento_embeddings
  FOR UPDATE
  USING (public.user_can_access_experiment(experimento_id))
  WITH CHECK (public.user_can_access_experiment(experimento_id));

CREATE POLICY "Users can delete embeddings for accessible experiments"
  ON public.experimento_embeddings
  FOR DELETE
  USING (public.user_can_access_experiment(experimento_id));

-- 4) Create IVFFlat index for similarity search
CREATE INDEX experimento_embeddings_embedding_ivfflat
  ON public.experimento_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
