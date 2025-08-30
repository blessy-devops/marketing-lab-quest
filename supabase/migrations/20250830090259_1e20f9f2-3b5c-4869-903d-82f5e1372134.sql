
-- 1) Habilitar Realtime para a tabela de histórico do Oráculo
ALTER TABLE public.oraculo_historico REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação supabase_realtime (idempotente em ambientes que já possuem)
ALTER PUBLICATION supabase_realtime ADD TABLE public.oraculo_historico;

-- 2) Índice para acelerar filtros por conversation_id
CREATE INDEX IF NOT EXISTS idx_oraculo_historico_conversation_id
  ON public.oraculo_historico (conversation_id);
