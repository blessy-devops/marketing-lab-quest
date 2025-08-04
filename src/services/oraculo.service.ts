interface OraculoRequest {
  pergunta: string;
  contexto?: string;
  tipo?: string;
}

interface OraculoResponse {
  sucesso: boolean;
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

      const resultado = await response.json();
      return resultado;
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