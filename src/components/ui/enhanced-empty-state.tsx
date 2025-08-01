import { ReactNode } from "react";
import { PlusCircle, Search, TestTube, BarChart3, FileText, Image } from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { AnimatedWrapper } from "@/components/ui/animated-wrapper";
import { useNavigate } from "react-router-dom";

interface EmptyStateConfig {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: {
    primary?: {
      label: string;
      action: () => void;
      icon?: ReactNode;
    };
    secondary?: {
      label: string;
      action: () => void;
    };
  };
  tips?: string[];
}

interface EnhancedEmptyStateProps {
  type: 'experiments' | 'results' | 'gallery' | 'reports' | 'analytics' | 'search' | 'custom';
  customConfig?: EmptyStateConfig;
  className?: string;
}

export function EnhancedEmptyState({ type, customConfig, className }: EnhancedEmptyStateProps) {
  const navigate = useNavigate();

  const configs: Record<string, EmptyStateConfig> = {
    experiments: {
      icon: <TestTube className="h-16 w-16 text-muted-foreground/60" />,
      title: "Nenhum experimento encontrado",
      description: "Comece criando seu primeiro experimento para testar suas hipóteses de marketing.",
      actions: {
        primary: {
          label: "Criar Primeiro Experimento",
          action: () => navigate('/experimentos/novo'),
          icon: <PlusCircle className="h-4 w-4" />
        },
        secondary: {
          label: "Ver Documentação",
          action: () => window.open('https://docs.example.com', '_blank')
        }
      },
      tips: [
        "💡 Comece com experimentos simples como testes A/B de email",
        "📊 Defina métricas claras antes de iniciar",
        "🎯 Uma hipótese bem formulada é meio experimento feito"
      ]
    },
    results: {
      icon: <BarChart3 className="h-16 w-16 text-muted-foreground/60" />,
      title: "Nenhum resultado disponível",
      description: "Execute alguns experimentos primeiro para ver os resultados e insights aqui.",
      actions: {
        primary: {
          label: "Ver Experimentos",
          action: () => navigate('/experimentos'),
          icon: <TestTube className="h-4 w-4" />
        }
      },
      tips: [
        "📈 Resultados aparecem conforme os experimentos são concluídos",
        "🔍 Analise tanto sucessos quanto falhas para aprender"
      ]
    },
    gallery: {
      icon: <Image className="h-16 w-16 text-muted-foreground/60" />,
      title: "Galeria vazia",
      description: "Adicione imagens, criativos e assets dos seus experimentos para organizar melhor seus materiais.",
      actions: {
        primary: {
          label: "Fazer Upload",
          action: () => console.log('Upload triggered'),
          icon: <PlusCircle className="h-4 w-4" />
        }
      }
    },
    reports: {
      icon: <FileText className="h-16 w-16 text-muted-foreground/60" />,
      title: "Nenhum relatório gerado",
      description: "Gere relatórios detalhados baseados nos resultados dos seus experimentos.",
      actions: {
        primary: {
          label: "Gerar Relatório",
          action: () => console.log('Generate report'),
          icon: <FileText className="h-4 w-4" />
        }
      }
    },
    analytics: {
      icon: <BarChart3 className="h-16 w-16 text-muted-foreground/60" />,
      title: "Dados insuficientes",
      description: "Execute mais experimentos para gerar insights e análises detalhadas.",
      actions: {
        primary: {
          label: "Criar Experimento",
          action: () => navigate('/experimentos/novo'),
          icon: <PlusCircle className="h-4 w-4" />
        }
      }
    },
    search: {
      icon: <Search className="h-16 w-16 text-muted-foreground/60" />,
      title: "Nenhum resultado encontrado",
      description: "Tente ajustar os termos da busca ou explore outras seções.",
      tips: [
        "🔍 Use palavras-chave específicas",
        "🏷️ Busque por tags ou categorias",
        "📅 Filtre por período de tempo"
      ]
    }
  };

  const config = customConfig || configs[type];

  if (!config) {
    return null;
  }

  return (
    <AnimatedWrapper className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className || ''}`}>
      <div className="mb-6 animate-pulse-glow">
        {config.icon}
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-foreground">
        {config.title}
      </h3>
      
      <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
        {config.description}
      </p>
      
      {config.actions && (
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {config.actions.primary && (
            <EnhancedButton
              onClick={config.actions.primary.action}
              icon={config.actions.primary.icon}
              className="animate-pulse-glow"
              animateOnHover
            >
              {config.actions.primary.label}
            </EnhancedButton>
          )}
          
          {config.actions.secondary && (
            <EnhancedButton
              onClick={config.actions.secondary.action}
              variant="outline"
              animateOnHover
            >
              {config.actions.secondary.label}
            </EnhancedButton>
          )}
        </div>
      )}
      
      {config.tips && (
        <div className="bg-muted/50 rounded-lg p-4 max-w-md">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">
            Dicas úteis:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 text-left">
            {config.tips.map((tip, index) => (
              <li key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AnimatedWrapper>
  );
}