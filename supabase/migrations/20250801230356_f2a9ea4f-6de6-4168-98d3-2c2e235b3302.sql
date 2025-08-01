-- Add new columns to experimentos table for dynamic experiment types
ALTER TABLE public.experimentos 
ADD COLUMN IF NOT EXISTS tipo_experimento_id UUID REFERENCES public.tipos_experimento(id),
ADD COLUMN IF NOT EXISTS subtipo_experimento_id UUID REFERENCES public.subtipos_experimento(id),
ADD COLUMN IF NOT EXISTS subtipo_customizado TEXT;