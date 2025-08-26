import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTiposExperimentoAtivos, TipoComSubtipos } from '@/hooks/useTiposFormulario';
import { Control, useWatch } from 'react-hook-form';
import { useState, useEffect } from 'react';
import * as icons from 'lucide-react';

interface TipoExperimentoSelectorProps {
  control: Control<any>;
}

export function TipoExperimentoSelector({ control }: TipoExperimentoSelectorProps) {
  const [showOutroSubtipo, setShowOutroSubtipo] = useState(false);
  const [outroSubtipoText, setOutroSubtipoText] = useState('');
  
  const { data: tipos = [], isLoading: loadingTipos } = useTiposExperimentoAtivos();
  
  const tipoSelecionado = useWatch({ control, name: 'tipo_experimento_id' });
  const subtipoSelecionado = useWatch({ control, name: 'subtipo_experimento_id' });
  
  const tipoAtual = tipos.find(t => t.id === tipoSelecionado);
  const subtiposDoTipo = tipoAtual?.subtipos_experimento || [];
  
  useEffect(() => {
    setShowOutroSubtipo(subtipoSelecionado === 'outro');
  }, [subtipoSelecionado]);

  const sortedTipos = [...tipos].sort((a, b) => a.ordem - b.ordem);

  if (loadingTipos) {
    return <div className="text-sm text-muted-foreground">Carregando tipos...</div>;
  }

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="tipo_experimento_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Experimento *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de experimento" />
              </SelectTrigger>
              <SelectContent>
                {sortedTipos.map((tipo) => {
                  const IconComponent = tipo.icone && (icons as any)[tipo.icone] 
                    ? (icons as any)[tipo.icone] 
                    : icons.Package;
                  
                  return (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      <div className="flex items-center gap-3 w-full">
                        <div 
                          className="p-1.5 rounded flex items-center justify-center"
                          style={{ backgroundColor: `${tipo.cor}20`, color: tipo.cor }}
                        >
                          <IconComponent size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{tipo.nome}</span>
                          </div>
                          {tipo.descricao && (
                            <p className="text-xs text-muted-foreground">
                              {tipo.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {tipoAtual && subtiposDoTipo.length > 0 && (
        <FormField
          control={control}
          name="subtipo_experimento_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtipo (Recomendado)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o subtipo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {subtiposDoTipo.map((subtipo) => (
                    <SelectItem key={subtipo.id} value={subtipo.id}>
                      <div>
                        <div className="font-medium">{subtipo.nome}</div>
                        {subtipo.descricao && (
                          <div className="text-xs text-muted-foreground">
                            {subtipo.descricao}
                          </div>
                        )}
                        {subtipo.exemplos && (
                          <div className="text-xs text-muted-foreground italic">
                            Ex: {subtipo.exemplos}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="outro">
                    <div className="font-medium text-muted-foreground">
                      Outro (especificar)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showOutroSubtipo && (
        <FormField
          control={control}
          name="subtipo_customizado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especifique o subtipo</FormLabel>
              <Input
                {...field}
                placeholder="Descreva o subtipo específico do seu experimento"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Preview do tipo selecionado */}
      {tipoAtual && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${tipoAtual.cor}20`, color: tipoAtual.cor }}
              >
                {(() => {
                  const IconComponent = tipoAtual.icone && (icons as any)[tipoAtual.icone] 
                    ? (icons as any)[tipoAtual.icone] 
                    : icons.Package;
                  return <IconComponent size={20} />;
                })()}
              </div>
              <div>
                <h4 className="font-medium">{tipoAtual.nome}</h4>
                {tipoAtual.descricao && (
                  <p className="text-sm text-muted-foreground">{tipoAtual.descricao}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}