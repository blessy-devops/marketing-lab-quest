import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Comentario = Tables<"comentarios">;

interface ComentarioComUsuario extends Comentario {
  usuario_nome?: string;
}

export const useComentarios = (experimentoId: string) => {
  const [comentarios, setComentarios] = useState<ComentarioComUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch comentarios
  const fetchComentarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comentarios')
        .select('*')
        .eq('experimento_id', experimentoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For now, we'll use the current user's email for their own comments
      // In a production app, you'd typically store user names in a profiles table
      const comentariosComUsuario = data?.map(comentario => ({
        ...comentario,
        usuario_nome: comentario.usuario_id === user?.id 
          ? user?.email?.split('@')[0] || 'Você'
          : `Usuário ${comentario.usuario_id.slice(0, 8)}`
      })) || [];

      setComentarios(comentariosComUsuario);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (experimentoId && user) {
      fetchComentarios();
    }
  }, [experimentoId, user]);

  const adicionarComentario = async (texto: string) => {
    if (!user || !texto.trim()) return;

    try {
      const { error } = await supabase
        .from('comentarios')
        .insert({
          experimento_id: experimentoId,
          usuario_id: user.id,
          texto: texto.trim()
        });

      if (error) throw error;

      toast.success('Comentário adicionado');
      fetchComentarios();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const editarComentario = async (id: string, novoTexto: string) => {
    if (!user || !novoTexto.trim()) return;

    try {
      const { error } = await supabase
        .from('comentarios')
        .update({ 
          texto: novoTexto.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('usuario_id', user.id);

      if (error) throw error;

      toast.success('Comentário editado');
      setEditingId(null);
      fetchComentarios();
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      toast.error('Erro ao editar comentário');
    }
  };

  const excluirComentario = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.id);

      if (error) throw error;

      toast.success('Comentário excluído');
      fetchComentarios();
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast.error('Erro ao excluir comentário');
    }
  };

  return {
    comentarios,
    loading,
    user,
    editingId,
    setEditingId,
    adicionarComentario,
    editarComentario,
    excluirComentario
  };
};