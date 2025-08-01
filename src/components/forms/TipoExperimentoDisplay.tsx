import { Badge } from '@/components/ui/badge';
import { useTipoExperimentoById } from '@/hooks/useTiposFormulario';
import * as icons from 'lucide-react';

interface TipoExperimentoDisplayProps {
  tipoId?: string;
  subtipoId?: string;
  subtipoCustomizado?: string;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TipoExperimentoDisplay({ 
  tipoId, 
  subtipoId, 
  subtipoCustomizado,
  showDescription = false,
  size = 'md'
}: TipoExperimentoDisplayProps) {
  const { data: tipo } = useTipoExperimentoById(tipoId);
  
  if (!tipo) {
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Tipo não especificado
      </Badge>
    );
  }

  const subtipo = tipo.subtipos_experimento?.find(s => s.id === subtipoId);
  const IconComponent = tipo.icone && (icons as any)[tipo.icone] 
    ? (icons as any)[tipo.icone] 
    : icons.Package;

  const sizeClasses = {
    sm: {
      container: 'text-xs',
      icon: 12,
      iconContainer: 'p-1',
      gap: 'gap-1.5'
    },
    md: {
      container: 'text-sm',
      icon: 16,
      iconContainer: 'p-1.5',
      gap: 'gap-2'
    },
    lg: {
      container: 'text-base',
      icon: 20,
      iconContainer: 'p-2',
      gap: 'gap-3'
    }
  };

  const styles = sizeClasses[size];

  return (
    <div className={`flex items-start ${styles.gap} ${styles.container}`}>
      <div 
        className={`${styles.iconContainer} rounded flex items-center justify-center flex-shrink-0`}
        style={{ backgroundColor: `${tipo.cor}20`, color: tipo.cor }}
      >
        <IconComponent size={styles.icon} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            style={{ 
              backgroundColor: tipo.cor,
              color: 'white'
            }}
            className="font-medium"
          >
            {tipo.nome}
          </Badge>
          
          {subtipo && (
            <Badge variant="secondary" className="text-xs">
              {subtipo.nome}
            </Badge>
          )}
          
          {subtipoCustomizado && !subtipo && (
            <Badge variant="outline" className="text-xs">
              {subtipoCustomizado}
            </Badge>
          )}
        </div>
        
        {showDescription && tipo.descricao && (
          <p className="text-muted-foreground mt-1">
            {tipo.descricao}
          </p>
        )}
        
        {showDescription && subtipo?.descricao && (
          <p className="text-muted-foreground text-xs mt-1">
            {subtipo.descricao}
          </p>
        )}
      </div>
    </div>
  );
}