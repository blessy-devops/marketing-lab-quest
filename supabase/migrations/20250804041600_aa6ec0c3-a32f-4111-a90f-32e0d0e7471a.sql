-- Criar tabela de playbooks
CREATE TABLE public.playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('gap', 'lancamento', 'sazonal', 'conversao', 'retencao')),
  descricao TEXT,
  cenario_ideal TEXT,
  resultados_esperados TEXT,
  tags TEXT[] DEFAULT '{}',
  conteudo JSONB NOT NULL DEFAULT '{}',
  metricas JSONB DEFAULT '{}',
  casos_sucesso JSONB DEFAULT '[]',
  variacoes JSONB DEFAULT '[]',
  usos_count INTEGER DEFAULT 0,
  roi_medio DECIMAL DEFAULT 0,
  taxa_sucesso DECIMAL DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  sum_ratings INTEGER DEFAULT 0,
  auto_gerado BOOLEAN DEFAULT false,
  experimento_origem_id UUID,
  criado_por UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Playbooks são visíveis para todos usuários autenticados" 
ON public.playbooks 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar playbooks" 
ON public.playbooks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND criado_por = auth.uid());

CREATE POLICY "Usuários podem atualizar playbooks que criaram" 
ON public.playbooks 
FOR UPDATE 
USING (auth.uid() = criado_por);

-- Tabela de ratings de playbooks
CREATE TABLE public.playbook_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID NOT NULL REFERENCES public.playbooks(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playbook_id, usuario_id)
);

-- Habilitar RLS
ALTER TABLE public.playbook_ratings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ratings
CREATE POLICY "Ratings são visíveis para todos usuários autenticados" 
ON public.playbook_ratings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar seus próprios ratings" 
ON public.playbook_ratings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus próprios ratings" 
ON public.playbook_ratings 
FOR UPDATE 
USING (auth.uid() = usuario_id);

-- Tabela de uso de playbooks
CREATE TABLE public.playbook_usos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID NOT NULL REFERENCES public.playbooks(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  experimento_id UUID,
  sucesso BOOLEAN,
  roi_obtido DECIMAL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.playbook_usos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usos
CREATE POLICY "Usos são visíveis para todos usuários autenticados" 
ON public.playbook_usos 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem registrar seus usos" 
ON public.playbook_usos 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND usuario_id = auth.uid());

-- Triggers para atualizar estatísticas automaticamente
CREATE OR REPLACE FUNCTION update_playbook_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas do playbook
  UPDATE public.playbooks 
  SET 
    usos_count = (
      SELECT COUNT(*) 
      FROM public.playbook_usos 
      WHERE playbook_id = COALESCE(NEW.playbook_id, OLD.playbook_id)
    ),
    roi_medio = (
      SELECT COALESCE(AVG(roi_obtido), 0) 
      FROM public.playbook_usos 
      WHERE playbook_id = COALESCE(NEW.playbook_id, OLD.playbook_id) 
      AND roi_obtido IS NOT NULL
    ),
    taxa_sucesso = (
      SELECT COALESCE(AVG(CASE WHEN sucesso THEN 1.0 ELSE 0.0 END) * 100, 0) 
      FROM public.playbook_usos 
      WHERE playbook_id = COALESCE(NEW.playbook_id, OLD.playbook_id) 
      AND sucesso IS NOT NULL
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.playbook_ratings 
      WHERE playbook_id = COALESCE(NEW.playbook_id, OLD.playbook_id)
    ),
    sum_ratings = (
      SELECT COALESCE(SUM(rating), 0) 
      FROM public.playbook_ratings 
      WHERE playbook_id = COALESCE(NEW.playbook_id, OLD.playbook_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.playbook_id, OLD.playbook_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_playbook_stats_on_uso
  AFTER INSERT OR UPDATE OR DELETE ON public.playbook_usos
  FOR EACH ROW
  EXECUTE FUNCTION update_playbook_stats();

CREATE TRIGGER update_playbook_stats_on_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.playbook_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_playbook_stats();

-- Trigger para updated_at
CREATE TRIGGER update_playbooks_updated_at
  BEFORE UPDATE ON public.playbooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();