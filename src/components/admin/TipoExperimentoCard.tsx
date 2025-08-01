import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, GripVertical } from 'lucide-react';
import { TipoExperimento } from '@/hooks/useTiposExperimento';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import * as icons from 'lucide-react';

interface TipoExperimentoCardProps {
  tipo: TipoExperimento;
  quantidadeSubtipos?: number;
  onEdit: (tipo: TipoExperimento) => void;
  onToggleAtivo: (id: string, ativo: boolean) => void;
}

export function TipoExperimentoCard({ 
  tipo, 
  quantidadeSubtipos = 0, 
  onEdit, 
  onToggleAtivo 
}: TipoExperimentoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: tipo.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // Get the icon component dynamically
  const IconComponent = tipo.icone && (icons as any)[tipo.icone] 
    ? (icons as any)[tipo.icone] 
    : icons.Package;

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`transition-all duration-200 ${
        isDragging ? 'ring-2 ring-primary' : ''
      } ${!tipo.ativo ? 'opacity-60' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${tipo.cor}20`, color: tipo.cor }}
            >
              <IconComponent size={20} />
            </div>
            <div>
              <CardTitle className="text-lg">{tipo.nome}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {tipo.codigo}
              </p>
            </div>
          </div>
          <div 
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} className="text-muted-foreground" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {tipo.descricao && (
          <p className="text-sm text-muted-foreground mb-3">
            {tipo.descricao}
          </p>
        )}
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {quantidadeSubtipos} subtipo{quantidadeSubtipos !== 1 ? 's' : ''}
          </Badge>
          <Badge 
            variant={tipo.ativo ? "default" : "secondary"}
            style={{ backgroundColor: tipo.ativo ? tipo.cor : undefined }}
          >
            {tipo.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2">
          <Switch
            checked={tipo.ativo}
            onCheckedChange={(checked) => onToggleAtivo(tipo.id, checked)}
          />
          <span className="text-sm text-muted-foreground">
            {tipo.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(tipo)}
        >
          <Edit size={16} className="mr-1" />
          Editar
        </Button>
      </CardFooter>
    </Card>
  );
}