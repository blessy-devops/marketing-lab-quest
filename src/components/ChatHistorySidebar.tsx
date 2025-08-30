
import { useState, useEffect } from 'react';
import { Brain, MessageCircle, Plus, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface Conversation {
  conversation_id: string;
  title: string;
  last_updated: string;
}

interface ChatHistorySidebarProps {
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export function ChatHistorySidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ChatHistorySidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Usar Promise.race para timeout de 15s
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('⏰ Timeout ao carregar conversas após 15s');
          reject(new Error('Timeout'));
        }, 15000);
      });

      const dataPromise = supabase.rpc('get_user_conversations');
      
      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Erro ao carregar conversas:', error);
        return;
      }

      // A RPC já retorna o formato correto: { conversation_id, title, last_updated }
      setConversations(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar conversas:', error);
      
      if (error.message === 'Timeout') {
        console.log('⏰ Timeout ao carregar sidebar - conexão lenta');
        // Não mostrar toast para não poluir a interface, apenas log
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const truncateMessage = (message: string | null | undefined, maxLength: number = 50) => {
    // Handle null/undefined cases
    if (!message || typeof message !== 'string') {
      return 'Conversa sem título';
    }
    
    if (message.length <= maxLength) return message;
    return message.slice(0, maxLength) + '...';
  };

  const handleSelectConversation = (conversationId: string) => {
    onSelectConversation(conversationId);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleNewConversation = () => {
    onNewConversation();
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Conversas</h2>
        </div>
        
        <Button 
          onClick={handleNewConversation}
          className="w-full justify-start"
          variant="default"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma conversa ainda</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.conversation_id}
                onClick={() => handleSelectConversation(conversation.conversation_id)}
                className={cn(
                  "w-full p-3 text-left rounded-lg transition-colors hover:bg-muted/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  activeConversationId === conversation.conversation_id && "bg-muted border-l-2 border-primary"
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium line-clamp-2">
                    {truncateMessage(conversation.title)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(conversation.last_updated)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Mobile version with Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version
  return (
    <div className="w-64 border-r bg-card/50 hidden md:block">
      <SidebarContent />
    </div>
  );
}
