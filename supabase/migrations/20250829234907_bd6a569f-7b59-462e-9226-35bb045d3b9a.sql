
-- Permitir métricas do tipo 'baseline' na tabela public.metricas

ALTER TABLE public.metricas
  DROP CONSTRAINT IF EXISTS metricas_tipo_check;

ALTER TABLE public.metricas
  ADD CONSTRAINT metricas_tipo_check
  CHECK (tipo IN ('esperada', 'realizada', 'baseline'));
