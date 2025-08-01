import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Palette, Eye } from 'lucide-react';
import { TwitterPicker } from 'react-color';
import { TipoExperimento, SubtipoExperimento, useCreateTipoExperimento, useUpdateTipoExperimento, useSubtiposExperimento, useUpdateSubtipoExperimento } from '@/hooks/useTiposExperimento';
import { SubtiposList } from './SubtiposList';
import * as icons from 'lucide-react';

interface TipoExperimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo?: TipoExperimento | null;
}

const ICON_OPTIONS = [
  'Package', 'Palette', 'Tag', 'Type', 'Users', 'Layout', 'Mail', 'DollarSign',
  'Target', 'Zap', 'Heart', 'Star', 'Lightbulb', 'Settings', 'Layers',
  'BarChart', 'TrendingUp', 'PieChart', 'Activity', 'Globe'
];

const COLOR_OPTIONS = [
  '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1',
  '#14B8A6', '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#8B5A2B'
];

export function TipoExperimentoModal({ isOpen, onClose, tipo }: TipoExperimentoModalProps) {
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    icone: 'Package',
    cor: '#3B82F6',
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const createTipo = useCreateTipoExperimento();
  const updateTipo = useUpdateTipoExperimento();
  const updateSubtipo = useUpdateSubtipoExperimento();
  
  const { data: subtipos = [] } = useSubtiposExperimento(tipo?.id);

  useEffect(() => {
    if (tipo) {
      setFormData({
        codigo: tipo.codigo,
        nome: tipo.nome,
        descricao: tipo.descricao || '',
        icone: tipo.icone || 'Package',
        cor: tipo.cor,
      });
    } else {
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        icone: 'Package',
        cor: '#3B82F6',
      });
    }
  }, [tipo]);

  const handleSubmit = async () => {
    if (!formData.codigo || !formData.nome) return;

    try {
      if (tipo) {
        await updateTipo.mutateAsync({
          id: tipo.id,
          ...formData,
        });
      } else {
        await createTipo.mutateAsync({
          ...formData,
          ordem: 0,
          ativo: true,
        });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tipo:', error);
    }
  };

  const handleSubtiposReorder = async (reorderedSubtipos: SubtipoExperimento[]) => {
    // Update each subtipo with new ordem
    for (const subtipo of reorderedSubtipos) {
      await updateSubtipo.mutateAsync({
        id: subtipo.id,
        ordem: subtipo.ordem,
      });
    }
  };

  const generateCodigoFromNome = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleNomeChange = (nome: string) => {
    setFormData(prev => ({
      ...prev,
      nome,
      // Auto-generate codigo if it's empty or if it matches the previous auto-generated one
      codigo: prev.codigo === '' || prev.codigo === generateCodigoFromNome(prev.nome)
        ? generateCodigoFromNome(nome)
        : prev.codigo
    }));
  };

  // Get icon component for preview
  const IconComponent = (icons as any)[formData.icone] || icons.Package;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tipo ? 'Editar Tipo de Experimento' : 'Novo Tipo de Experimento'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="subtipos" disabled={!tipo}>Subtipos</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  placeholder="Ex: Criativo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="Ex: criativo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o tipo de experimento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select
                  value={formData.icone}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((iconName) => {
                      const Icon = (icons as any)[iconName];
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <Icon size={16} />
                            {iconName}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-20"
                    style={{ backgroundColor: formData.cor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Palette size={16} />
                  </Button>
                  <Input
                    value={formData.cor}
                    onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                    placeholder="#3B82F6"
                  />
                </div>
                
                {showColorPicker && (
                  <div className="absolute z-10 mt-2">
                    <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                    <TwitterPicker
                      color={formData.cor}
                      onChange={(color) => setFormData(prev => ({ ...prev, cor: color.hex }))}
                      colors={COLOR_OPTIONS}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subtipos">
            {tipo && (
              <SubtiposList
                tipoId={tipo.id}
                subtipos={subtipos}
                onReorder={handleSubtiposReorder}
              />
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye size={20} />
                Preview do Tipo
              </h3>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-3 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${formData.cor}20`, color: formData.cor }}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">{formData.nome || 'Nome do Tipo'}</h4>
                    <p className="text-sm text-muted-foreground">{formData.codigo || 'codigo'}</p>
                  </div>
                </div>

                {formData.descricao && (
                  <p className="text-muted-foreground mb-3">{formData.descricao}</p>
                )}

                <div className="flex gap-2">
                  <Badge 
                    style={{ backgroundColor: formData.cor }}
                    className="text-white"
                  >
                    Ativo
                  </Badge>
                  <Badge variant="secondary">
                    {subtipos.length} subtipo{subtipos.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {formData.nome && formData.codigo && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✓ Este tipo aparecerá nos formulários de experimento
                  </p>
                </div>
              )}

              {(!formData.nome || !formData.codigo) && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠ Preencha nome e código para ativar este tipo
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X size={16} className="mr-1" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.nome || !formData.codigo}
          >
            <Save size={16} className="mr-1" />
            {tipo ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}