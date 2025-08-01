import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Play, 
  CheckCircle, 
  Pause, 
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ExperimentStatus = 
  | 'planejado' 
  | 'em_andamento' 
  | 'concluido' 
  | 'pausado' 
  | 'cancelado';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<ExperimentStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  textColor: string;
}> = {
  planejado: {
    label: 'Planejado',
    icon: Calendar,
    color: 'border-blue-200 bg-blue-50',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  em_andamento: {
    label: 'Em Andamento',
    icon: Play,
    color: 'border-yellow-200 bg-yellow-50',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  concluido: {
    label: 'Concluído',
    icon: CheckCircle,
    color: 'border-green-200 bg-green-50',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  pausado: {
    label: 'Pausado',
    icon: Pause,
    color: 'border-orange-200 bg-orange-50',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  cancelado: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'border-red-200 bg-red-50',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  }
};

export function StatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className 
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_') as ExperimentStatus;
  const config = statusConfig[normalizedStatus] || statusConfig.planejado;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const IconComponent = config.icon;

  return (
    <Badge 
      variant="outline"
      className={cn(
        config.color,
        config.textColor,
        sizeClasses[size],
        'font-medium border flex items-center gap-1.5',
        className
      )}
    >
      {showIcon && (
        <IconComponent className={iconSizes[size]} />
      )}
      {config.label}
    </Badge>
  );
}

export function getStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_') as ExperimentStatus;
  const config = statusConfig[normalizedStatus] || statusConfig.planejado;
  return config.color;
}

export function getStatusIcon(status: string) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_') as ExperimentStatus;
  const config = statusConfig[normalizedStatus] || statusConfig.planejado;
  return config.icon;
}

// Status transition helpers
export const statusTransitions: Record<ExperimentStatus, ExperimentStatus[]> = {
  planejado: ['em_andamento', 'cancelado'],
  em_andamento: ['pausado', 'concluido', 'cancelado'],
  pausado: ['em_andamento', 'cancelado'],
  concluido: [], // Final state
  cancelado: [] // Final state
};

export function getAvailableStatusTransitions(currentStatus: string): ExperimentStatus[] {
  const normalizedStatus = currentStatus.toLowerCase().replace(/\s+/g, '_') as ExperimentStatus;
  return statusTransitions[normalizedStatus] || [];
}