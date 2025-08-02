-- Fix RLS policies to allow proper authenticated access
-- The previous policies were too restrictive

-- 1. TIPOS_EXPERIMENTO - Allow read access to all authenticated users
ALTER TABLE public.tipos_experimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tipos_experimento" 
ON public.tipos_experimento 
FOR SELECT 
TO authenticated
USING (true);

-- 2. SUBTIPOS_EXPERIMENTO - Allow read access to all authenticated users  
ALTER TABLE public.subtipos_experimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view subtipos_experimento" 
ON public.subtipos_experimento 
FOR SELECT 
TO authenticated
USING (true);

-- 3. CANAL_TIPO_SUGESTAO - Allow read access to all authenticated users
ALTER TABLE public.canal_tipo_sugestao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view canal_tipo_sugestao" 
ON public.canal_tipo_sugestao 
FOR SELECT 
TO authenticated
USING (true);

-- Allow admin operations on configuration tables
CREATE POLICY "Admins can manage tipos_experimento" 
ON public.tipos_experimento 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage subtipos_experimento" 
ON public.subtipos_experimento 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage canal_tipo_sugestao" 
ON public.canal_tipo_sugestao 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));