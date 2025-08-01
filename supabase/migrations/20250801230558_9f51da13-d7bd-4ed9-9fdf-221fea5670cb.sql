-- Continuação da inserção de subtipos

-- Copy/Narrativa
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Título/Headline', 'Título principal do anúncio ou página', 1),
  ('Descrição de produto', 'Texto detalhado sobre o produto', 2),
  ('CTA (Call to Action)', 'Botões e chamadas para ação', 3),
  ('Subject line (email)', 'Assunto do email', 4),
  ('Bio/Perfil', 'Descrição de perfil social', 5),
  ('Script de vídeo', 'Roteiro para vídeos', 6),
  ('Copy de anúncio', 'Texto do anúncio', 7),
  ('FAQ', 'Perguntas frequentes', 8),
  ('Prova social', 'Depoimentos e avaliações', 9),
  ('Urgência/Escassez', 'Gatilhos de urgência', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'copy';

-- Audiência  
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Segmentação demográfica', 'Idade, gênero, localização', 1),
  ('Interesses', 'Baseado em interesses e hobbies', 2),
  ('Comportamento', 'Ações e padrões de compra', 3),
  ('Lookalike', 'Públicos similares', 4),
  ('Retargeting', 'Remarketing para visitantes', 5),
  ('Base de clientes', 'Lista própria de clientes', 6),
  ('Exclusão de públicos', 'Públicos a excluir', 7),
  ('Geolocalização', 'Segmentação por local', 8),
  ('Device targeting', 'Desktop vs mobile', 9),
  ('Custom audience', 'Audiências personalizadas', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'audiencia';

-- Landing Page
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Hero section', 'Primeira dobra da página', 1),
  ('Formulário', 'Campos e estrutura do form', 2),
  ('Depoimentos', 'Seção de prova social', 3),
  ('FAQ', 'Perguntas frequentes', 4),
  ('Comparativo', 'Tabela comparativa', 5),
  ('Vídeo de vendas', 'VSL ou demonstração', 6),
  ('Contador/Timer', 'Urgência temporal', 7),
  ('Pop-up', 'Janelas de conversão', 8),
  ('Exit intent', 'Captura na saída', 9),
  ('Chatbot', 'Atendimento automatizado', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'landing_page';

-- Email Marketing
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Horário de envio', 'Melhor momento para enviar', 1),
  ('Frequência', 'Quantidade de envios', 2),
  ('Segmentação de base', 'Divisão da lista', 3),
  ('Template', 'Design do email', 4),
  ('Personalização', 'Elementos personalizados', 5),
  ('Automação/Flow', 'Sequências automáticas', 6),
  ('Re-engajamento', 'Recuperar inativos', 7),
  ('Carrinho abandonado', 'Recuperação de vendas', 8),
  ('Pós-venda', 'Comunicação após compra', 9),
  ('Newsletter', 'Conteúdo informativo', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'email';

-- Preço
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Aumento de preço', 'Testar preços maiores', 1),
  ('Redução de preço', 'Testar preços menores', 2),
  ('Preço psicológico', 'R$ 99 vs R$ 100', 3),
  ('Preço dinâmico', 'Variação por demanda', 4),
  ('Preço por volume', 'Desconto progressivo', 5),
  ('Preço premium', 'Posicionamento alto', 6),
  ('Preço de entrada', 'Isca para novos clientes', 7),
  ('Ancoragem', 'Comparação de preços', 8),
  ('Decoy effect', 'Opção chamariz', 9),
  ('Bundling', 'Pacotes de produtos', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'preco';

-- Produto
INSERT INTO public.subtipos_experimento (tipo_id, nome, descricao, ordem)
SELECT te.id, t.nome, t.descricao, t.ordem FROM (
  VALUES
  ('Nova feature', 'Funcionalidade adicional', 1),
  ('Embalagem', 'Design da embalagem', 2),
  ('Tamanho/Quantidade', 'Variações de volume', 3),
  ('Variação/Cor', 'Opções de cores', 4),
  ('Kit/Combo', 'Combinações de produtos', 5),
  ('Edição limitada', 'Versões exclusivas', 6),
  ('Personalização', 'Customização pelo cliente', 7),
  ('Sustentabilidade', 'Aspectos ecológicos', 8),
  ('Ingredientes', 'Composição do produto', 9),
  ('Apresentação', 'Forma de mostrar', 10)
) AS t(nome, descricao, ordem)
CROSS JOIN public.tipos_experimento te WHERE te.codigo = 'produto';

-- Criar view para facilitar consultas
CREATE VIEW public.v_tipos_experimento_completo AS
SELECT 
  t.id,
  t.codigo,
  t.nome,
  t.descricao,
  t.icone,
  t.cor,
  t.ordem,
  t.ativo,
  COUNT(DISTINCT s.id) as total_subtipos,
  COUNT(DISTINCT e.id) as total_experimentos
FROM public.tipos_experimento t
LEFT JOIN public.subtipos_experimento s ON s.tipo_id = t.id
LEFT JOIN public.experimentos e ON e.tipo_experimento_id = t.id
GROUP BY t.id, t.codigo, t.nome, t.descricao, t.icone, t.cor, t.ordem, t.ativo;