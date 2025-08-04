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
  private baseUrl = 'https://n8n.useblessy.com.br/webhook/oraculo-agentes';

  async consultar(dados: OraculoRequest): Promise<OraculoResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const resultado: N8nResponse[] = await response.json();
      console.log('Resposta do N8N:', resultado);

      // N8N retorna um array, pegamos o primeiro item
      if (!resultado || !Array.isArray(resultado) || resultado.length === 0) {
        throw new Error('Resposta vazia ou formato inválido do servidor');
      }

      const n8nData = resultado[0];
      
      // Parse da string JSON na resposta
      let respostaParsed;
      try {
        respostaParsed = JSON.parse(n8nData.resposta);
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', parseError);
        throw new Error('Formato de resposta inválido');
      }

      // Mapear para o formato esperado pelo componente
      const oraculoResponse: OraculoResponse = {
        pergunta: n8nData.pergunta,
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
          id: n8nData.id,
          tokens_usados: n8nData.tokens_usados,
          tempo_resposta_ms: n8nData.tempo_resposta_ms,
          hit_count: n8nData.hit_count,
          cache: n8nData.hit_count > 0,
          processado_em: n8nData.created_at,
        }
      };

      return oraculoResponse;
    } catch (error) {
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