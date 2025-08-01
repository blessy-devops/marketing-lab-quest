-- Inserir algumas notificações de exemplo
INSERT INTO public.notificacoes (tipo, titulo, descricao, experimento_id, lida) 
SELECT 
  'experimento_concluido',
  'Experimento "' || nome || '" foi concluído',
  'O experimento foi finalizado e está pronto para análise dos resultados.',
  id,
  false
FROM public.experimentos 
WHERE status = 'concluido'
LIMIT 3;

INSERT INTO public.notificacoes (tipo, titulo, descricao, lida) VALUES
('novo_insight', 'Novo insight descoberto', 'Padrão interessante identificado nos últimos experimentos de email.', false),
('prazo_proximo', 'Experimentos com prazo próximo', '3 experimentos precisam de atenção nos próximos 2 dias.', false);