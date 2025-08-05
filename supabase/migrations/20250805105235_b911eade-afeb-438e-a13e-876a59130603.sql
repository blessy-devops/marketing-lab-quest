-- Adicionar novos campos à tabela resultados
ALTER TABLE public.resultados 
ADD COLUMN tags TEXT[],
ADD COLUMN matriz_ice JSONB,
ADD COLUMN experimento_sucesso BOOLEAN DEFAULT false;

-- Adicionar campo de experimento de sucesso à tabela experimentos
ALTER TABLE public.experimentos 
ADD COLUMN experimento_sucesso BOOLEAN DEFAULT false;

-- Criar índice para otimizar consultas de experimentos de sucesso
CREATE INDEX idx_experimentos_sucesso ON public.experimentos(experimento_sucesso) 
WHERE experimento_sucesso = true;

-- Criar índice para tags nos resultados
CREATE INDEX idx_resultados_tags ON public.resultados USING GIN(tags) 
WHERE tags IS NOT NULL;