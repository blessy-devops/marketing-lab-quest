import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, X, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useExperimentosComResultados } from '@/hooks/useSupabaseData';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SmartNotification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'urgent';
  title: string;
  message: string;
  experimentId?: string;
  experimentName?: string;
  action?: {
    label: string;
    href: string;
  };
  timestamp: Date;
  dismissed?: boolean;
}

export function SmartNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { data: experimentos = [] } = useExperimentosComResultados();

  useEffect(() => {
    generateSmartNotifications();
  }, [experimentos]);

  const generateSmartNotifications = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newNotifications: SmartNotification[] = [];

    // 1. Experimentos sem atualização há 7+ dias
    const staleExperiments = experimentos.filter(exp => {
      const updated = new Date(exp.updated_at);
      return exp.status === 'em_andamento' && updated < sevenDaysAgo;
    });

    staleExperiments.forEach(exp => {
      newNotifications.push({
        id: `stale_${exp.id}`,
        type: 'warning',
        title: 'Experimento sem atualização',
        message: `${exp.nome} não tem atualizações há ${formatDistanceToNow(new Date(exp.updated_at), { locale: ptBR })}`,
        experimentId: exp.id,
        experimentName: exp.nome,
        action: {
          label: 'Atualizar',
          href: `/experimentos/${exp.id}/editar`
        },
        timestamp: new Date()
      });
    });

    // 2. Experimentos concluídos sem resultados
    const completedWithoutResults = experimentos.filter(exp => 
      exp.status === 'concluido' && !exp.resultado
    );

    completedWithoutResults.forEach(exp => {
      newNotifications.push({
        id: `no_results_${exp.id}`,
        type: 'urgent',
        title: 'Resultado pendente',
        message: `${exp.nome} foi concluído mas não tem resultados registrados`,
        experimentId: exp.id,
        experimentName: exp.nome,
        action: {
          label: 'Adicionar Resultados',
          href: `/experimentos/${exp.id}/editar`
        },
        timestamp: new Date()
      });
    });

    // 3. Novo recorde de ROI
    const successfulExperiments = experimentos.filter(exp => 
      exp.resultado?.sucesso && exp.resultado?.roi
    );
    
    if (successfulExperiments.length > 0) {
      const maxROI = Math.max(...successfulExperiments.map(exp => exp.resultado?.roi || 0));
      const recordExperiment = successfulExperiments.find(exp => exp.resultado?.roi === maxROI);
      
      if (recordExperiment && maxROI > 50) { // Only show if ROI > 50%
        newNotifications.push({
          id: `roi_record_${recordExperiment.id}`,
          type: 'success',
          title: 'Novo recorde de ROI!',
          message: `${recordExperiment.nome} alcançou ${maxROI}% de ROI`,
          experimentId: recordExperiment.id,
          experimentName: recordExperiment.nome,
          action: {
            label: 'Ver Detalhes',
            href: `/experimentos/${recordExperiment.id}`
          },
          timestamp: new Date()
        });
      }
    }

    // 4. Experimentos que podem ser iniciados
    const readyToStart = experimentos.filter(exp => {
      const startDate = exp.data_inicio ? new Date(exp.data_inicio) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return exp.status === 'planejado' && 
             startDate && 
             startDate <= today;
    });

    readyToStart.forEach(exp => {
      newNotifications.push({
        id: `ready_start_${exp.id}`,
        type: 'info',
        title: 'Pronto para iniciar',
        message: `${exp.nome} pode ser iniciado hoje`,
        experimentId: exp.id,
        experimentName: exp.nome,
        action: {
          label: 'Iniciar',
          href: `/experimentos/${exp.id}/editar`
        },
        timestamp: new Date()
      });
    });

    // Filter out dismissed notifications
    const dismissedIds = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    const filteredNotifications = newNotifications.filter(notif => 
      !dismissedIds.includes(notif.id)
    );

    setNotifications(filteredNotifications);
    setIsVisible(filteredNotifications.length > 0);
  };

  const dismissNotification = (notificationId: string) => {
    // Save to localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    dismissed.push(notificationId);
    localStorage.setItem('dismissed_notifications', JSON.stringify(dismissed));
    
    // Remove from current notifications
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Hide panel if no notifications left
    if (notifications.length === 1) {
      setIsVisible(false);
    }
  };

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'urgent':
        return <Clock className="h-4 w-4 text-red-600" />;
      case 'success':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: SmartNotification['type']) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'urgent':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Notificações Inteligentes
          <Badge variant="secondary" className="text-xs">
            {notifications.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} relative`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                
                {notification.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => window.location.href = notification.action!.href}
                  >
                    {notification.action.label}
                  </Button>
                )}
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 absolute top-2 right-2"
                onClick={() => dismissNotification(notification.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {notifications.length > 3 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsVisible(false)}
          >
            Ocultar Notificações
          </Button>
        )}
      </CardContent>
    </Card>
  );
}