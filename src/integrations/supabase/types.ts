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
          tipo: string | null
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
          tipo?: string | null
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
          tipo?: string | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
