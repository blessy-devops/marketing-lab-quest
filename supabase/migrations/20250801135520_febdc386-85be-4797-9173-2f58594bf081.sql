-- Criar tabela de experimentos
CREATE TABLE public.experimentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('criativo', 'oferta', 'promocao', 'canal', 'campanha', 'narrativa', 'landing_page')),
    status TEXT DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido')),
    data_inicio DATE,
    data_fim DATE,
    responsavel TEXT,
    canais TEXT[],
    hipotese TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de métricas
CREATE TABLE public.metricas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    experimento_id UUID NOT NULL REFERENCES public.experimentos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('esperada', 'realizada')),
    nome TEXT NOT NULL,
    valor NUMERIC,
    unidade TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de resultados
CREATE TABLE public.resultados (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    experimento_id UUID NOT NULL REFERENCES public.experimentos(id) ON DELETE CASCADE UNIQUE,
    sucesso BOOLEAN,
    roi NUMERIC,
    aprendizados TEXT,
    fatos TEXT,
    causas TEXT,
    acoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de anexos
CREATE TABLE public.anexos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    experimento_id UUID NOT NULL REFERENCES public.experimentos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('imagem', 'video', 'link', 'documento')),
    url TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_experimentos_updated_at
    BEFORE UPDATE ON public.experimentos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resultados_updated_at
    BEFORE UPDATE ON public.resultados
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_experimentos_status ON public.experimentos(status);
CREATE INDEX idx_experimentos_tipo ON public.experimentos(tipo);
CREATE INDEX idx_experimentos_data_inicio ON public.experimentos(data_inicio);
CREATE INDEX idx_metricas_experimento_id ON public.metricas(experimento_id);
CREATE INDEX idx_metricas_tipo ON public.metricas(tipo);
CREATE INDEX idx_anexos_experimento_id ON public.anexos(experimento_id);
CREATE INDEX idx_anexos_tipo ON public.anexos(tipo);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.experimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para experimentos - CRUD completo para usuários autenticados
CREATE POLICY "Usuários autenticados podem visualizar experimentos" 
ON public.experimentos 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem criar experimentos" 
ON public.experimentos 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar experimentos" 
ON public.experimentos 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem deletar experimentos" 
ON public.experimentos 
FOR DELETE 
TO authenticated
USING (true);

-- Políticas RLS para métricas
CREATE POLICY "Usuários autenticados podem visualizar métricas" 
ON public.metricas 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem criar métricas" 
ON public.metricas 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar métricas" 
ON public.metricas 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem deletar métricas" 
ON public.metricas 
FOR DELETE 
TO authenticated
USING (true);

-- Políticas RLS para resultados
CREATE POLICY "Usuários autenticados podem visualizar resultados" 
ON public.resultados 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem criar resultados" 
ON public.resultados 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar resultados" 
ON public.resultados 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem deletar resultados" 
ON public.resultados 
FOR DELETE 
TO authenticated
USING (true);

-- Políticas RLS para anexos
CREATE POLICY "Usuários autenticados podem visualizar anexos" 
ON public.anexos 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem criar anexos" 
ON public.anexos 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar anexos" 
ON public.anexos 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem deletar anexos" 
ON public.anexos 
FOR DELETE 
TO authenticated
USING (true);