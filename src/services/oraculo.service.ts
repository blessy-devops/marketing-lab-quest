interface OraculoRequest {
  pergunta: string;
  contexto?: string;
  tipo?: string;
  conversation_id?: string;
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

interface N8nNewResponse {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  content: string;
  sources: any[] | null;
  created_at: string;
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
    conversation_id?: string;
    user_id?: string;
    role?: string;
    tokens_usados?: number;
    tempo_resposta_ms?: number;
    hit_count?: number;
    fontes?: any[];
    created_at?: string;
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

  private getTimeoutMs(): number {
    // Primeiro, tentar pegar da variável de ambiente
    const envTimeout = import.meta.env.VITE_ORACULO_TIMEOUT_MS;
    if (envTimeout) {
      const timeout = parseInt(envTimeout, 10);
      if (!isNaN(timeout) && timeout > 0) {
        return timeout;
      }
    }

    // Padrão: 120 segundos (2 minutos)
    return 120000;
  }

  async consultar(dados: OraculoRequest): Promise<OraculoResponse>;
  async consultar(dados: OraculoRequest, userId?: string): Promise<OraculoResponse>;
  async consultar(dados: OraculoRequest, userId?: string): Promise<OraculoResponse> {
    const webhookUrl = await this.getWebhookUrl();
    
    console.log('Chamando Oráculo em:', webhookUrl);
    const startTime = Date.now();
    
    // Timeout configurável (padrão: 120 segundos)
    const timeoutMs = this.getTimeoutMs();
    console.log(`⏱️ Timeout configurado: ${timeoutMs}ms (${timeoutMs/1000}s)`);
    
    // Criar AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Adicionar x-user-id se userId foi fornecido
      if (userId) {
        headers['x-user-id'] = userId;
      }

      console.log('🚀 Enviando para webhook:', webhookUrl, {
        pergunta: dados.pergunta,
        contexto: dados.contexto,
        tipo: dados.tipo,
        conversation_id: dados.conversation_id,
      });
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pergunta: dados.pergunta,
          contexto: dados.contexto,
          tipo: dados.tipo,
          conversation_id: dados.conversation_id,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const resultado = await response.json();
      console.log('📨 Resposta do webhook (raw):', resultado);
      
      const totalTime = Date.now() - startTime;
      console.log(`Tempo total (ms): ${totalTime}`);

      // Detectar formato da resposta
      let respostaParsed: any;
      let metadados: any = {};

      console.log('🔄 Processando resposta. É array?', Array.isArray(resultado), 'Length:', resultado?.length);

      if (Array.isArray(resultado) && resultado.length > 0) {
        const n8nData = resultado[0];
        console.log('📦 Primeiro item do array:', n8nData);
        
        // Verificar se é o novo formato com 'content' e 'sources'
        if ('content' in n8nData && 'sources' in n8nData) {
          console.log('✨ Detectado novo formato N8N com content e sources');
          // Novo formato N8N
          respostaParsed = {
            resposta_completa: n8nData.content
          };
          metadados = {
            id: n8nData.id,
            conversation_id: n8nData.conversation_id,
            user_id: n8nData.user_id,
            role: n8nData.role,
            created_at: n8nData.created_at,
            fontes: n8nData.sources || [],
            tempo_resposta_ms: totalTime,
          };
          console.log('📋 Resposta processada:', respostaParsed);
          console.log('🏷️  Metadados:', metadados);
        } else {
          // Formato N8N antigo
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