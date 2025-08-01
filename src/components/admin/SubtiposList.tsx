import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, GripVertical, Trash2, Save, X } from 'lucide-react';
import { SubtipoExperimento, useCreateSubtipoExperimento, useUpdateSubtipoExperimento, useDeleteSubtipoExperimento } from '@/hooks/useTiposExperimento';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SubtiposListProps {
  tipoId: string;
  subtipos: SubtipoExperimento[];
  onReorder: (subtipos: SubtipoExperimento[]) => void;
}

interface SubtipoItemProps {
  subtipo: SubtipoExperimento;
  onEdit: (subtipo: SubtipoExperimento) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onSave: (data: Partial<SubtipoExperimento> & { id: string }) => void;
  onCancel: () => void;
}

function SubtipoItem({ subtipo, onEdit, onDelete, isEditing, onSave, onCancel }: SubtipoItemProps) {
  const [editData, setEditData] = useState({
    nome: subtipo.nome,
    descricao: subtipo.descricao || '',
    exemplos: subtipo.exemplos || '',
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtipo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onSave({
      id: subtipo.id,
      ...editData,
    });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={isDragging ? 'ring-2 ring-primary' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div 
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded mt-2"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={16} className="text-muted-foreground" />
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`nome-${subtipo.id}`}>Nome</Label>
                    <Input
                      id={`nome-${subtipo.id}`}
                      value={editData.nome}
                      onChange={(e) => setEditData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Nome do subtipo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`descricao-${subtipo.id}`}>Descrição</Label>
                    <Textarea
                      id={`descricao-${subtipo.id}`}
                      value={editData.descricao}
                      onChange={(e) => setEditData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição do subtipo"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`exemplos-${subtipo.id}`}>Exemplos</Label>
                    <Textarea
                      id={`exemplos-${subtipo.id}`}
                      value={editData.exemplos}
                      onChange={(e) => setEditData(prev => ({ ...prev, exemplos: e.target.value }))}
                      placeholder="Exemplos de uso"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      <Save size={16} className="mr-1" />
                      Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={onCancel}>
                      <X size={16} className="mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium mb-1">{subtipo.nome}</h4>
                  {subtipo.descricao && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {subtipo.descricao}
                    </p>
                  )}
                  {subtipo.exemplos && (
                    <p className="text-xs text-muted-foreground italic">
                      Exemplos: {subtipo.exemplos}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(subtipo)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(subtipo.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SubtiposList({ tipoId, subtipos, onReorder }: SubtiposListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtipo, setNewSubtipo] = useState({
    nome: '',
    descricao: '',
    exemplos: '',
  });

  const createSubtipo = useCreateSubtipoExperimento();
  const updateSubtipo = useUpdateSubtipoExperimento();
  const deleteSubtipo = useDeleteSubtipoExperimento();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = subtipos.findIndex(item => item.id === active.id);
      const newIndex = subtipos.findIndex(item => item.id === over.id);
      
      const reorderedSubtipos = arrayMove(subtipos, oldIndex, newIndex);
      
      // Update ordem for each item
      const updatedSubtipos = reorderedSubtipos.map((subtipo, index) => ({
        ...subtipo,
        ordem: index + 1,
      }));
      
      onReorder(updatedSubtipos);
    }
  };

  const handleEdit = (subtipo: SubtipoExperimento) => {
    setEditingId(subtipo.id);
  };

  const handleSave = async (data: Partial<SubtipoExperimento> & { id: string }) => {
    await updateSubtipo.mutateAsync(data);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este subtipo?')) {
      await deleteSubtipo.mutateAsync(id);
    }
  };

  const handleAddNew = async () => {
    if (!newSubtipo.nome.trim()) return;

    await createSubtipo.mutateAsync({
      tipo_id: tipoId,
      nome: newSubtipo.nome,
      descricao: newSubtipo.descricao || undefined,
      exemplos: newSubtipo.exemplos || undefined,
      ordem: subtipos.length + 1,
      ativo: true,
    });

    setNewSubtipo({ nome: '', descricao: '', exemplos: '' });
    setIsAdding(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subtipos</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus size={16} className="mr-1" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="novo-nome">Nome</Label>
                  <Input
                    id="novo-nome"
                    value={newSubtipo.nome}
                    onChange={(e) => setNewSubtipo(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do subtipo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nova-descricao">Descrição</Label>
                  <Textarea
                    id="nova-descricao"
                    value={newSubtipo.descricao}
                    onChange={(e) => setNewSubtipo(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição do subtipo"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="novos-exemplos">Exemplos</Label>
                  <Textarea
                    id="novos-exemplos"
                    value={newSubtipo.exemplos}
                    onChange={(e) => setNewSubtipo(prev => ({ ...prev, exemplos: e.target.value }))}
                    placeholder="Exemplos de uso"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddNew}>
                    <Save size={16} className="mr-1" />
                    Salvar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setIsAdding(false);
                      setNewSubtipo({ nome: '', descricao: '', exemplos: '' });
                    }}
                  >
                    <X size={16} className="mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={subtipos.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {subtipos.map((subtipo) => (
              <SubtipoItem
                key={subtipo.id}
                subtipo={subtipo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isEditing={editingId === subtipo.id}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ))}
          </SortableContext>
        </DndContext>

        {subtipos.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum subtipo cadastrado</p>
            <p className="text-sm">Clique em "Adicionar" para criar o primeiro subtipo</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}