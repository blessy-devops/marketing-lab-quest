-- Create table to track Oráculo consultations
CREATE TABLE public.oraculo_consultas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID,
  pergunta TEXT NOT NULL,
  pergunta_normalizada TEXT,
  tipo_consulta TEXT,
  resposta JSONB,
  tokens_usados INTEGER,
  tempo_resposta_ms INTEGER,
  experimento_gerado_id UUID,
  from_cache BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track complete analytics cycle
CREATE TABLE public.ciclo_completo_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID,
  consulta_id UUID,
  experimento_id UUID,
  resultado_id UUID,
  playbook_id UUID,
  sucesso BOOLEAN,
  roi_obtido NUMERIC,
  tempo_total_dias INTEGER,
  status TEXT DEFAULT 'consulta_realizada',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_oraculo_consultas_usuario_id ON public.oraculo_consultas(usuario_id);
CREATE INDEX idx_oraculo_consultas_created_at ON public.oraculo_consultas(created_at);
CREATE INDEX idx_oraculo_consultas_tipo ON public.oraculo_consultas(tipo_consulta);
CREATE INDEX idx_oraculo_consultas_experimento ON public.oraculo_consultas(experimento_gerado_id);

CREATE INDEX idx_ciclo_analytics_usuario_id ON public.ciclo_completo_analytics(usuario_id);
CREATE INDEX idx_ciclo_analytics_status ON public.ciclo_completo_analytics(status);
CREATE INDEX idx_ciclo_analytics_sucesso ON public.ciclo_completo_analytics(sucesso);
CREATE INDEX idx_ciclo_analytics_consulta ON public.ciclo_completo_analytics(consulta_id);

-- Create trigger for automatic timestamp updates on oraculo_consultas
CREATE TRIGGER update_oraculo_consultas_updated_at
BEFORE UPDATE ON public.oraculo_consultas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on ciclo_completo_analytics
CREATE TRIGGER update_ciclo_analytics_updated_at
BEFORE UPDATE ON public.ciclo_completo_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get Oráculo metrics
CREATE OR REPLACE FUNCTION public.get_oraculo_metrics(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_consultas BIGINT,
  consultas_com_experimento BIGINT,
  taxa_conversao_experimento NUMERIC,
  experimentos_com_sucesso BIGINT,
  taxa_sucesso_experimentos NUMERIC,
  roi_medio NUMERIC,
  tempo_medio_ciclo NUMERIC,
  consultas_por_tipo JSONB,
  tendencia_uso JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH consultas_periodo AS (
    SELECT * FROM public.oraculo_consultas 
    WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  ),
  analytics_periodo AS (
    SELECT * FROM public.ciclo_completo_analytics
    WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  )
  SELECT 
    -- Total de consultas
    (SELECT COUNT(*) FROM consultas_periodo)::BIGINT,
    
    -- Consultas que geraram experimento
    (SELECT COUNT(*) FROM consultas_periodo WHERE experimento_gerado_id IS NOT NULL)::BIGINT,
    
    -- Taxa de conversão para experimento
    CASE 
      WHEN (SELECT COUNT(*) FROM consultas_periodo) > 0 
      THEN (SELECT COUNT(*) FROM consultas_periodo WHERE experimento_gerado_id IS NOT NULL)::NUMERIC * 100.0 / 
           (SELECT COUNT(*) FROM consultas_periodo)::NUMERIC
      ELSE 0
    END,
    
    -- Experimentos com sucesso
    (SELECT COUNT(*) FROM analytics_periodo WHERE sucesso = true)::BIGINT,
    
    -- Taxa de sucesso dos experimentos
    CASE 
      WHEN (SELECT COUNT(*) FROM analytics_periodo WHERE experimento_id IS NOT NULL) > 0 
      THEN (SELECT COUNT(*) FROM analytics_periodo WHERE sucesso = true)::NUMERIC * 100.0 / 
           (SELECT COUNT(*) FROM analytics_periodo WHERE experimento_id IS NOT NULL)::NUMERIC
      ELSE 0
    END,
    
    -- ROI médio
    (SELECT COALESCE(AVG(roi_obtido), 0) FROM analytics_periodo WHERE roi_obtido IS NOT NULL),
    
    -- Tempo médio do ciclo completo (em dias)
    (SELECT COALESCE(AVG(tempo_total_dias), 0) FROM analytics_periodo WHERE tempo_total_dias IS NOT NULL),
    
    -- Consultas por tipo
    (SELECT COALESCE(jsonb_object_agg(tipo_consulta, cnt), '{}'::jsonb)
     FROM (
       SELECT tipo_consulta, COUNT(*) as cnt 
       FROM consultas_periodo 
       WHERE tipo_consulta IS NOT NULL
       GROUP BY tipo_consulta
     ) t),
    
    -- Tendência de uso (últimos 7 dias)
    (SELECT COALESCE(jsonb_object_agg(dia, consultas), '{}'::jsonb)
     FROM (
       SELECT DATE(created_at) as dia, COUNT(*) as consultas
       FROM consultas_periodo
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY dia
     ) t);
END;
$$;