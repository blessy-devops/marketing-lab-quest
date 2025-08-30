-- Fix the search_path for the new function
CREATE OR REPLACE FUNCTION get_user_conversations()
RETURNS TABLE (
    conversation_id UUID,
    first_message TEXT,
    last_updated TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT DISTINCT ON (h.conversation_id)
      h.conversation_id,
      (SELECT content FROM oraculo_historico WHERE conversation_id = h.conversation_id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as first_message,
      h.created_at as last_updated
  FROM
      oraculo_historico h
  WHERE
      h.user_id = auth.uid()
  ORDER BY
      h.conversation_id, h.created_at DESC;
$$;