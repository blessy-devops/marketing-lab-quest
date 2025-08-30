
-- 1) Adicionar contexto_narrativo (TEXT, pode ser nula)
ALTER TABLE public.experimentos
  ADD COLUMN IF NOT EXISTS contexto_narrativo TEXT;

-- 2) Adicionar contexto_negocio (JSONB, NOT NULL, DEFAULT '{}')
ALTER TABLE public.experimentos
  ADD COLUMN IF NOT EXISTS contexto_negocio JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 3) Adicionar contexto_completo (Generated Column - TEXT)
-- Observação: Não é possível referenciar outras tabelas ou colunas inexistentes aqui.
-- A expressão concatena os campos locais para um resumo legível.
ALTER TABLE public.experimentos
  ADD COLUMN IF NOT EXISTS contexto_completo TEXT GENERATED ALWAYS AS (
    CONCAT(
      'Experimento: ', COALESCE(nome, ''),
      '. Hipótese: ', COALESCE(hipotese, ''),
      '. Período: de ', COALESCE(data_inicio::text, ''), ' a ', COALESCE(data_fim::text, ''),
      '. Canais: ', COALESCE(array_to_string(canais, ', '), ''),
      '. Descrição: ', COALESCE(contexto_narrativo, '')
    )
  ) STORED;
