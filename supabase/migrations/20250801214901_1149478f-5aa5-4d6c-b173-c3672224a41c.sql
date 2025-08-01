-- Remove check constraints that are blocking experiment creation
ALTER TABLE public.experimentos DROP CONSTRAINT IF EXISTS experimentos_tipo_check;
ALTER TABLE public.experimentos DROP CONSTRAINT IF EXISTS experimentos_status_check;