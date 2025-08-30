
-- Passo 1: adicionar colunas de contexto na tabela public.experimentos

ALTER TABLE public.experimentos 
  ADD COLUMN IF NOT EXISTS contexto_narrativo TEXT;

ALTER TABLE public.experimentos 
  ADD COLUMN IF NOT EXISTS contexto_negocio JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Remover a coluna gerada se existir com definição diferente (evita conflito ao recriar)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'experimentos'
      AND column_name = 'contexto_completo'
  ) THEN
    -- Tentativa de remover a coluna para garantir recriação com a definição correta
    BEGIN
      ALTER TABLE public.experimentos DROP COLUMN contexto_completo;
    EXCEPTION WHEN undefined_column THEN
      -- se não existir como coluna "droppable", ignorar
      NULL;
    END;
  END IF;
END$$;

-- Criar a coluna gerada com concat dos campos da própria tabela
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
