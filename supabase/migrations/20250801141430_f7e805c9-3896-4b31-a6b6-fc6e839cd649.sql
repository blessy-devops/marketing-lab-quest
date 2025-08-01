-- Inserir dados de exemplo para demonstração
INSERT INTO public.experimentos (nome, tipo, status, data_inicio, data_fim, responsavel, canais, hipotese) VALUES
('Teste A/B - CTA Header', 'criativo', 'concluido', '2024-01-01', '2024-01-15', 'Ana Silva', ARRAY['website', 'email'], 'Se alterarmos a cor do botão CTA de azul para verde, então aumentaremos a taxa de cliques em 15%'),
('Campanha Instagram Stories', 'campanha', 'em_andamento', '2024-01-20', '2024-02-20', 'João Santos', ARRAY['instagram', 'facebook'], 'Stories com vídeo geram mais engajamento que imagens estáticas'),
('Landing Page - Novo Layout', 'landing_page', 'concluido', '2023-12-15', '2024-01-05', 'Maria Costa', ARRAY['website'], 'Um layout mais limpo aumentará a conversão em 20%'),
('Promoção Black Friday', 'promocao', 'concluido', '2023-11-20', '2023-11-30', 'Carlos Lima', ARRAY['website', 'email', 'social'], 'Desconto progressivo gera mais urgência que desconto fixo'),
('Teste Narrativa Email', 'narrativa', 'em_andamento', '2024-01-25', '2024-02-25', 'Fernanda Reis', ARRAY['email'], 'Storytelling aumenta taxa de abertura de emails'),
('Canal YouTube Ads', 'canal', 'planejado', '2024-02-01', '2024-03-01', 'Pedro Oliveira', ARRAY['youtube'], 'YouTube Ads geram mais leads qualificados que Facebook Ads');

-- Inserir resultados para os experimentos concluídos
INSERT INTO public.resultados (experimento_id, sucesso, roi, aprendizados, fatos, causas, acoes) 
SELECT 
  e.id,
  CASE e.nome 
    WHEN 'Teste A/B - CTA Header' THEN true
    WHEN 'Landing Page - Novo Layout' THEN true  
    WHEN 'Promoção Black Friday' THEN false
  END as sucesso,
  CASE e.nome 
    WHEN 'Teste A/B - CTA Header' THEN 23.5
    WHEN 'Landing Page - Novo Layout' THEN 18.2
    WHEN 'Promoção Black Friday' THEN -5.3
  END as roi,
  CASE e.nome 
    WHEN 'Teste A/B - CTA Header' THEN 'A cor verde realmente gerou mais cliques, especialmente no mobile'
    WHEN 'Landing Page - Novo Layout' THEN 'Layout limpo funcionou bem, mas precisamos melhorar o formulário'
    WHEN 'Promoção Black Friday' THEN 'Desconto progressivo confundiu os usuários, preferiram desconto fixo'
  END as aprendizados,
  CASE e.nome 
    WHEN 'Teste A/B - CTA Header' THEN 'Taxa de clique aumentou 23.5% com botão verde'
    WHEN 'Landing Page - Novo Layout' THEN 'Conversão subiu 18.2% com novo design'
    WHEN 'Promoção Black Friday' THEN 'Conversão caiu 5.3% vs ano anterior'
  END as fatos,
  CASE e.nome 
    WHEN 'Teste A/B - CTA Header' THEN 'Verde transmite mais call-to-action que azul no nosso contexto'
    WHEN 'Landing Page - Novo Layout' THEN 'Menos distrações focaram atenção no objetivo principal'
    WHEN 'Promoção Black Friday' THEN 'Complexidade da oferta gerou confusão e abandono'
  END as causas,
  CASE e.nome 
    WHEN 'Teste A/B - CTA Header' THEN 'Implementar verde como padrão em todos os CTAs principais'
    WHEN 'Landing Page - Novo Layout' THEN 'Aplicar princípios do layout limpo em outras páginas'
    WHEN 'Promoção Black Friday' THEN 'Para próximas promoções, usar ofertas mais simples e diretas'
  END as acoes
FROM public.experimentos e 
WHERE e.status = 'concluido';

-- Inserir algumas métricas de exemplo
INSERT INTO public.metricas (experimento_id, tipo, nome, valor, unidade)
SELECT 
  e.id,
  'esperada' as tipo,
  'Taxa de Conversão' as nome,
  CASE e.nome 
    WHEN 'Teste A/B - CTA Header' THEN 5.0
    WHEN 'Landing Page - Novo Layout' THEN 8.0
    WHEN 'Promoção Black Friday' THEN 12.0
    WHEN 'Campanha Instagram Stories' THEN 3.5
    WHEN 'Teste Narrativa Email' THEN 15.0
  END as valor,
  '%' as unidade
FROM public.experimentos e 
WHERE e.nome IN ('Teste A/B - CTA Header', 'Landing Page - Novo Layout', 'Promoção Black Friday', 'Campanha Instagram Stories', 'Teste Narrativa Email');

INSERT INTO public.metricas (experimento_id, tipo, nome, valor, unidade)
SELECT 
  e.id,
  'realizada' as tipo,
  'Taxa de Conversão' as nome,
  CASE e.nome 
    WHEN 'Teste A/B - CTA Header' THEN 6.2
    WHEN 'Landing Page - Novo Layout' THEN 9.5
    WHEN 'Promoção Black Friday' THEN 11.4
  END as valor,
  '%' as unidade
FROM public.experimentos e 
WHERE e.status = 'concluido';