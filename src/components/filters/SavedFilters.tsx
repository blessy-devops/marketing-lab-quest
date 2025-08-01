import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Filter, 
  Save, 
  Trash2, 
  Star,
  Calendar,
  User,
  Target,
  TrendingUp
} from 'lucide-react';
import { CANAIS_OPTIONS } from '@/constants/canais';
import { useTiposExperimentoAtivos } from '@/hooks/useTiposFormulario';

export interface ExperimentFilter {
  id?: string;
  name: string;
  status?: string[];
  canais?: string[];
  tipos?: string[];
  responsavel?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  isSuccess?: boolean;
  minROI?: number;
  isStarred?: boolean;
}

interface SavedFiltersProps {
  currentFilter: ExperimentFilter;
  onFilterChange: (filter: ExperimentFilter) => void;
  onApplyFilter: (filter: ExperimentFilter) => void;
}

const defaultFilters: ExperimentFilter[] = [
  {
    id: 'my_experiments',
    name: 'Meus Experimentos',
    status: ['em_andamento', 'planejado'],
    isStarred: true
  },
  {
    id: 'last_30_days',
    name: 'Últimos 30 dias',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    isStarred: true
  },
  {
    id: 'top_performers',
    name: 'Top Performers',
    isSuccess: true,
    minROI: 10,
    isStarred: true
  },
  {
    id: 'completed_no_results',
    name: 'Concluídos sem Resultados',
    status: ['concluido'],
    isStarred: false
  }
];

