-- Create tipos_experimento table
CREATE TABLE public.tipos_experimento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  cor TEXT DEFAULT '#3B82F6',
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subtipos_experimento table
CREATE TABLE public.subtipos_experimento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_id UUID REFERENCES public.tipos_experimento(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  exemplos TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create canal_tipo_sugestao table
CREATE TABLE public.canal_tipo_sugestao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  canal TEXT NOT NULL,
  tipo_id UUID REFERENCES public.tipos_experimento(id) ON DELETE CASCADE,
  peso INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tipos_experimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtipos_experimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canal_tipo_sugestao ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tipos_experimento
CREATE POLICY "Allow public access to tipos_experimento" 
ON public.tipos_experimento 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create RLS policies for subtipos_experimento
CREATE POLICY "Allow public access to subtipos_experimento" 
ON public.subtipos_experimento 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create RLS policies for canal_tipo_sugestao
CREATE POLICY "Allow public access to canal_tipo_sugestao" 
ON public.canal_tipo_sugestao 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tipos_experimento_updated_at
BEFORE UPDATE ON public.tipos_experimento
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subtipos_experimento_updated_at
BEFORE UPDATE ON public.subtipos_experimento
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();