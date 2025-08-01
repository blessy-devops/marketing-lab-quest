-- Create comentarios table
CREATE TABLE public.comentarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experimento_id UUID NOT NULL,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Enable Row Level Security
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;

-- Create policies for comentarios
CREATE POLICY "Users can view comentarios of experiments they can access" 
ON public.comentarios 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comentarios" 
ON public.comentarios 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own comentarios" 
ON public.comentarios 
FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own comentarios" 
ON public.comentarios 
FOR DELETE 
USING (auth.uid() = usuario_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_comentarios_updated_at
BEFORE UPDATE ON public.comentarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_comentarios_experimento_id ON public.comentarios(experimento_id);
CREATE INDEX idx_comentarios_usuario_id ON public.comentarios(usuario_id);