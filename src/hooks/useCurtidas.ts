import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCurtidas = (comentarioId: string) => {
  const [curtidas, setCurtidas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch curtidas
  const fetchCurtidas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comentario_curtidas')
        .select('*')
        .eq('comentario_id', comentarioId);

      if (error) throw error;
      setCurtidas(data || []);
    } catch (error) {
      console.error('Erro ao buscar curtidas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (comentarioId) {
      fetchCurtidas();
    }
  }, [comentarioId]);

  const toggleCurtida = async () => {
    if (!user) return;

    try {
      const curtidaExistente = curtidas.find(c => c.usuario_id === user.id);
      
      if (curtidaExistente) {
        // Descurtir
        const { error } = await supabase
          .from('comentario_curtidas')
          .delete()
          .eq('id', curtidaExistente.id);

        if (error) throw error;
        toast.success('Curtida removida');
      } else {
        // Curtir
        const { error } = await supabase
          .from('comentario_curtidas')
          .insert({
            comentario_id: comentarioId,
            usuario_id: user.id
          });

        if (error) throw error;
        toast.success('Comentário curtido');
      }

      fetchCurtidas();
    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error);
      toast.error('Erro ao processar curtida');
    }
  };

  const userCurtiu = user ? curtidas.some(c => c.usuario_id === user.id) : false;

  return {
    curtidas,
    loading,
    userCurtiu,
    totalCurtidas: curtidas.length,
    toggleCurtida
  };
};