-- Full migration: create tables, triggers, RLS, then seed

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

-- 2) Triggers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_canais_updated_at') THEN
    CREATE TRIGGER update_canais_updated_at
    BEFORE UPDATE ON public.canais
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subcanais_updated_at') THEN
    CREATE TRIGGER update_subcanais_updated_at
    BEFORE UPDATE ON public.subcanais
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3) RLS
ALTER TABLE public.canais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcanais ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view canais' AND schemaname='public' AND tablename='canais'
  ) THEN
    CREATE POLICY "Authenticated users can view canais" ON public.canais FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view subcanais' AND schemaname='public' AND tablename='subcanais'
  ) THEN
    CREATE POLICY "Authenticated users can view subcanais" ON public.subcanais FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage canais' AND schemaname='public' AND tablename='canais'
  ) THEN
    CREATE POLICY "Admins can manage canais" ON public.canais FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage subcanais' AND schemaname='public' AND tablename='subcanais'
  ) THEN
    CREATE POLICY "Admins can manage subcanais" ON public.subcanais FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 4) Seed in a single DO block
DO $$
DECLARE
  v_ecommerce UUID;
  v_creators UUID;
  v_midia_paga UUID;
  v_organico UUID;
  v_crm UUID;
  v_outros UUID;
BEGIN
  INSERT INTO public.canais (nome, icone, ordem) VALUES
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

  INSERT INTO public.subcanais (canal_id, nome, icone, ordem) VALUES
    (v_ecommerce, 'E-commerce - Home', 'ShoppingCart', 1),
    (v_ecommerce, 'E-commerce - PDP',  'Package',      2)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

  INSERT INTO public.subcanais (canal_id, nome, icone, ordem) VALUES
    (v_creators, 'Influencers',            'Users',      1),
    (v_creators, 'Creators comissionadas', 'UserCheck',  2),
    (v_creators, 'Creators pagas',         'DollarSign', 3),
    (v_creators, 'Afiliadas',              'Heart',      4),
    (v_creators, 'Renata Lima',            'Users',      5)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

  INSERT INTO public.subcanais (canal_id, nome, icone, ordem) VALUES
    (v_midia_paga, 'Meta Ads',      'Facebook', 1),
    (v_midia_paga, 'Google Ads',    'Search',   2),
    (v_midia_paga, 'TikTok Ads',    'Video',    3),
    (v_midia_paga, 'Pinterest Ads', 'Heart',    4)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

  INSERT INTO public.subcanais (canal_id, nome, icone, ordem) VALUES
    (v_organico, 'Instagram',        'Instagram', 1),
    (v_organico, 'TikTok',           'Video',     2),
    (v_organico, 'Google Orgânico',  'Search',    3)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

  INSERT INTO public.subcanais (canal_id, nome, icone, ordem) VALUES
    (v_crm, 'E-mail Marketing',      'Mail',          1),
    (v_crm, 'WhatsApp - Grupos',     'MessageCircle', 2),
    (v_crm, 'WhatsApp - API Oficial','Phone',         3)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;

  INSERT INTO public.subcanais (canal_id, nome, icone, ordem) VALUES
    (v_outros, 'Atendimento',          'Headphones', 1),
    (v_outros, 'Comercial',            'Briefcase',  2),
    (v_outros, 'Direto / Sem Origem',  'Globe',      3),
    (v_outros, 'Marketplace',          'Store',      4),
    (v_outros, 'TikTok Shop',          'Store',      5),
    (v_outros, 'B2B',                  'Building',   6)
  ON CONFLICT (canal_id, nome) DO UPDATE SET nome = EXCLUDED.nome;
END $$;