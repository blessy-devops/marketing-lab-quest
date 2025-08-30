
-- Add missing context fields to experiments table
ALTER TABLE public.experimentos
  ADD COLUMN IF NOT EXISTS contexto_narrativo text NULL,
  ADD COLUMN IF NOT EXISTS contexto_negocio jsonb NULL DEFAULT '{}'::jsonb;

-- Optional: backfill nulls to a safe default for consistency (no-op if empty)
UPDATE public.experimentos
SET contexto_negocio = '{}'::jsonb
WHERE contexto_negocio IS NULL;
