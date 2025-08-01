-- Inserir experimento de campanha promocional de frete grátis
INSERT INTO public.experimentos (
  nome,
  tipo,
  data_inicio,
  data_fim,
  status,
  responsavel,
  canais,
  hipotese
) VALUES (
  'Campanha Frete Grátis 48h',
  'promocao',
  '2024-07-15',
  '2024-07-16',
  'concluido',
  'Equipe Marketing',
  ARRAY['ecommerce', 'instagram', 'facebook', 'google_ads', 'email'],
  'Oferecer frete grátis por 48h vai aumentar a taxa de conversão do ecommerce de 3% para pelo menos 5%, gerando mais vendas e melhor experiência do cliente'
);

-- Inserir métricas do experimento
INSERT INTO public.metricas (
  experimento_id,
  tipo,
  nome,
  unidade,
  valor
) VALUES 
(
  (SELECT id FROM public.experimentos WHERE nome = 'Campanha Frete Grátis 48h'),
  'conversao',
  'Taxa de Conversão Ecommerce',
  '%',
  6.5
),
(
  (SELECT id FROM public.experimentos WHERE nome = 'Campanha Frete Grátis 48h'),
  'meta',
  'Meta Taxa de Conversão',
  '%',
  3.0
);

-- Inserir resultado do experimento
INSERT INTO public.resultados (
  experimento_id,
  sucesso,
  roi,
  fatos,
  aprendizados,
  causas,
  acoes
) VALUES (
  (SELECT id FROM public.experimentos WHERE nome = 'Campanha Frete Grátis 48h'),
  true,
  2.17,
  'Taxa de conversão atingiu 6,5% vs meta de 3%. Campanha executada em todos os canais exceto Mercado Livre e TikTok Shop. Período de 48h (15-16 de julho de 2024).',
  'Frete grátis é um forte incentivo para conversão. Exclusão do Mercado Livre e TikTok Shop não impactou negativamente. Prazo curto de 48h criou senso de urgência.',
  'Barreira do custo de frete eliminada. Comunicação clara sobre prazo limitado. Canais digitais com boa penetração.',
  'Considerar repetir estratégia em datas sazonais. Avaliar inclusão dos canais excluídos. Testar diferentes durações de campanha.'
);