
// Extensão temporária de tipos para funções RPC customizadas
// Este arquivo pode ser removido quando os tipos do Supabase forem regenerados

declare module '@supabase/supabase-js' {
  interface Database {
    public: {
      Functions: {
        match_experiments: {
          Args: {
            query_embedding: number[]
            match_threshold?: number
            match_count?: number
          }
          Returns: Array<{
            id: string
            experimento_id: string
            modelo: string
            chunk_texto: string | null
            chunk_tipo: string | null
            created_at: string
            similarity: number
          }>
        }
      }
    }
  }
}