export function SavedFilters({ currentFilter, onFilterChange, onApplyFilter }: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<ExperimentFilter[]>(defaultFilters);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [editingFilter, setEditingFilter] = useState<ExperimentFilter>(currentFilter);
  
  const { data: tipos = [] } = useTiposExperimentoAtivos();

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('experiment_filters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedFilters([...defaultFilters, ...parsed]);
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage
  const saveFiltersToStorage = (filters: ExperimentFilter[]) => {
    const customFilters = filters.filter(f => !f.id?.startsWith('my_') && !f.id?.startsWith('last_') && !f.id?.startsWith('top_') && !f.id?.startsWith('completed_'));
    localStorage.setItem('experiment_filters', JSON.stringify(customFilters));
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    
    const newFilter: ExperimentFilter = {
      ...editingFilter,
      id: Date.now().toString(),
      name: filterName,
      isStarred: false
    };
    
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    saveFiltersToStorage(updated);
    
    setFilterName('');
    setIsSheetOpen(false);
  };

  const handleDeleteFilter = (filterId: string) => {
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    saveFiltersToStorage(updated);
  };

  const handleToggleStar = (filterId: string) => {
    const updated = savedFilters.map(f => 
      f.id === filterId ? { ...f, isStarred: !f.isStarred } : f
    );
    setSavedFilters(updated);
    saveFiltersToStorage(updated);
  };

  const starredFilters = savedFilters.filter(f => f.isStarred);

  return (
    <div className="space-y-4">
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {starredFilters.map((filter) => (
          <Button
            key={filter.id}
            variant="outline"
            size="sm"
            onClick={() => onApplyFilter(filter)}
            className="flex items-center gap-1"
          >
            <Star className="h-3 w-3 fill-current text-yellow-500" />
            {filter.name}
          </Button>
        ))}
      </div>

      {/* Advanced Filter Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filtros Avançados
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros Avançados</SheetTitle>
            <SheetDescription>
              Configure filtros personalizados para seus experimentos
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Filter Name */}
            <div className="space-y-2">
              <Label htmlFor="filter-name">Nome do Filtro (para salvar)</Label>
              <Input
                id="filter-name"
                placeholder="Ex: Experimentos de Email Marketing"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="space-y-2">
                {['planejado', 'em_andamento', 'pausado', 'concluido', 'cancelado'].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={editingFilter.status?.includes(status) || false}
                      onCheckedChange={(checked) => {
                        const newStatus = checked
                          ? [...(editingFilter.status || []), status]
                          : (editingFilter.status || []).filter(s => s !== status);
                        setEditingFilter({ ...editingFilter, status: newStatus });
                      }}
                    />
                    <Label htmlFor={`status-${status}`} className="capitalize">
                      {status.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Channels Filter */}
            <div className="space-y-2">
              <Label>Canais</Label>
              <Select
                value=""
                onValueChange={(canal) => {
                  const newCanais = editingFilter.canais?.includes(canal)
                    ? editingFilter.canais.filter(c => c !== canal)
                    : [...(editingFilter.canais || []), canal];
                  setEditingFilter({ ...editingFilter, canais: newCanais });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar canais" />
                </SelectTrigger>
                <SelectContent>
                  {CANAIS_OPTIONS.map((canal) => (
                    <SelectItem key={canal.value} value={canal.value}>
                      {canal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {editingFilter.canais && editingFilter.canais.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {editingFilter.canais.map((canal) => (
                    <Badge
                      key={canal}
                      variant="secondary"
                      className="text-xs cursor-pointer"
                      onClick={() => {
                        const newCanais = editingFilter.canais?.filter(c => c !== canal);
                        setEditingFilter({ ...editingFilter, canais: newCanais });
                      }}
                    >
                      {canal} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Types Filter */}
            <div className="space-y-2">
              <Label>Tipos de Experimento</Label>
              <Select
                value=""
                onValueChange={(tipo) => {
                  const newTipos = editingFilter.tipos?.includes(tipo)
                    ? editingFilter.tipos.filter(t => t !== tipo)
                    : [...(editingFilter.tipos || []), tipo];
                  setEditingFilter({ ...editingFilter, tipos: newTipos });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipos" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {editingFilter.tipos && editingFilter.tipos.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {editingFilter.tipos.map((tipoId) => {
                    const tipo = tipos.find(t => t.id === tipoId);
                    return (
                      <Badge
                        key={tipoId}
                        variant="secondary"
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          const newTipos = editingFilter.tipos?.filter(t => t !== tipoId);
                          setEditingFilter({ ...editingFilter, tipos: newTipos });
                        }}
                      >
                        {tipo?.nome} ×
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Success Filter */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="success-filter"
                  checked={editingFilter.isSuccess === true}
                  onCheckedChange={(checked) => {
                    setEditingFilter({ 
                      ...editingFilter, 
                      isSuccess: checked ? true : undefined 
                    });
                  }}
                />
                <Label htmlFor="success-filter">Apenas experimentos bem-sucedidos</Label>
              </div>
            </div>

            {/* ROI Filter */}
            <div className="space-y-2">
              <Label htmlFor="min-roi">ROI mínimo (%)</Label>
              <Input
                id="min-roi"
                type="number"
                placeholder="Ex: 10"
                value={editingFilter.minROI || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  setEditingFilter({ ...editingFilter, minROI: value });
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>
                <Save className="h-4 w-4 mr-1" />
                Salvar Filtro
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onApplyFilter(editingFilter)}
              >
                Aplicar
              </Button>
            </div>
          </div>

          {/* Saved Filters List */}
          <div className="mt-8 space-y-4">
            <h4 className="font-medium">Filtros Salvos</h4>
            {savedFilters.map((filter) => (
              <div 
                key={filter.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(filter.id!)}
                    >
                      <Star 
                        className={`h-4 w-4 ${
                          filter.isStarred 
                            ? 'fill-current text-yellow-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </Button>
                    <span className="font-medium text-sm">{filter.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApplyFilter(filter)}
                  >
                    Aplicar
                  </Button>
                  {!filter.id?.startsWith('my_') && !filter.id?.startsWith('last_') && 
                   !filter.id?.startsWith('top_') && !filter.id?.startsWith('completed_') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFilter(filter.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}