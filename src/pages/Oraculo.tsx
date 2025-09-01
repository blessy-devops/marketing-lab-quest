
import { useState, useEffect, FormEvent } from "react";
import { Brain, Loader2, Sparkles, Send, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { useOraculoAsync } from "@/hooks/useOraculoAsync";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChatHistorySidebar } from "@/components/ChatHistorySidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Oraculo() {
  const [pergunta, setPergunta] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { 
    enviarPergunta, 
    atualizarMensagemAssistente, 
    carregarHistorico, 
    limparMensagens, 
    toggleMessageOrder,
    loading, 
    messages, 
    erro, 
    messageOrder 
  } = useOraculoAsync();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Configurar subscrição Realtime
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    console.log('🔄 Configurando Realtime para conversation:', conversationId);

    const channel = supabase
      .channel(`conversation-${conversationId}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'oraculo_historico',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('📨 Nova mensagem recebida via Realtime:', payload);
          const newMessage = payload.new;
          
          // Só processar mensagens do assistente
          if (newMessage.role === 'assistant' && newMessage.content) {
            console.log('🤖 Atualizando mensagem do assistente:', newMessage.content?.substring(0, 50));
            atualizarMensagemAssistente(newMessage.content, newMessage.sources);
            
            toast.success('Resposta recebida!', {
              description: 'O Oráculo concluiu sua análise'
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da subscrição Realtime:', status);
      });

    // Cleanup
    return () => {
      console.log('🧹 Removendo subscrição Realtime');
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id, atualizarMensagemAssistente]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pergunta.trim()) return;
    
    if (!user?.id) {
      toast.error("Você precisa estar logado para fazer consultas ao Oráculo");
      return;
    }

    // Gerar conversationId se não existir
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      currentConversationId = uuidv4();
      setConversationId(currentConversationId);
    }
    
    const sucesso = await enviarPergunta(pergunta, currentConversationId, user.id);
    if (sucesso) {
      setPergunta(""); // Limpar input apenas se enviou com sucesso
    }
  };

  const handleSelectConversation = async (selectedConversationId: string) => {
    setConversationId(selectedConversationId);
    setPergunta("");
    await carregarHistorico(selectedConversationId);
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setPergunta("");
    limparMensagens();
  };

  // Layout com sidebar para desktop e drawer para mobile
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <ChatHistorySidebar
        activeConversationId={conversationId || undefined}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with Menu */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <ChatHistorySidebar
              activeConversationId={conversationId || undefined}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
            />
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h1 className="font-semibold">Oráculo</h1>
            </div>
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleMessageOrder}
                className="w-8 h-8"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Layout centralizado para primeira consulta */}
        {messages.length === 0 ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="max-w-2xl w-full space-y-6 p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg">
                    <Brain className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Oráculo</h1>
                  <p className="text-muted-foreground text-lg">
                    Inteligência artificial para estratégias de marketing
                  </p>
                </div>
              </div>

              {erro && (
                <Alert variant="destructive">
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Digite sua pergunta sobre marketing..."
                    value={pergunta}
                    onChange={(e) => setPergunta(e.target.value)}
                    className="text-lg p-4 h-14"
                    disabled={loading}
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  disabled={!pergunta.trim() || loading}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Consultar Oráculo
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          // Layout de chat após primeira consulta
          <div className="flex-1 flex flex-col space-y-6 p-4 md:p-6">
            {/* Desktop Header */}
            {!isMobile && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Oráculo</h1>
                    <p className="text-muted-foreground">
                      Inteligência artificial para estratégias de marketing
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleMessageOrder}
                    className="flex items-center gap-2"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    {messageOrder === 'oldest' ? 'Mais antigas primeiro' : 'Mais recentes primeiro'}
                  </Button>
                  <Button variant="outline" onClick={handleNewConversation}>
                    Nova Conversa
                  </Button>
                </div>
              </div>
            )}

            {erro && (
              <Alert variant="destructive">
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}

            {/* Área de mensagens */}
            <div className="flex-1 space-y-6 overflow-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-lg p-4' 
                      : 'bg-background border rounded-lg p-6'
                  }`}>
                    {message.role === 'user' ? (
                      <p>{message.content}</p>
                    ) : (
                      <>
                        {message.status === 'loading' ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>O Oráculo está analisando sua pergunta...</span>
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Resposta do assistente */}
                            <div className="prose dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content || "Resposta não disponível"}
                              </ReactMarkdown>
                            </div>

                            {/* Fontes consultadas */}
                            {message.sources && Array.isArray(message.sources) && message.sources.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Fontes Consultadas</h3>
                                <div className="bg-muted/30 rounded-lg p-4">
                                  <ul className="space-y-2">
                                    {message.sources.map((fonte: any, index: number) => {
                                      if (typeof fonte === 'string') {
                                        return (
                                          <li key={index}>
                                            <span className="text-muted-foreground">• {fonte}</span>
                                          </li>
                                        );
                                      } else if (fonte && typeof fonte === 'object') {
                                        const id = fonte.id || fonte.experimentoId || fonte.experiment_id;
                                        const nome = fonte.nome || fonte.name || fonte.title || fonte.filename;
                                        const url = fonte.url || fonte.link;
                                        
                                        if (id && nome) {
                                          return (
                                            <li key={id || index}>
                                              <Link
                                                to={`/experimentos/${id}`}
                                                className="text-primary hover:underline"
                                              >
                                                • {nome}
                                              </Link>
                                            </li>
                                          );
                                        } else if (url && nome) {
                                          return (
                                            <li key={index}>
                                              <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                              >
                                                • {nome}
                                              </a>
                                            </li>
                                          );
                                        } else if (nome) {
                                          return (
                                            <li key={index}>
                                              <span className="text-muted-foreground">• {nome}</span>
                                            </li>
                                          );
                                        }
                                      }
                                      
                                      return (
                                        <li key={index}>
                                          <span className="text-muted-foreground">• Fonte não identificada</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input para nova pergunta */}
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Digite sua pergunta sobre marketing..."
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                className="flex-1"
                disabled={loading}
                required
              />
              <Button 
                type="submit"
                disabled={!pergunta.trim() || loading}
                size="icon"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
