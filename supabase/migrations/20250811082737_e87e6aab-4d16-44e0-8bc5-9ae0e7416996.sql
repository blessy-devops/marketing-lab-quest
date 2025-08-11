-- Seed data using a DO block so we can reuse variables
DO $$
DECLARE
  v_ecommerce UUID;
  v_creators UUID;
  v_midia_paga UUID;
  v_organico UUID;
  v_crm UUID;
  v_outros UUID;
BEGIN
  -- Upsert categorias principais em 'canais'
  INSERT INTO public.canais (nome, icone, ordem)
  VALUES
    ('E-commerce', 'ShoppingCart', 1),
    ('Creators/Influencers', 'Users', 2),
    ('Mídia Paga', 'Facebook', 3),
    ('Orgânico/Social', 'Instagram', 4),
    ('CRM', 'Mail', 5),
    ('Outros', 'Store', 6)
  ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome;

  SELECT id INTO v_ecommerce FROM public.canais WHERE nome = 'E-commerce';
  SELECT id INTO v_creators  FROM public.canais WHERE nome = 'Creators/Influencers';
  SELECT id INTO v_midia_paga FROM public.canais WHERE nome = 'Mídia Paga';
  SELECT id INTO v_organico  FROM public.canais WHERE nome = 'Orgânico/Social';
  SELECT id INTO v_crm       FROM public.canais WHERE nome = 'CRM';
  SELECT id INTO v_outros    FROM public.canais WHERE nome = 'Outros';

  -- E-commerce
  INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
  VALUES
    (v_ecommerce, 'E-commerce - Home', 'ShoppingCart', 1),
    (v_ecommerce, 'E-commerce - PDP',  'Package',      2)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

  -- Creators/Influencers (inclui Renata Lima)
  INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
  VALUES
    (v_creators, 'Influencers',            'Users',      1),
    (v_creators, 'Creators comissionadas', 'UserCheck',  2),
    (v_creators, 'Creators pagas',         'DollarSign', 3),
    (v_creators, 'Afiliadas',              'Heart',      4),
    (v_creators, 'Renata Lima',            'Users',      5)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

  -- Mídia Paga
  INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
  VALUES
    (v_midia_paga, 'Meta Ads',      'Facebook', 1),
    (v_midia_paga, 'Google Ads',    'Search',   2),
    (v_midia_paga, 'TikTok Ads',    'Video',    3),
    (v_midia_paga, 'Pinterest Ads', 'Heart',    4)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

  -- Orgânico/Social
  INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
  VALUES
    (v_organico, 'Instagram',        'Instagram', 1),
    (v_organico, 'TikTok',           'Video',     2),
    (v_organico, 'Google Orgânico',  'Search',    3)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

  -- CRM
  INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
  VALUES
    (v_crm, 'E-mail Marketing',      'Mail',          1),
    (v_crm, 'WhatsApp - Grupos',     'MessageCircle', 2),
    (v_crm, 'WhatsApp - API Oficial','Phone',         3)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

  -- Outros
  INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
  VALUES
    (v_outros, 'Atendimento',          'Headphones', 1),
    (v_outros, 'Comercial',            'Briefcase',  2),
    (v_outros, 'Direto / Sem Origem',  'Globe',      3),
    (v_outros, 'Marketplace',          'Store',      4),
    (v_outros, 'TikTok Shop',          'Store',      5),
    (v_outros, 'B2B',                  'Building',   6)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;
END $$;