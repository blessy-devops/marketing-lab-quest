
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TriggerRequest {
  question: string;
  conversationId: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Erro de autenticação:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parsear o body da requisição
    const { question, conversationId, userId }: TriggerRequest = await req.json();

    console.log('🚀 Oráculo Trigger recebido:', { question: question?.substring(0, 50), conversationId, userId });

    // Validar dados obrigatórios
    if (!question || !conversationId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: question, conversationId, userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o userId corresponde ao usuário autenticado
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inserir mensagem do usuário no histórico
    const { error: insertUserError } = await supabase
      .from('oraculo_historico')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role: 'user',
        content: question,
        sources: null,
      });

    if (insertUserError) {
      console.error('Erro ao inserir mensagem do usuário:', insertUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to save user message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter URL do webhook n8n
    const webhookUrl = Deno.env.get('N8N_ORACLE_WEBHOOK_URL');
    if (!webhookUrl) {
      console.error('N8N_ORACLE_WEBHOOK_URL não configurada');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chamar o webhook do n8n de forma assíncrona (fire-and-forget)
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({
        pergunta: question,
        conversation_id: conversationId,
        tipo: 'geral',
      }),
    }).catch((error) => {
      console.error('Erro ao chamar webhook n8n:', error);
    });

    console.log('✅ Webhook n8n disparado com sucesso');

    // Retornar resposta imediata
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 202, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro no oraculo-trigger:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
