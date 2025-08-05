import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Plus, Trophy, Star, Target, CheckCircle2, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Tag {
  id: string;
  nome: string;
}

interface ResultadosFormProps {
  experimentoId: string;
  resultadoExistente?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ResultadosForm({ experimentoId, resultadoExistente, onSuccess, onCancel }: ResultadosFormProps) {
  const [loading, setLoading] = useState(false);
  const [tagsDisponiveis, setTagsDisponiveis] = useState<Tag[]>([]);
  const [openTagPopover, setOpenTagPopover] = useState(false);
  
  // Campos do formulário
  const [fatos, setFatos] = useState(resultadoExistente?.fatos || '');
  const [causas, setCausas] = useState(resultadoExistente?.causas || '');
  const [acoes, setAcoes] = useState(resultadoExistente?.acoes || '');
  const [aprendizados, setAprendizados] = useState(resultadoExistente?.aprendizados || '');
  const [roi, setRoi] = useState<number>(resultadoExistente?.roi || 0);
  const [sucesso, setSucesso] = useState<boolean>(resultadoExistente?.sucesso || false);
  
  // Novos campos
  const [tags, setTags] = useState<string[]>(resultadoExistente?.tags || []);
  const [impacto, setImpacto] = useState([resultadoExistente?.matriz_ice?.impacto || 3]);
  const [confianca, setConfianca] = useState([resultadoExistente?.matriz_ice?.confianca || 3]);
  const [facilidade, setFacilidade] = useState([resultadoExistente?.matriz_ice?.facilidade || 3]);
  const [experimentoSucesso, setExperimentoSucesso] = useState<boolean>(resultadoExistente?.experimento_sucesso || false);

  // Buscar tags existentes para autocomplete
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('resultados')
          .select('tags')
          .not('tags', 'is', null);
        
        if (error) throw error;
        
        const allTags = new Set<string>();
        data?.forEach(resultado => {
          if (resultado.tags && Array.isArray(resultado.tags)) {
            resultado.tags.forEach((tag: string) => allTags.add(tag));
          }
        });
        
        setTagsDisponiveis(Array.from(allTags).map((tag, index) => ({ 
          id: index.toString(), 
          nome: tag 
        })));
      } catch (error) {
        console.error('Erro ao buscar tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setOpenTagPopover(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const matrizIce = {
        impacto: impacto[0],
        confianca: confianca[0],
        facilidade: facilidade[0],
        score: ((impacto[0] + confianca[0] + facilidade[0]) / 3).toFixed(1)
      };

      const dadosResultado = {
        experimento_id: experimentoId,
        fatos,
        causas,
        acoes,
        aprendizados,
        roi: roi || null,
        sucesso,
        tags: tags.length > 0 ? tags : null,
        matriz_ice: matrizIce,
        experimento_sucesso: experimentoSucesso
      };

      let query;
      if (resultadoExistente) {
        // Atualizar resultado existente
        query = supabase
          .from('resultados')
          .update(dadosResultado)
          .eq('id', resultadoExistente.id);
      } else {
        // Criar novo resultado
        query = supabase
          .from('resultados')
          .insert(dadosResultado);
      }

      const { error } = await query;
      
      if (error) throw error;

      // Se marcado como experimento de sucesso, atualizar na tabela experimentos
      if (experimentoSucesso) {
        await supabase
          .from('experimentos')
          .update({ experimento_sucesso: true })
          .eq('id', experimentoId);
      }

      toast.success(resultadoExistente ? 'Resultado atualizado com sucesso!' : 'Resultado documentado com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
      toast.error('Erro ao salvar resultado');
    } finally {
      setLoading(false);
    }
  };

  const scoreICE = ((impacto[0] + confianca[0] + facilidade[0]) / 3).toFixed(1);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Documentar Resultados
          </CardTitle>
          <CardDescription>
            Registre os resultados e aprendizados do experimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status e ROI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roi">ROI (%)</Label>
              <Input
                id="roi"
                type="number"
                step="0.1"
                value={roi}
                onChange={(e) => setRoi(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 23.5"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sucesso"
                  checked={sucesso}
                  onCheckedChange={(checked) => setSucesso(checked as boolean)}
                />
                <Label htmlFor="sucesso">Experimento bem-sucedido</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Análise FCA */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Análise FCA</h3>
            
            <div className="space-y-2">
              <Label htmlFor="fatos">Fatos</Label>
              <Textarea
                id="fatos"
                value={fatos}
                onChange={(e) => setFatos(e.target.value)}
                placeholder="Descreva os fatos observados durante o experimento..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="causas">Causas</Label>
              <Textarea
                id="causas"
                value={causas}
                onChange={(e) => setCausas(e.target.value)}
                placeholder="Identifique as possíveis causas dos resultados..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acoes">Ações</Label>
              <Textarea
                id="acoes"
                value={acoes}
                onChange={(e) => setAcoes(e.target.value)}
                placeholder="Quais ações devem ser tomadas baseadas nos resultados..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aprendizados">Aprendizados Principais</Label>
              <Textarea
                id="aprendizados"
                value={aprendizados}
                onChange={(e) => setAprendizados(e.target.value)}
                placeholder="Principais insights e aprendizados obtidos..."
                rows={4}
              />
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 w-4 h-4"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            <Popover open={openTagPopover} onOpenChange={setOpenTagPopover}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Tag
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <Command>
                  <CommandInput placeholder="Buscar ou criar tag..." />
                  <CommandList>
                    <CommandEmpty>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
                          if (input?.value) {
                            handleAddTag(input.value);
                          }
                        }}
                      >
                        Criar tag
                      </Button>
                    </CommandEmpty>
                    <CommandGroup>
                      {tagsDisponiveis.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => handleAddTag(tag.nome)}
                        >
                          {tag.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          {/* Matriz ICE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Matriz ICE</h3>
              <Badge variant="outline" className="ml-auto">
                Score: {scoreICE}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Impacto: {impacto[0]}</Label>
                <Slider
                  value={impacto}
                  onValueChange={setImpacto}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Qual o impacto nos resultados?
                </p>
              </div>

              <div className="space-y-2">
                <Label>Confiança: {confianca[0]}</Label>
                <Slider
                  value={confianca}
                  onValueChange={setConfianca}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Quão confiáveis são os dados?
                </p>
              </div>

              <div className="space-y-2">
                <Label>Facilidade: {facilidade[0]}</Label>
                <Slider
                  value={facilidade}
                  onValueChange={setFacilidade}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Quão fácil foi executar?
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Experimento de Sucesso */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Checkbox
                id="experimento-sucesso"
                checked={experimentoSucesso}
                onCheckedChange={(checked) => setExperimentoSucesso(checked as boolean)}
              />
              <Label htmlFor="experimento-sucesso" className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Marcar como Experimento de Sucesso
              </Label>
              {experimentoSucesso && (
                <Trophy className="w-5 h-5 text-yellow-500 ml-auto" />
              )}
            </div>
            {experimentoSucesso && (
              <p className="text-sm text-muted-foreground">
                Este experimento será destacado na galeria de sucessos com um troféu 🏆
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : resultadoExistente ? 'Atualizar Resultado' : 'Documentar Resultado'}
        </Button>
      </div>
    </form>
  );
}