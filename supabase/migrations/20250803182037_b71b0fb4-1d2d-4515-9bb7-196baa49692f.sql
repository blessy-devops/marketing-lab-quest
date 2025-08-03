-- Criar tabela para curtidas/reações em comentários
CREATE TABLE public.comentario_curtidas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comentario_id UUID NOT NULL REFERENCES public.comentarios(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comentario_id, usuario_id)
);

-- Enable RLS
ALTER TABLE public.comentario_curtidas ENABLE ROW LEVEL SECURITY;

-- Políticas para curtidas
CREATE POLICY "Usuários podem ver todas as curtidas" 
ON public.comentario_curtidas 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem curtir comentários" 
ON public.comentario_curtidas 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem descurtir seus próprios comentários" 
ON public.comentario_curtidas 
FOR DELETE 
USING (auth.uid() = usuario_id);