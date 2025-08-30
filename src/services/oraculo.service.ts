interface OraculoRequest {
  pergunta: string;
  contexto?: string;
  tipo?: string;
}

interface N8nResponse {
  id: string;
  pergunta: string;
  pergunta_normalizada: string;
  resposta: string; // JSON string que precisa ser parseado
  tipo_consulta: string;
  tokens_usados: number;
  tempo_resposta_ms: number | null;
  hit_count: number;
  created_at: string;
  expires_at: string;
}

interface OraculoResponse {
  pergunta: string;
  contexto?: string;
  resposta: {
    resumo?: string;
    acoes?: string;
    dados?: string;
    alertas?: string;
    proximos_passos?: string;
    resposta_completa?: string;
  };
  metadados?: {
    fonte: string;
    agentes_consultados?: string[];
    experimentos_analisados?: number;
    cache?: boolean;
    processado_em?: string;
    id?: string;
    tokens_usados?: number;
    tempo_resposta_ms?: number;
    hit_count?: number;
  };
}

class OraculoService {
  private baseUrl: string | null = null;

  private async getWebhookUrl(): Promise<string> {
    if (this.baseUrl) {
      return this.baseUrl;
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        "https://zowjxaschkqivrltpfmp.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvd2p4YXNjaGtxaXZybHRwZm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTQzNzMsImV4cCI6MjA2OTYzMDM3M30.93njseLeE9y7KvAZFiPBL_Az4Kt38rAByifwVfVyi6U"
      );
      
      const { data } = await supabase
        .from('configuracoes_app')
        .select('valor')
        .eq('chave', 'ORACULO_WEBHOOK_URL')
        .single();

      if (data?.valor) {
        this.baseUrl = data.valor as string;
        console.log('URL do Oráculo carregada:', this.baseUrl);
        return this.baseUrl;
      }
    } catch (error) {
      console.warn('Erro ao carregar URL do banco:', error);
    }

    // Fallback para .env
    const envUrl = import.meta.env.VITE_ORACULO_WEBHOOK_URL;
    if (envUrl) {
      this.baseUrl = envUrl;
      console.log('Usando URL do .env:', this.baseUrl);
      return this.baseUrl;
    }

    throw new Error('URL do Oráculo não configurada');
  }

  async consultar(dados: OraculoRequest): Promise<OraculoResponse> {
    const webhookUrl = await this.getWebhookUrl();
    
    console.log('Chamando Oráculo em:', webhookUrl);
    const startTime = Date.now();
    
    // Criar AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const resultado = await response.json();
      
      const totalTime = Date.now() - startTime;
      console.log(`Tempo total (ms): ${totalTime}`);

      // Detectar formato da resposta
      let respostaParsed: any;
      let metadados: any = {};

      if (Array.isArray(resultado) && resultado.length > 0) {
        // Formato N8N array
        const n8nData = resultado[0];
        try {
          respostaParsed = JSON.parse(n8nData.resposta);
          metadados = {
            id: n8nData.id,
            tokens_usados: n8nData.tokens_usados,
            tempo_resposta_ms: n8nData.tempo_resposta_ms || totalTime,
            hit_count: n8nData.hit_count,
            cache: n8nData.hit_count > 0,
          };
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta:', parseError);
          throw new Error('Formato de resposta inválido');
        }
      } else if (resultado && typeof resultado === 'object') {
        // Formato objeto direto
        respostaParsed = resultado.resposta || resultado;
        metadados = {
          fontes: resultado.fontes || [],
          tempo_resposta_ms: totalTime,
        };
      } else {
        throw new Error('Resposta vazia ou formato inválido do servidor');
      }

      // Mapear para o formato esperado pelo componente
      const oraculoResponse: OraculoResponse = {
        pergunta: dados.pergunta,
        resposta: {
          resumo: respostaParsed.resumo,
          acoes: respostaParsed.acoes,
          dados: respostaParsed.dados,
          alertas: respostaParsed.alertas,
          proximos_passos: respostaParsed.proximos_passos,
          resposta_completa: respostaParsed.resposta_completa,
        },
        metadados: {
          fonte: 'N8N Webhook',
          ...metadados,
        }
      };

      return oraculoResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Tempo esgotado');
      }
      
      console.error('Erro ao consultar Oráculo:', error);
      throw error;
    }
  }

  // Salvar no histórico local
  salvarHistorico(pergunta: string, resposta: OraculoResponse) {
    const historico = this.obterHistorico();
    historico.unshift({
      id: Date.now().toString(),
      pergunta,
      resposta,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('oraculo_historico', JSON.stringify(historico.slice(0, 10)));
  }

  obterHistorico() {
    const historico = localStorage.getItem('oraculo_historico');
    return historico ? JSON.parse(historico) : [];
  }

  limparHistorico() {
    localStorage.removeItem('oraculo_historico');
  }
}

export const oraculoService = new OraculoService();