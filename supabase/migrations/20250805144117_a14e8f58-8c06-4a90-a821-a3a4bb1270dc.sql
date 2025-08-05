-- Habilitar RLS na tabela experimentos
ALTER TABLE public.experimentos ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários autenticados vejam experimentos
CREATE POLICY "Authenticated users can view experiments" 
ON public.experimentos 
FOR SELECT 
TO authenticated
USING (true);

-- Política para permitir que qualquer usuário autenticado crie experimentos
CREATE POLICY "Authenticated users can create experiments" 
ON public.experimentos 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir que qualquer usuário autenticado edite experimentos
CREATE POLICY "Authenticated users can update experiments" 
ON public.experimentos 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Política para permitir que qualquer usuário autenticado exclua experimentos
CREATE POLICY "Authenticated users can delete experiments" 
ON public.experimentos 
FOR DELETE 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Habilitar RLS e criar políticas para tabelas relacionadas
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas para anexos
CREATE POLICY "Authenticated users can view all anexos" 
ON public.anexos 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage anexos" 
ON public.anexos 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para metricas
CREATE POLICY "Authenticated users can view all metricas" 
ON public.metricas 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage metricas" 
ON public.metricas 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para resultados
CREATE POLICY "Authenticated users can view all resultados" 
ON public.resultados 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage resultados" 
ON public.resultados 
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para comentários
CREATE POLICY "Authenticated users can view all comentarios" 
ON public.comentarios 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create comentarios" 
ON public.comentarios 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own comentarios" 
ON public.comentarios 
FOR UPDATE 
TO authenticated
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own comentarios" 
ON public.comentarios 
FOR DELETE 
TO authenticated
USING (auth.uid() = usuario_id);