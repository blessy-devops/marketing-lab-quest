import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Zap, 
  TrendingUp, 
  Plus,
  Lightbulb,
  Target,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExperimentosComResultados } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function QuickActionsPanel() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { data: experimentos = [] } = useExperimentosComResultados();

  // Find last successful experiment
  const lastSuccess = experimentos
    .filter(exp => exp.resultado?.sucesso === true)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  // Find top performers by ROI
  const topPerformers = experimentos
    .filter(exp => exp.resultado?.roi && exp.resultado.roi > 0)
    .sort((a, b) => (b.resultado?.roi || 0) - (a.resultado?.roi || 0))
    .slice(0, 3);

  const handleDuplicateSuccess = async () => {
    if (!lastSuccess) return;
    
    setIsLoading('duplicate');
    try {
      const { data: novoExperimento, error } = await supabase
        .from('experimentos')
        .insert({
          nome: `${lastSuccess.nome} (Sucesso Duplicado)`,
          tipo: lastSuccess.tipo,
          responsavel: lastSuccess.responsavel,
          status: 'planejado',
          canais: lastSuccess.canais,
          hipotese: lastSuccess.hipotese
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Experimento duplicado com sucesso!');
      navigate(`/experimentos/${novoExperimento.id}/editar`);
    } catch (error) {
      console.error('Erro ao duplicar:', error);
      toast.error('Erro ao duplicar experimento');
    } finally {
      setIsLoading(null);
    }
  };

  const handleCreateFromLearnings = () => {
    // Navigate to new experiment with learning insights
    const learnings = experimentos
      .filter(exp => exp.resultado?.aprendizados)
      .map(exp => exp.resultado?.aprendizados)
      .slice(0, 3);

    navigate('/experimentos/novo', {
      state: { 
        suggestedLearnings: learnings,
        mode: 'from_learnings'
      }
    });
  };

  const quickActions = [
    {
      id: 'duplicate_success',
      title: 'Duplicar Último Sucesso',
      description: lastSuccess 
        ? `Baseado em: ${lastSuccess.nome}`
        : 'Nenhum experimento bem-sucedido encontrado',
      icon: Copy,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      action: handleDuplicateSuccess,
      disabled: !lastSuccess,
      loading: isLoading === 'duplicate'
    },
    {
      id: 'quick_ab',
      title: 'Teste A/B Rápido',
      description: 'Template pré-configurado para início imediato',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      action: () => navigate('/experimentos/novo?template=ab_test'),
      disabled: false
    },
    {
      id: 'from_learnings',
      title: 'Aplicar Aprendizados',
      description: 'Criar experimento baseado em insights anteriores',
      icon: Lightbulb,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      action: handleCreateFromLearnings,
      disabled: false
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-start gap-3 border-2 ${action.borderColor} ${action.bgColor} hover:${action.bgColor} hover:border-opacity-80 transition-all`}
                  onClick={action.action}
                  disabled={action.disabled || action.loading}
                >
                  <div className="flex items-center gap-2 w-full">
                    <IconComponent className={`h-5 w-5 ${action.color}`} />
                    <span className="font-medium text-sm">{action.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left leading-relaxed">
                    {action.description}
                  </p>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((exp, index) => (
                <div 
                  key={exp.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/experimentos/${exp.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium text-sm">{exp.nome}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ROI: {exp.resultado?.roi}% • {exp.canais?.join(', ')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/experimentos/novo?similarTo=${exp.id}`);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}