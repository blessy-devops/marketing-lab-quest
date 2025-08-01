-- Criar tabela de notificações
CREATE TABLE public.notificacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL, -- 'experimento_concluido', 'novo_insight', 'prazo_proximo'
  titulo text NOT NULL,
  descricao text,
  experimento_id uuid REFERENCES public.experimentos(id) ON DELETE CASCADE,
  lida boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Criar política pública para notificações
CREATE POLICY "Allow public access to notificacoes" ON public.notificacoes FOR ALL USING (true) WITH CHECK (true);

-- Adicionar índices para performance
CREATE INDEX idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX idx_notificacoes_created_at ON public.notificacoes(created_at DESC);
CREATE INDEX idx_notificacoes_tipo ON public.notificacoes(tipo);