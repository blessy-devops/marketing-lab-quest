import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Invite {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  token: string;
  enviado_por: string;
  aceito: boolean;
  expires_at: string;
  created_at: string;
}

export const useInvites = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getInviteByToken = useCallback(async (token: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('convites')
        .select('*')
        .eq('token', token)
        .eq('aceito', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        console.error('Error fetching invite:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching invite:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptInvite = useCallback(async (
    token: string, 
    userData: { 
      nome_completo: string; 
      password: string; 
      departamento?: string; 
    }
  ) => {
    try {
      setLoading(true);

      // First, get the invite details
      const { data: invite, error: inviteError } = await getInviteByToken(token);
      
      if (inviteError || !invite) {
        throw new Error('Convite inválido ou expirado');
      }

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome_completo: userData.nome_completo,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          nome_completo: userData.nome_completo,
          departamento: userData.departamento as "Marketing" | "Comercial" | "Produto" | "Tech" || null,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: invite.role,
        });

      if (roleError) {
        console.error('Error assigning role:', roleError);
      }

      // Mark invite as accepted
      const { error: updateError } = await supabase
        .from('convites')
        .update({ aceito: true })
        .eq('token', token);

      if (updateError) {
        console.error('Error updating invite:', updateError);
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Marketing Lab. Você será redirecionado em instantes.",
      });

      return { success: true, user: authData.user };
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      
      let errorMessage = 'Erro ao aceitar convite';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já possui uma conta no sistema';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Senha deve ter pelo menos 6 caracteres';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro ao aceitar convite",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getInviteByToken, toast]);

  return {
    loading,
    getInviteByToken,
    acceptInvite,
  };
};