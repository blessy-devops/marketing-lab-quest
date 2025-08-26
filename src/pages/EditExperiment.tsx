import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, CalendarIcon, Plus, X, Brain, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CANAIS_OPTIONS, getChannelsByCategory } from "@/constants/canais";
import { useExperimentosComResultados } from "@/hooks/useSupabaseData";
import { CanaisSelector } from "@/components/forms/CanaisSelector";
import { Form, FormField, FormItem, FormControl, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { UnitSelector } from "@/components/forms/UnitSelector";
import { TipoExperimentoSelector } from "@/components/forms/TipoExperimentoSelector";

interface FormData {
  nome: string;
  tipo_experimento_id?: string;
  subtipo_experimento_id?: string;
  subtipo_customizado?: string;
  responsavel?: string;
  data_inicio?: Date;
  data_fim?: Date;
  status: string;
  canais: string[] ;
  hipotese: string;
  metricas: Array<{
    nome: string;
    valor: number;
    unidade?: string;
  }>;
  // Configurações de IA
  base_conhecimento?: boolean;
  gerar_playbook?: boolean;
  tags?: string[];
}

const statusOptions = [
  { value: "planejado", label: "Planejado" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "pausado", label: "Pausado" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" }
];


export default function EditExperiment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<any[]>([]);
  const [isAdvancedConfigOpen, setIsAdvancedConfigOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const { data: experimentos } = useExperimentosComResultados();

  const experimento = experimentos?.find(exp => exp.id === id);

  const form = useForm<FormData>({
    defaultValues: {
      nome: "",
      tipo_experimento_id: undefined,
      subtipo_experimento_id: undefined,
      subtipo_customizado: "",
      responsavel: "",
      status: "planejado",
      canais: [],
      hipotese: "",
      metricas: [{ nome: "", valor: 0, unidade: "" }],
      base_conhecimento: true,
      gerar_playbook: false,
      tags: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "metricas"
  });

  const status = form.watch('status');
  const tags = form.watch('tags') || [];

  // Sugestões de tags
  const tagSuggestions = [
    "promoção", "lançamento", "email", "urgência", "black-friday", 
    "gap", "teste-preco", "frete-gratis", "a-b-test", "conversao",
    "checkout", "cta", "landing-page", "mobile", "desktop"
  ];

  // Preencher formulário com dados do experimento
  useEffect(() => {
    const fetchExperimentoData = async () => {
      if (!experimento) return;

      // Buscar métricas do experimento
      const { data: metricasData } = await supabase
        .from('metricas')
        .select('*')
        .eq('experimento_id', id);

      setMetricas(metricasData || []);

      form.reset({
        nome: experimento.nome,
        tipo_experimento_id: (experimento as any).tipo_experimento_id || undefined,
        subtipo_experimento_id: (experimento as any).subtipo_experimento_id || undefined,
        subtipo_customizado: (experimento as any).subtipo_customizado || "",
        responsavel: experimento.responsavel || "",
        status: experimento.status || "planejado",
        canais: experimento.canais || [],
        hipotese: experimento.hipotese || "",
        data_inicio: experimento.data_inicio ? new Date(experimento.data_inicio) : undefined,
        data_fim: experimento.data_fim ? new Date(experimento.data_fim) : undefined,
        metricas: metricasData?.length ? metricasData.map(m => ({
          nome: m.nome,
          valor: Number(m.valor) || 0,
          unidade: m.unidade || ""
        })) : [{ nome: "", valor: 0, unidade: "" }],
        base_conhecimento: (experimento as any).base_conhecimento ?? true,
        gerar_playbook: false, // Always false by default for editing
        tags: (experimento as any).tags || []
      });
      
      setLoading(false);
    };

    fetchExperimentoData();
  }, [experimento, form, id]);

  if (!hasRole('editor')) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para editar experimentos.
          </p>
          <Button onClick={() => navigate("/experimentos")}>
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !experimento) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Atualizar experimento
      const { error: experimentoError } = await supabase
        .from('experimentos')
        .update({
          nome: data.nome,
          tipo_experimento_id: data.tipo_experimento_id,
          subtipo_experimento_id: data.subtipo_experimento_id,
          subtipo_customizado: data.subtipo_customizado,
          responsavel: data.responsavel,
          status: data.status,
          canais: data.canais,
          hipotese: data.hipotese,
          data_inicio: data.data_inicio?.toISOString().split('T')[0],
          data_fim: data.data_fim?.toISOString().split('T')[0],
          base_conhecimento: data.base_conhecimento,
          tags: data.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (experimentoError) throw experimentoError;

      // Deletar métricas existentes
      await supabase
        .from('metricas')
        .delete()
        .eq('experimento_id', id);

      // Inserir novas métricas
      if (data.metricas.length > 0) {
        const metricasData = data.metricas
          .filter(m => m.nome.trim())
          .map(metrica => ({
            experimento_id: id,
            nome: metrica.nome,
            valor: metrica.valor,
            unidade: metrica.unidade,
            tipo: 'esperada'
          }));

        if (metricasData.length > 0) {
          const { error: metricasError } = await supabase
            .from('metricas')
            .insert(metricasData);

          if (metricasError) throw metricasError;
        }
      }

      toast.success('Experimento atualizado com sucesso!');
      navigate(`/experimentos/${id}`);
      
    } catch (error) {
      console.error('Erro ao atualizar experimento:', error);
      toast.error('Erro ao atualizar experimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      form.setValue('tags', [...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/experimentos/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Experimento</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Básicas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Defina as informações principais do seu experimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Experimento</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Teste botão CTA vermelho vs azul"
                  {...form.register("nome", { required: "Nome é obrigatório" })}
                />
                {form.formState.errors.nome && (
                  <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <TipoExperimentoSelector control={form.control} />

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.watch("status")}
                    onValueChange={(value) => form.setValue("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  placeholder="Nome do responsável pelo experimento"
                  {...form.register("responsavel")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hipotese">Hipótese</Label>
                <Textarea
                  id="hipotese"
                  placeholder="Descreva sua hipótese..."
                  className="min-h-[100px]"
                  {...form.register("hipotese", { required: "Hipótese é obrigatória" })}
                />
                {form.formState.errors.hipotese && (
                  <p className="text-sm text-destructive">{form.formState.errors.hipotese.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <div className="space-y-6">
            {/* Datas */}
            <Card>
              <CardHeader>
                <CardTitle>Período</CardTitle>
                <CardDescription>
                  Configure as datas do experimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.watch("data_inicio") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("data_inicio") ? (
                          format(form.watch("data_inicio")!, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch("data_inicio")}
                        onSelect={(date) => form.setValue("data_inicio", date)}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Data de Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.watch("data_fim") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("data_fim") ? (
                          format(form.watch("data_fim")!, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch("data_fim")}
                        onSelect={(date) => form.setValue("data_fim", date)}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Canais */}
            <Card>
              <CardHeader>
                <CardTitle>Canais</CardTitle>
                <CardDescription>
                  Selecione os canais onde o experimento será executado
                </CardDescription>
              </CardHeader>
               <CardContent>
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="canais"
                    render={() => (
                      <FormItem>
                        <CanaisSelector control={form.control} />
                      </FormItem>
                    )}
                  />
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Configurações Avançadas */}
        <Card>
          <Collapsible open={isAdvancedConfigOpen} onOpenChange={setIsAdvancedConfigOpen}>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                  <div className="text-left">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      Configurações Avançadas
                    </CardTitle>
                    <CardDescription>
                      Configure integrações com IA e tags de categorização
                    </CardDescription>
                  </div>
                  {isAdvancedConfigOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <TooltipProvider>
                  {/* Configurações de IA */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                      Configurações de IA
                    </h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Base de Conhecimento */}
                      <FormField
                        control={form.control}
                        name="base_conhecimento"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-blue-600" />
                                Incluir na base de conhecimento da IA
                              </FormLabel>
                              <FormDescription>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs cursor-help border-b border-dotted">
                                      Este experimento será usado pelo Oráculo para gerar insights
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Experimentos marcados são analisados pela IA para identificar padrões e gerar insights automaticamente</p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Gerar Playbook */}
                      <FormField
                        control={form.control}
                        name="gerar_playbook"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={status !== 'concluido'}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className={cn(
                                "flex items-center gap-2",
                                status !== 'concluido' && "text-muted-foreground"
                              )}>
                                <BookOpen className="w-4 h-4 text-green-600" />
                                Gerar playbook deste experimento
                              </FormLabel>
                              <FormDescription>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs cursor-help border-b border-dotted">
                                      {status !== 'concluido' 
                                        ? "Disponível apenas para experimentos concluídos"
                                        : "Transformar em playbook reutilizável"
                                      }
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Cria um modelo reutilizável baseado neste experimento bem-sucedido</p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                      Tags de Categorização
                    </h4>
                    
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="tags"
                        render={() => (
                          <FormItem>
                            <FormLabel>Tags do Experimento</FormLabel>
                            <div className="space-y-3">
                              {/* Tags existentes */}
                              {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {tags.map((tag, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="secondary" 
                                      className="flex items-center gap-1"
                                    >
                                      #{tag}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => removeTag(tag)}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Input para nova tag */}
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Adicione tags: promoção, urgência, lançamento..."
                                  value={tagInput}
                                  onChange={(e) => setTagInput(e.target.value)}
                                  onKeyDown={handleTagInputKeyDown}
                                  disabled={tags.length >= 5}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => addTag(tagInput.trim())}
                                  disabled={!tagInput.trim() || tags.length >= 5}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Sugestões de tags */}
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Sugestões:</p>
                                <div className="flex flex-wrap gap-1">
                                  {tagSuggestions
                                    .filter(suggestion => !tags.includes(suggestion))
                                    .slice(0, 8)
                                    .map((suggestion) => (
                                      <Button
                                        key={suggestion}
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-6 px-2"
                                        onClick={() => addTag(suggestion)}
                                        disabled={tags.length >= 5}
                                      >
                                        #{suggestion}
                                      </Button>
                                    ))}
                                </div>
                              </div>

                              <FormDescription className="text-xs">
                                Máximo 5 tags por experimento. Use tags para categorizar e encontrar experimentos similares.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TooltipProvider>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Métricas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Métricas</CardTitle>
                <CardDescription>
                  Defina as métricas que serão acompanhadas
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ nome: "", valor: 0, unidade: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Métrica
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <div className="space-y-2">
                    <Label>Nome da Métrica</Label>
                    <Input
                      placeholder="Ex: Taxa de conversão"
                      {...form.register(`metricas.${index}.nome`)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Esperado</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      {...form.register(`metricas.${index}.valor`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <UnitSelector
                      value={form.watch(`metricas.${index}.unidade`)}
                      onChange={(v) => form.setValue(`metricas.${index}.unidade`, v)}
                    />
                  </div>
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/experimentos/${id}`)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}