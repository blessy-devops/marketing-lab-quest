
-- Atualiza a função RPC para retornar títulos das conversas a partir de registros role='system'
CREATE OR REPLACE FUNCTION public.get_user_conversations()
RETURNS TABLE (
  conversation_id UUID,
  title TEXT,
  last_updated TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
      h.conversation_id,
      h.content AS title,
      h.created_at AS last_updated
  FROM
      oraculo_historico h
  WHERE
      h.user_id = auth.uid() AND h.role = 'system'
  ORDER BY
      h.created_at DESC;
$$;
