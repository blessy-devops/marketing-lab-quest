-- Temporarily disable RLS policies to allow public access
-- This allows the app to work without authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Usuários autenticados podem criar experimentos" ON public.experimentos;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar experimentos" ON public.experimentos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar experimentos" ON public.experimentos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar experimentos" ON public.experimentos;

DROP POLICY IF EXISTS "Usuários autenticados podem criar métricas" ON public.metricas;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar métricas" ON public.metricas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar métricas" ON public.metricas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar métricas" ON public.metricas;

DROP POLICY IF EXISTS "Usuários autenticados podem criar anexos" ON public.anexos;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar anexos" ON public.anexos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar anexos" ON public.anexos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar anexos" ON public.anexos;

DROP POLICY IF EXISTS "Usuários autenticados podem criar resultados" ON public.resultados;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar resultados" ON public.resultados;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar resultados" ON public.resultados;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar resultados" ON public.resultados;

-- Create new public access policies
CREATE POLICY "Allow public access to experimentos" ON public.experimentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to metricas" ON public.metricas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to anexos" ON public.anexos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to resultados" ON public.resultados FOR ALL USING (true) WITH CHECK (true);