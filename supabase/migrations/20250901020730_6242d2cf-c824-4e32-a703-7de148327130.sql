
-- Atualiza a função para retornar 'title' (do role='system') com fallback para a primeira mensagem não-system
create or replace function public.get_user_conversations()
returns table (
  conversation_id uuid,
  title text,
  last_updated timestamptz
)
language sql
stable
as $$
  with base as (
    select 
      conversation_id,
      max(created_at) as last_updated
    from public.oraculo_historico
    where user_id = auth.uid()
    group by conversation_id
  ),
  titles as (
    -- último "system" vira título
    select distinct on (conversation_id)
      conversation_id,
      content as system_title,
      created_at
    from public.oraculo_historico
    where user_id = auth.uid()
      and role = 'system'
    order by conversation_id, created_at desc
  ),
  first_msgs as (
    -- fallback: primeira mensagem não-system
    select distinct on (conversation_id)
      conversation_id,
      content as first_message
    from public.oraculo_historico
    where user_id = auth.uid()
      and role <> 'system'
    order by conversation_id, created_at asc
  )
  select 
    b.conversation_id,
    coalesce(t.system_title, fm.first_message, 'Conversa sem título') as title,
    b.last_updated
  from base b
  left join titles t using (conversation_id)
  left join first_msgs fm using (conversation_id)
  order by b.last_updated desc
  limit 200;
$$;
