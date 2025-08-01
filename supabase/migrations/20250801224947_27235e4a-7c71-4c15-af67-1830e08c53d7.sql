-- Inserir sugestões de tipos por canal
INSERT INTO public.canal_tipo_sugestao (canal, tipo_id, peso)
SELECT canal, tipo_id, peso FROM (
  VALUES
  -- TikTok e TikTok Shop - foco em criativo
  ('TikTok', (SELECT id FROM public.tipos_experimento WHERE codigo = 'criativo'), 3),
  ('TikTok Shop', (SELECT id FROM public.tipos_experimento WHERE codigo = 'criativo'), 3),
  ('TikTok', (SELECT id FROM public.tipos_experimento WHERE codigo = 'oferta'), 2),
  ('TikTok Shop', (SELECT id FROM public.tipos_experimento WHERE codigo = 'oferta'), 2),
  
  -- Email Marketing - foco em email, copy e ofertas
  ('E-mail Marketing', (SELECT id FROM public.tipos_experimento WHERE codigo = 'email'), 3),
  ('E-mail Marketing', (SELECT id FROM public.tipos_experimento WHERE codigo = 'copy'), 2),
  ('E-mail Marketing', (SELECT id FROM public.tipos_experimento WHERE codigo = 'oferta'), 2),
  
  -- Meta Ads - criativo, audiência e copy
  ('Meta Ads', (SELECT id FROM public.tipos_experimento WHERE codigo = 'criativo'), 3),
  ('Meta Ads', (SELECT id FROM public.tipos_experimento WHERE codigo = 'audiencia'), 3),
  ('Meta Ads', (SELECT id FROM public.tipos_experimento WHERE codigo = 'copy'), 2),
  
  -- Google Ads - audiência, copy e landing page
  ('Google Ads', (SELECT id FROM public.tipos_experimento WHERE codigo = 'audiencia'), 3),
  ('Google Ads', (SELECT id FROM public.tipos_experimento WHERE codigo = 'copy'), 2),
  ('Google Ads', (SELECT id FROM public.tipos_experimento WHERE codigo = 'landing_page'), 2),
  
  -- E-commerce - produto, preço e landing page
  ('E-commerce - Home', (SELECT id FROM public.tipos_experimento WHERE codigo = 'produto'), 3),
  ('E-commerce - PDP', (SELECT id FROM public.tipos_experimento WHERE codigo = 'produto'), 3),
  ('E-commerce - Home', (SELECT id FROM public.tipos_experimento WHERE codigo = 'preco'), 2),
  ('E-commerce - PDP', (SELECT id FROM public.tipos_experimento WHERE codigo = 'preco'), 2),
  ('E-commerce - Home', (SELECT id FROM public.tipos_experimento WHERE codigo = 'landing_page'), 2),
  ('E-commerce - PDP', (SELECT id FROM public.tipos_experimento WHERE codigo = 'landing_page'), 2),
  
  -- Instagram - criativo e copy
  ('Instagram', (SELECT id FROM public.tipos_experimento WHERE codigo = 'criativo'), 3),
  ('Instagram', (SELECT id FROM public.tipos_experimento WHERE codigo = 'copy'), 2),
  
  -- WhatsApp - copy e oferta
  ('WhatsApp - Grupos', (SELECT id FROM public.tipos_experimento WHERE codigo = 'copy'), 3),
  ('WhatsApp - API Oficial', (SELECT id FROM public.tipos_experimento WHERE codigo = 'copy'), 3),
  ('WhatsApp - Grupos', (SELECT id FROM public.tipos_experimento WHERE codigo = 'oferta'), 2),
  ('WhatsApp - API Oficial', (SELECT id FROM public.tipos_experimento WHERE codigo = 'oferta'), 2),
  
  -- Influencers/Creators - criativo e copy
  ('Influencers', (SELECT id FROM public.tipos_experimento WHERE codigo = 'criativo'), 3),
  ('Creators comissionadas', (SELECT id FROM public.tipos_experimento WHERE codigo = 'criativo'), 3),
  ('Creators pagas', (SELECT id FROM public.tipos_experimento WHERE codigo = 'criativo'), 3),
  ('Afiliadas', (SELECT id FROM public.tipos_experimento WHERE codigo = 'copy'), 2),
  
  -- Pinterest Ads - criativo
  ('Pinterest Ads', (SELECT id FROM public.tipos_experimento WHERE codigo = 'criativo'), 3),
  ('Pinterest Ads', (SELECT id FROM public.tipos_experimento WHERE codigo = 'copy'), 2),
  
  -- Atendimento e Comercial - copy
  ('Atendimento', (SELECT id FROM public.tipos_experimento WHERE codigo = 'copy'), 3),
  ('Comercial', (SELECT id FROM public.tipos_experimento WHERE codigo = 'copy'), 3),
  ('Atendimento', (SELECT id FROM public.tipos_experimento WHERE codigo = 'oferta'), 2),
  ('Comercial', (SELECT id FROM public.tipos_experimento WHERE codigo = 'oferta'), 2)
) AS t(canal, tipo_id, peso);