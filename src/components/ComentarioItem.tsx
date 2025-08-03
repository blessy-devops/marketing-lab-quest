import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Edit, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCurtidas } from '@/hooks/useCurtidas';

interface ComentarioItemProps {
  comentario: any;
  user: any;
  editingId: string | null;
  editingText: string;
  setEditingId: (id: string | null) => void;
  setEditingText: (text: string) => void;
  editarComentario: (id: string, texto: string) => void;
  excluirComentario: (id: string) => void;
  onEditClick: (comentario: any) => void;
}

export const ComentarioItem: React.FC<ComentarioItemProps> = ({
  comentario,
  user,
  editingId,
  editingText,
  setEditingId,
  setEditingText,
  editarComentario,
  excluirComentario,
  onEditClick
}) => {
  const { curtidas, userCurtiu, totalCurtidas, toggleCurtida } = useCurtidas(comentario.id);

  return (
    <div className="border-l-4 border-primary/20 pl-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 flex-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {comentario.usuario_nome?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm capitalize">
                {comentario.usuario_nome || 'Usuário'}
              </p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comentario.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
              {comentario.updated_at && comentario.updated_at !== comentario.created_at && (
                <Badge variant="outline" className="text-xs">
                  Editado
                </Badge>
              )}
            </div>
            
            {/* Cargo do usuário */}
            {comentario.usuario_cargo && (
              <p className="text-xs text-muted-foreground mb-2">
                {comentario.usuario_cargo}
              </p>
            )}
            
            {editingId === comentario.id ? (
              <div className="space-y-2">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full p-2 border rounded min-h-[60px] text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await editarComentario(comentario.id, editingText);
                    }}
                  >
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setEditingText("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
                  {comentario.texto}
                </p>
                
                {/* Botão de curtir */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={userCurtiu ? "default" : "ghost"}
                    onClick={toggleCurtida}
                    className="h-7 px-2 gap-1"
                  >
                    <Heart className={`h-3 w-3 ${userCurtiu ? 'fill-current' : ''}`} />
                    {totalCurtidas > 0 && <span className="text-xs">{totalCurtidas}</span>}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Botões de ação (só para comentários próprios) */}
        {user && comentario.usuario_id === user.id && editingId !== comentario.id && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditClick(comentario)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => excluirComentario(comentario.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};