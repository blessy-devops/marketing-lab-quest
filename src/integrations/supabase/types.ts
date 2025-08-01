export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
          id: string
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          experimento_id: string
          id?: string
          tipo: string
          url: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          experimento_id?: string
          id?: string
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
      experimentos: {
        Row: {
          canais: string[] | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          hipotese: string | null
          id: string
          nome: string
          responsavel: string | null
          status: string | null
          subtipo_customizado: string | null
          subtipo_experimento_id: string | null
          tipo: string | null
          tipo_experimento_id: string | null
          updated_at: string
        }
        Insert: {
          canais?: string[] | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          hipotese?: string | null
          id?: string
          nome: string
          responsavel?: string | null
          status?: string | null
          subtipo_customizado?: string | null
          subtipo_experimento_id?: string | null
          tipo?: string | null
          tipo_experimento_id?: string | null
          updated_at?: string
        }
        Update: {
          canais?: string[] | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          hipotese?: string | null
          id?: string
          nome?: string
          responsavel?: string | null
          status?: string | null
          subtipo_customizado?: string | null
          subtipo_experimento_id?: string | null
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
          fatos: string | null
          id: string
          roi: number | null
          sucesso: boolean | null
          updated_at: string
        }
        Insert: {
          acoes?: string | null
          aprendizados?: string | null
          causas?: string | null
          created_at?: string
          experimento_id: string
          fatos?: string | null
          id?: string
          roi?: number | null
          sucesso?: boolean | null
          updated_at?: string
        }
        Update: {
          acoes?: string | null
          aprendizados?: string | null
          causas?: string | null
          created_at?: string
          experimento_id?: string
          fatos?: string | null
          id?: string
          roi?: number | null
          sucesso?: boolean | null
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
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          user_uuid: string
          check_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
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
