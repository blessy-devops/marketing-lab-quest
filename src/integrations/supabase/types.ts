export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      anexos: {
        Row: {
          created_at: string
          descricao: string | null
          experimento_id: string
          file_name: string | null
          file_size: number | null
          id: string
          is_link: boolean | null
          mime_type: string | null
          storage_path: string | null
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          experimento_id: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_link?: boolean | null
          mime_type?: string | null
          storage_path?: string | null
          tipo: string
          url: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          experimento_id?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          is_link?: boolean | null
          mime_type?: string | null
          storage_path?: string | null
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_experimento_id_fkey"
            columns: ["experimento_id"]
            isOneToOne: false
            referencedRelation: "experimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      cache_oraculo: {
        Row: {
          created_at: string | null
          expires_at: string | null
          hit_count: number | null
          id: string
          pergunta: string
          pergunta_normalizada: string | null
          resposta: Json | null
          tempo_resposta_ms: number | null
          tipo_consulta: string | null
          tokens_usados: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          pergunta: string
          pergunta_normalizada?: string | null
          resposta?: Json | null
          tempo_resposta_ms?: number | null
          tipo_consulta?: string | null
          tokens_usados?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          pergunta?: string
          pergunta_normalizada?: string | null
          resposta?: Json | null
          tempo_resposta_ms?: number | null
          tipo_consulta?: string | null
          tokens_usados?: number | null
        }
        Relationships: []
      }
      canais: {
        Row: {
          ativo: boolean
          created_at: string
          icone: string | null
          id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      canal_tipo_sugestao: {
        Row: {
          canal: string
          created_at: string
          id: string
          peso: number | null
          tipo_id: string | null
        }
        Insert: {
          canal: string
          created_at?: string
          id?: string
          peso?: number | null
          tipo_id?: string | null
        }
        Update: {
          canal?: string
          created_at?: string
          id?: string
          peso?: number | null
          tipo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canal_tipo_sugestao_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_experimento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canal_tipo_sugestao_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "v_tipos_experimento_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      ciclo_completo_analytics: {
        Row: {
          consulta_id: string | null
          created_at: string
          experimento_id: string | null
          id: string
          observacoes: string | null
          playbook_id: string | null
          resultado_id: string | null
          roi_obtido: number | null
          status: string | null
          sucesso: boolean | null
          tempo_total_dias: number | null
          updated_at: string
          usuario_id: string | null
        }
        Insert: {
          consulta_id?: string | null
          created_at?: string
          experimento_id?: string | null
          id?: string
          observacoes?: string | null
          playbook_id?: string | null
          resultado_id?: string | null
          roi_obtido?: number | null
          status?: string | null
          sucesso?: boolean | null
          tempo_total_dias?: number | null
          updated_at?: string
          usuario_id?: string | null
        }
        Update: {
          consulta_id?: string | null
          created_at?: string
          experimento_id?: string | null
          id?: string
          observacoes?: string | null
          playbook_id?: string | null
          resultado_id?: string | null
          roi_obtido?: number | null
          status?: string | null
          sucesso?: boolean | null
          tempo_total_dias?: number | null
          updated_at?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      comentario_curtidas: {
        Row: {
          comentario_id: string
          created_at: string
          id: string
          usuario_id: string
        }
        Insert: {
          comentario_id: string
          created_at?: string
          id?: string
          usuario_id: string
        }
        Update: {
          comentario_id?: string
          created_at?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentario_curtidas_comentario_id_fkey"
            columns: ["comentario_id"]
            isOneToOne: false
            referencedRelation: "comentarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios: {
        Row: {
          created_at: string
          experimento_id: string
          id: string
          texto: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string
          experimento_id: string
          id?: string
          texto: string
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string
          experimento_id?: string
          id?: string
          texto?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      configuracoes_app: {
        Row: {
          chave: string
          created_at: string | null
          descricao: string | null
          id: number
          updated_at: string | null
          valor: Json | null
        }
        Insert: {
          chave: string
          created_at?: string | null
          descricao?: string | null
          id?: number
          updated_at?: string | null
          valor?: Json | null
        }
        Update: {
          chave?: string
          created_at?: string | null
          descricao?: string | null
          id?: number
          updated_at?: string | null
          valor?: Json | null
        }
        Relationships: []
      }
      convites: {
        Row: {
          aceito: boolean | null
          created_at: string | null
          email: string
          enviado_por: string | null
          expires_at: string | null
          id: string
          role: string | null
          token: string | null
        }
        Insert: {
          aceito?: boolean | null
          created_at?: string | null
          email: string
          enviado_por?: string | null
          expires_at?: string | null
          id?: string
          role?: string | null
          token?: string | null
        }
        Update: {
          aceito?: boolean | null
          created_at?: string | null
          email?: string
          enviado_por?: string | null
          expires_at?: string | null
          id?: string
          role?: string | null
          token?: string | null
        }
        Relationships: []
      }
      experiment_shares: {
        Row: {
          access_type: string
          active: boolean
          created_at: string
          created_by: string | null
          experimento_id: string
          expires_at: string | null
          id: string
          link_token: string | null
          updated_at: string
        }
        Insert: {
          access_type?: string
          active?: boolean
          created_at?: string
          created_by?: string | null
          experimento_id: string
          expires_at?: string | null
          id?: string
          link_token?: string | null
          updated_at?: string
        }
        Update: {
          access_type?: string
          active?: boolean
          created_at?: string
          created_by?: string | null
          experimento_id?: string
          expires_at?: string | null
          id?: string
          link_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      experimento_embeddings: {
        Row: {
          chunk_texto: string | null
          chunk_tipo: string | null
          created_at: string | null
          embedding: string | null
          experimento_id: string | null
          id: string
          modelo: string
        }
        Insert: {
          chunk_texto?: string | null
          chunk_tipo?: string | null
          created_at?: string | null
          embedding?: string | null
          experimento_id?: string | null
          id?: string
          modelo: string
        }
        Update: {
          chunk_texto?: string | null
          chunk_tipo?: string | null
          created_at?: string | null
          embedding?: string | null
          experimento_id?: string | null
          id?: string
          modelo?: string
        }
        Relationships: [
          {
            foreignKeyName: "experimento_embeddings_experimento_id_fkey"
            columns: ["experimento_id"]
            isOneToOne: false
            referencedRelation: "experimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      experimentos: {
        Row: {
          base_conhecimento: boolean | null
          canais: string[] | null
          contexto_narrativo: string | null
          contexto_negocio: Json | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          experimento_sucesso: boolean | null
          hipotese: string | null
          id: string
          nome: string
          responsavel: string | null
          status: string | null
          subtipo_customizado: string | null
          subtipo_experimento_id: string | null
          tags: string[] | null
          tipo: string | null
          tipo_experimento_id: string | null
          updated_at: string
        }
        Insert: {
          base_conhecimento?: boolean | null
          canais?: string[] | null
          contexto_narrativo?: string | null
          contexto_negocio?: Json | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          experimento_sucesso?: boolean | null
          hipotese?: string | null
          id?: string
          nome: string
          responsavel?: string | null
          status?: string | null
          subtipo_customizado?: string | null
          subtipo_experimento_id?: string | null
          tags?: string[] | null
          tipo?: string | null
          tipo_experimento_id?: string | null
          updated_at?: string
        }
        Update: {
          base_conhecimento?: boolean | null
          canais?: string[] | null
          contexto_narrativo?: string | null
          contexto_negocio?: Json | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          experimento_sucesso?: boolean | null
          hipotese?: string | null
          id?: string
          nome?: string
          responsavel?: string | null
          status?: string | null
          subtipo_customizado?: string | null
          subtipo_experimento_id?: string | null
          tags?: string[] | null
          tipo?: string | null
          tipo_experimento_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experimentos_subtipo_experimento_id_fkey"
            columns: ["subtipo_experimento_id"]
            isOneToOne: false
            referencedRelation: "subtipos_experimento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experimentos_tipo_experimento_id_fkey"
            columns: ["tipo_experimento_id"]
            isOneToOne: false
            referencedRelation: "tipos_experimento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experimentos_tipo_experimento_id_fkey"
            columns: ["tipo_experimento_id"]
            isOneToOne: false
            referencedRelation: "v_tipos_experimento_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      insights_processados: {
        Row: {
          confianca: number | null
          created_at: string | null
          experimentos_base: string[] | null
          id: string
          insight: Json | null
          padrao_identificado: string | null
          tipo: string | null
        }
        Insert: {
          confianca?: number | null
          created_at?: string | null
          experimentos_base?: string[] | null
          id?: string
          insight?: Json | null
          padrao_identificado?: string | null
          tipo?: string | null
        }
        Update: {
          confianca?: number | null
          created_at?: string | null
          experimentos_base?: string[] | null
          id?: string
          insight?: Json | null
          padrao_identificado?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      metricas: {
        Row: {
          created_at: string
          experimento_id: string
          id: string
          nome: string
          tipo: string
          unidade: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          experimento_id: string
          id?: string
          nome: string
          tipo: string
          unidade?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          experimento_id?: string
          id?: string
          nome?: string
          tipo?: string
          unidade?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metricas_experimento_id_fkey"
            columns: ["experimento_id"]
            isOneToOne: false
            referencedRelation: "experimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          descricao: string | null
          experimento_id: string | null
          id: string
          lida: boolean | null
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          experimento_id?: string | null
          id?: string
          lida?: boolean | null
          tipo: string
          titulo: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          experimento_id?: string | null
          id?: string
          lida?: boolean | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_experimento_id_fkey"
            columns: ["experimento_id"]
            isOneToOne: false
            referencedRelation: "experimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      oraculo_consultas: {
        Row: {
          created_at: string
          experimento_gerado_id: string | null
          from_cache: boolean | null
          id: string
          pergunta: string
          pergunta_normalizada: string | null
          resposta: Json | null
          tempo_resposta_ms: number | null
          tipo_consulta: string | null
          tokens_usados: number | null
          updated_at: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          experimento_gerado_id?: string | null
          from_cache?: boolean | null
          id?: string
          pergunta: string
          pergunta_normalizada?: string | null
          resposta?: Json | null
          tempo_resposta_ms?: number | null
          tipo_consulta?: string | null
          tokens_usados?: number | null
          updated_at?: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          experimento_gerado_id?: string | null
          from_cache?: boolean | null
          id?: string
          pergunta?: string
          pergunta_normalizada?: string | null
          resposta?: Json | null
          tempo_resposta_ms?: number | null
          tipo_consulta?: string | null
          tokens_usados?: number | null
          updated_at?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      oraculo_historico: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          id: string
          role: string
          sources: Json | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
          sources?: Json | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
          sources?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      playbook_ratings: {
        Row: {
          comentario: string | null
          created_at: string
          id: string
          playbook_id: string
          rating: number
          usuario_id: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          id?: string
          playbook_id: string
          rating: number
          usuario_id: string
        }
        Update: {
          comentario?: string | null
          created_at?: string
          id?: string
          playbook_id?: string
          rating?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_ratings_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_usos: {
        Row: {
          created_at: string
          experimento_id: string | null
          id: string
          observacoes: string | null
          playbook_id: string
          roi_obtido: number | null
          sucesso: boolean | null
          usuario_id: string
        }
        Insert: {
          created_at?: string
          experimento_id?: string | null
          id?: string
          observacoes?: string | null
          playbook_id: string
          roi_obtido?: number | null
          sucesso?: boolean | null
          usuario_id: string
        }
        Update: {
          created_at?: string
          experimento_id?: string | null
          id?: string
          observacoes?: string | null
          playbook_id?: string
          roi_obtido?: number | null
          sucesso?: boolean | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_usos_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          auto_gerado: boolean | null
          casos_sucesso: Json | null
          categoria: string
          cenario_ideal: string | null
          conteudo: Json
          created_at: string
          criado_por: string | null
          descricao: string | null
          experimento_origem_id: string | null
          id: string
          metricas: Json | null
          resultados_esperados: string | null
          roi_medio: number | null
          sum_ratings: number | null
          tags: string[] | null
          taxa_sucesso: number | null
          titulo: string
          total_ratings: number | null
          updated_at: string
          usos_count: number | null
          variacoes: Json | null
        }
        Insert: {
          auto_gerado?: boolean | null
          casos_sucesso?: Json | null
          categoria: string
          cenario_ideal?: string | null
          conteudo?: Json
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          experimento_origem_id?: string | null
          id?: string
          metricas?: Json | null
          resultados_esperados?: string | null
          roi_medio?: number | null
          sum_ratings?: number | null
          tags?: string[] | null
          taxa_sucesso?: number | null
          titulo: string
          total_ratings?: number | null
          updated_at?: string
          usos_count?: number | null
          variacoes?: Json | null
        }
        Update: {
          auto_gerado?: boolean | null
          casos_sucesso?: Json | null
          categoria?: string
          cenario_ideal?: string | null
          conteudo?: Json
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          experimento_origem_id?: string | null
          id?: string
          metricas?: Json | null
          resultados_esperados?: string | null
          roi_medio?: number | null
          sum_ratings?: number | null
          tags?: string[] | null
          taxa_sucesso?: number | null
          titulo?: string
          total_ratings?: number | null
          updated_at?: string
          usos_count?: number | null
          variacoes?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          cargo: string | null
          created_at: string
          departamento: Database["public"]["Enums"]["department"] | null
          id: string
          nome_completo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          departamento?: Database["public"]["Enums"]["department"] | null
          id?: string
          nome_completo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          departamento?: Database["public"]["Enums"]["department"] | null
          id?: string
          nome_completo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resultados: {
        Row: {
          acoes: string | null
          aprendizados: string | null
          causas: string | null
          created_at: string
          experimento_id: string
          experimento_sucesso: boolean | null
          fatos: string | null
          id: string
          matriz_ice: Json | null
          rating: number | null
          roi: number | null
          sucesso: boolean | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          acoes?: string | null
          aprendizados?: string | null
          causas?: string | null
          created_at?: string
          experimento_id: string
          experimento_sucesso?: boolean | null
          fatos?: string | null
          id?: string
          matriz_ice?: Json | null
          rating?: number | null
          roi?: number | null
          sucesso?: boolean | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          acoes?: string | null
          aprendizados?: string | null
          causas?: string | null
          created_at?: string
          experimento_id?: string
          experimento_sucesso?: boolean | null
          fatos?: string | null
          id?: string
          matriz_ice?: Json | null
          rating?: number | null
          roi?: number | null
          sucesso?: boolean | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resultados_experimento_id_fkey"
            columns: ["experimento_id"]
            isOneToOne: true
            referencedRelation: "experimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      subcanais: {
        Row: {
          ativo: boolean
          canal_id: string
          created_at: string
          icone: string | null
          id: string
          nome: string
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          canal_id: string
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          canal_id?: string
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcanais_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
        ]
      }
      subtipos_experimento: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string | null
          exemplos: string | null
          id: string
          nome: string
          ordem: number | null
          tipo_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          exemplos?: string | null
          id?: string
          nome: string
          ordem?: number | null
          tipo_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          exemplos?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          tipo_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtipos_experimento_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_experimento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtipos_experimento_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "v_tipos_experimento_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_experimento: {
        Row: {
          ativo: boolean | null
          codigo: string
          cor: string | null
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_tipos_experimento_completo: {
        Row: {
          ativo: boolean | null
          codigo: string | null
          cor: string | null
          descricao: string | null
          icone: string | null
          id: string | null
          nome: string | null
          ordem: number | null
          total_experimentos: number | null
          total_subtipos: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_oraculo_metrics: {
        Args: { days_back?: number }
        Returns: {
          consultas_com_experimento: number
          consultas_por_tipo: Json
          experimentos_com_sucesso: number
          roi_medio: number
          taxa_conversao_experimento: number
          taxa_sucesso_experimentos: number
          tempo_medio_ciclo: number
          tendencia_uso: Json
          total_consultas: number
        }[]
      }
      get_pending_embeddings: {
        Args: { limit_count: number }
        Returns: {
          contexto_completo: string
          id: string
        }[]
      }
      get_shared_experiment: {
        Args: { token: string }
        Returns: Json
      }
      get_user_role: {
        Args: { p_user_id: string }
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_role: {
        Args: {
          check_role: Database["public"]["Enums"]["user_role"]
          user_uuid: string
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_experimentos: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          contexto_completo: string
          id: string
          nome: string
          similarity: number
        }[]
      }
      match_experiments: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: number[]
        }
        Returns: {
          chunk_texto: string
          chunk_tipo: string
          created_at: string
          experimento_id: string
          id: string
          modelo: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      user_can_access_experiment: {
        Args: { experiment_id: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      department: "Marketing" | "Comercial" | "Produto" | "Tech"
      user_role: "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      department: ["Marketing", "Comercial", "Produto", "Tech"],
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const
