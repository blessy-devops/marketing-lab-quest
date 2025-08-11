-- Create channels (canais) and subchannels (subcanais) tables with RLS and seed data

-- 1) Tables
CREATE TABLE IF NOT EXISTS public.canais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  icone TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subcanais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canal_id UUID NOT NULL REFERENCES public.canais(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  icone TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subcanais_unique_per_canal UNIQUE (canal_id, nome)
);

-- 2) Timestamps trigger
CREATE TRIGGER update_canais_updated_at
BEFORE UPDATE ON public.canais
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subcanais_updated_at
BEFORE UPDATE ON public.subcanais
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) RLS
ALTER TABLE public.canais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcanais ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Authenticated users can view canais' AND tablename = 'canais'
  ) THEN
    CREATE POLICY "Authenticated users can view canais"
    ON public.canais
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Authenticated users can view subcanais' AND tablename = 'subcanais'
  ) THEN
    CREATE POLICY "Authenticated users can view subcanais"
    ON public.subcanais
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Only admins can manage (insert/update/delete)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins can manage canais' AND tablename = 'canais'
  ) THEN
    CREATE POLICY "Admins can manage canais"
    ON public.canais
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Admins can manage subcanais' AND tablename = 'subcanais'
  ) THEN
    CREATE POLICY "Admins can manage subcanais"
    ON public.subcanais
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 4) Seed data (idempotent)
WITH upsert_canais AS (
  INSERT INTO public.canais (nome, icone, ordem)
  VALUES
    ('E-commerce', 'ShoppingCart', 1),
    ('Creators/Influencers', 'Users', 2),
    ('Mídia Paga', 'Facebook', 3),
    ('Orgânico/Social', 'Instagram', 4),
    ('CRM', 'Mail', 5),
    ('Outros', 'Store', 6)
  ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
  RETURNING id, nome
)
, ids AS (
  SELECT 
    (SELECT id FROM upsert_canais WHERE nome = 'E-commerce')            AS ecommerce_id,
    (SELECT id FROM upsert_canais WHERE nome = 'Creators/Influencers')  AS creators_id,
    (SELECT id FROM upsert_canais WHERE nome = 'Mídia Paga')            AS midia_paga_id,
    (SELECT id FROM upsert_canais WHERE nome = 'Orgânico/Social')       AS organico_id,
    (SELECT id FROM upsert_canais WHERE nome = 'CRM')                   AS crm_id,
    (SELECT id FROM upsert_canais WHERE nome = 'Outros')                AS outros_id
)
-- E-commerce subcanais
INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
SELECT ecommerce_id, x.nome, x.icone, x.ordem FROM ids,
(VALUES
  ('E-commerce - Home', 'ShoppingCart', 1),
  ('E-commerce - PDP',  'Package', 2)
) AS x(nome, icone, ordem)
ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

-- Creators/Influencers subcanais (inclui Renata Lima)
INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
SELECT creators_id, x.nome, x.icone, x.ordem FROM ids,
(VALUES
  ('Influencers',            'Users',      1),
  ('Creators comissionadas', 'UserCheck',  2),
  ('Creators pagas',         'DollarSign', 3),
  ('Afiliadas',              'Heart',      4),
  ('Renata Lima',            'Users',      5)
) AS x(nome, icone, ordem)
ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

-- Mídia Paga
INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
SELECT midia_paga_id, x.nome, x.icone, x.ordem FROM ids,
(VALUES
  ('Meta Ads',     'Facebook', 1),
  ('Google Ads',   'Search',   2),
  ('TikTok Ads',   'Video',    3),
  ('Pinterest Ads','Heart',    4)
) AS x(nome, icone, ordem)
ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

-- Orgânico/Social
INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
SELECT organico_id, x.nome, x.icone, x.ordem FROM ids,
(VALUES
  ('Instagram',       'Instagram', 1),
  ('TikTok',          'Video',     2),
  ('Google Orgânico', 'Search',    3)
) AS x(nome, icone, ordem)
ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

-- CRM
INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
SELECT crm_id, x.nome, x.icone, x.ordem FROM ids,
(VALUES
  ('E-mail Marketing',     'Mail',          1),
  ('WhatsApp - Grupos',    'MessageCircle', 2),
  ('WhatsApp - API Oficial','Phone',        3)
) AS x(nome, icone, ordem)
ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

-- Outros
INSERT INTO public.subcanais (canal_id, nome, icone, ordem)
SELECT outros_id, x.nome, x.icone, x.ordem FROM ids,
(VALUES
  ('Atendimento',           'Headphones', 1),
  ('Comercial',             'Briefcase',  2),
  ('Direto / Sem Origem',   'Globe',      3),
  ('Marketplace',           'Store',      4),
  ('TikTok Shop',           'Store',      5),
  ('B2B',                   'Building',   6)
) AS x(nome, icone, ordem)
ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;
