-- Inserir tipos principais
INSERT INTO public.tipos_experimento (codigo, nome, descricao, icone, cor, ordem) VALUES
('criativo', 'Criativo', 'Experimentos com formatos e estilos de conteúdo visual', 'Palette', '#8B5CF6', 1),
('oferta', 'Oferta', 'Testes de propostas de valor e incentivos de compra', 'Tag', '#10B981', 2),
('copy', 'Copy/Narrativa', 'Experimentos com textos e mensagens', 'Type', '#F59E0B', 3),
('audiencia', 'Audiência', 'Testes de segmentação e públicos', 'Users', '#3B82F6', 4),
('landing_page', 'Landing Page', 'Otimizações de páginas de conversão', 'Layout', '#EF4444', 5),
('email', 'Email Marketing', 'Experimentos em campanhas de email', 'Mail', '#6366F1', 6),
('preco', 'Preço', 'Testes de estratégias de precificação', 'DollarSign', '#14B8A6', 7),
('produto', 'Produto', 'Experimentos com variações de produto', 'Package', '#EC4899', 8);

-- Inserir subtipos para Criativo
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem) 
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES 
  ('Imagem estática', 'Foto ou arte sem movimento', 1),
  ('Vídeo curto (< 30s)', 'Conteúdo em vídeo de até 30 segundos', 2),
  ('Vídeo longo (> 30s)', 'Conteúdo em vídeo acima de 30 segundos', 3),
  ('Carrossel', 'Múltiplas imagens em sequência', 4),
  ('Stories', 'Formato vertical para stories', 5),
  ('Reels', 'Vídeos curtos no formato Reels', 6),
  ('UGC (User Generated Content)', 'Conteúdo gerado por usuários', 7),
  ('Motion graphics', 'Animações e gráficos em movimento', 8),
  ('Product shots', 'Fotos focadas no produto', 9),
  ('Lifestyle', 'Produto em contexto de uso', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'criativo';

-- Inserir subtipos para Oferta
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Desconto percentual', 'Desconto em porcentagem (10%, 20%, etc)', 1),
  ('Desconto fixo', 'Valor fixo de desconto (R$ 10, R$ 50)', 2),
  ('Frete grátis', 'Isenção de taxa de entrega', 3),
  ('Brinde', 'Produto adicional gratuito', 4),
  ('Combo/Bundle', 'Conjunto de produtos com desconto', 5),
  ('Primeira compra', 'Benefício exclusivo para novos clientes', 6),
  ('Programa de pontos', 'Acúmulo de pontos para trocar', 7),
  ('Cashback', 'Devolução de parte do valor', 8),
  ('Parcelamento', 'Divisão do pagamento', 9),
  ('Garantia estendida', 'Extensão do prazo de garantia', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'oferta';

-- Inserir subtipos para Copy/Narrativa
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Headline principal', 'Título ou chamada principal', 1),
  ('Descrição do produto', 'Texto descritivo do produto', 2),
  ('Call-to-action (CTA)', 'Texto do botão de ação', 3),
  ('Social proof', 'Depoimentos e avaliações', 4),
  ('Urgência/Escassez', 'Textos que criam senso de urgência', 5),
  ('Benefícios vs Features', 'Foco em benefícios ou características', 6),
  ('Tom de voz', 'Estilo da comunicação (formal, casual)', 7),
  ('Storytelling', 'Narrativa em formato de história', 8),
  ('Problema/Solução', 'Estrutura problema-solução', 9),
  ('Objeções', 'Textos que respondem objeções', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'copy';

-- Inserir subtipos para Audiência
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Demografia', 'Idade, gênero, localização', 1),
  ('Interesses', 'Hobbies e temas de interesse', 2),
  ('Comportamento', 'Padrões de comportamento online', 3),
  ('Lookalike', 'Audiências similares aos clientes', 4),
  ('Custom audiences', 'Listas personalizadas', 5),
  ('Retargeting', 'Visitantes do site/app', 6),
  ('Cold audience', 'Público totalmente novo', 7),
  ('Warm audience', 'Público que já conhece a marca', 8),
  ('Competitors', 'Interessados em concorrentes', 9),
  ('Device/Platform', 'Tipo de dispositivo usado', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'audiencia';

-- Inserir subtipos para Landing Page
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Layout/Design', 'Estrutura e design da página', 1),
  ('Formulário', 'Campos e tamanho do formulário', 2),
  ('Botão CTA', 'Posição, cor e texto do botão', 3),
  ('Hero section', 'Seção principal da página', 4),
  ('Social proof', 'Depoimentos e logos de clientes', 5),
  ('FAQ', 'Seção de perguntas frequentes', 6),
  ('Checkout flow', 'Processo de finalização', 7),
  ('Mobile vs Desktop', 'Otimização por dispositivo', 8),
  ('Loading speed', 'Velocidade de carregamento', 9),
  ('Navigation', 'Menu e navegação', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'landing_page';

-- Inserir subtipos para Email Marketing
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Subject line', 'Linha de assunto do email', 1),
  ('Sender name', 'Nome do remetente', 2),
  ('Timing/Horário', 'Dia e hora de envio', 3),
  ('Frequency', 'Frequência de envio', 4),
  ('Template design', 'Layout e design do email', 5),
  ('Personalization', 'Personalização do conteúdo', 6),
  ('Segmentation', 'Segmentação da lista', 7),
  ('A/B subject', 'Teste de assunto', 8),
  ('Content length', 'Tamanho do conteúdo', 9),
  ('CTA placement', 'Posição do call-to-action', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'email';

-- Inserir subtipos para Preço
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Preço base', 'Valor principal do produto', 1),
  ('Pricing tiers', 'Diferentes faixas de preço', 2),
  ('Payment terms', 'Condições de pagamento', 3),
  ('Currency display', 'Formato de exibição do preço', 4),
  ('Discount timing', 'Quando aplicar desconto', 5),
  ('Price anchoring', 'Preço de referência (ex: "de/por")', 6),
  ('Free trial', 'Período de teste gratuito', 7),
  ('Subscription vs One-time', 'Recorrente vs pagamento único', 8),
  ('Regional pricing', 'Preços por região', 9),
  ('Bundle pricing', 'Preço de pacotes', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'preco';

-- Inserir subtipos para Produto
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Product features', 'Funcionalidades do produto', 1),
  ('Product variations', 'Cores, tamanhos, modelos', 2),
  ('Packaging', 'Embalagem do produto', 3),
  ('Product bundling', 'Combinação de produtos', 4),
  ('Product positioning', 'Como o produto é posicionado', 5),
  ('Quality/Materials', 'Qualidade e materiais', 6),
  ('Size/Quantity', 'Tamanho ou quantidade', 7),
  ('Product naming', 'Nome do produto', 8),
  ('Product category', 'Categoria do produto', 9),
  ('Product presentation', 'Forma de apresentação', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'produto';