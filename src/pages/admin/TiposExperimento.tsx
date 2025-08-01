import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Star } from 'lucide-react';
import { TipoExperimentoCard } from '@/components/admin/TipoExperimentoCard';
import { TipoExperimentoModal } from '@/components/admin/TipoExperimentoModal';
import { SugestoesCanalMatrix } from '@/components/admin/SugestoesCanalMatrix';
import {
  useTiposExperimento,
  useSubtiposExperimento,
  useUpdateTipoExperimento,
  useCanalTipoSugestoes,
  TipoExperimento,
} from '@/hooks/useTiposExperimento';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';

export default function TiposExperimento() {
  const [selectedTipo, setSelectedTipo] = useState<TipoExperimento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: tipos = [], isLoading } = useTiposExperimento();
  const { data: allSubtipos = [] } = useSubtiposExperimento();
  const { data: sugestoes = [] } = useCanalTipoSugestoes();
  const updateTipo = useUpdateTipoExperimento();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tipos.findIndex(tipo => tipo.id === active.id);
      const newIndex = tipos.findIndex(tipo => tipo.id === over.id);
      
      const reorderedTipos = arrayMove(tipos, oldIndex, newIndex);
      
      // Update ordem for each tipo
      for (let i = 0; i < reorderedTipos.length; i++) {
        await updateTipo.mutateAsync({
          id: reorderedTipos[i].id,
          ordem: i + 1,
        });
      }
    }
  };

  const handleEdit = (tipo: TipoExperimento) => {
    setSelectedTipo(tipo);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setSelectedTipo(null);
    setIsModalOpen(true);
  };

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    await updateTipo.mutateAsync({ id, ativo });
  };

  const getSubtiposCount = (tipoId: string) => {
    return allSubtipos.filter(subtipo => subtipo.tipo_id === tipoId).length;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTipo(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tipos de Experimento</h1>
          <p className="text-muted-foreground">
            Gerencie os tipos e subtipos de experimentos disponíveis no sistema
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus size={16} className="mr-1" />
          Novo Tipo
        </Button>
      </div>

      <Tabs defaultValue="tipos" className="w-full">
        <TabsList>
          <TabsTrigger value="tipos" className="flex items-center gap-2">
            <Settings size={16} />
            Tipos
          </TabsTrigger>
          <TabsTrigger value="sugestoes" className="flex items-center gap-2">
            <Star size={16} />
            Sugestões por Canal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tipos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{tipos.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Tipos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tipos.filter(t => t.ativo).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{allSubtipos.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Subtipos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{sugestoes.length}</div>
                  <div className="text-sm text-muted-foreground">Sugestões Configuradas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tipos.map(t => t.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tipos.map((tipo) => (
                  <TipoExperimentoCard
                    key={tipo.id}
                    tipo={tipo}
                    quantidadeSubtipos={getSubtiposCount(tipo.id)}
                    onEdit={handleEdit}
                    onToggleAtivo={handleToggleAtivo}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {tipos.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Settings size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum tipo cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando o primeiro tipo de experimento
                </p>
                <Button onClick={handleNew}>
                  <Plus size={16} className="mr-1" />
                  Criar Primeiro Tipo
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sugestoes">
          <SugestoesCanalMatrix tipos={tipos} sugestoes={sugestoes} />
        </TabsContent>
      </Tabs>

      <TipoExperimentoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tipo={selectedTipo}
      />
    </div>
  );
}