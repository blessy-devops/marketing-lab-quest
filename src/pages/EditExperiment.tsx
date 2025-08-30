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

import { CanaisSelector } from "@/components/forms/CanaisSelector";
import { Form, FormField, FormItem, FormControl, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { UnitSelector } from "@/components/forms/UnitSelector";
import { TipoExperimentoSelector } from "@/components/forms/TipoExperimentoSelector";
import { NumericInput } from "@/components/ui/NumericInput";

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
  contexto_narrativo?: string;
  contexto_negocio?: string;
  metricas: Array<{
    nome: string;
    valorEsperado?: string;
    valorRealizado?: string;
    baseline?: string;
    unidade?: string;
  }>;
  // Configurações de IA
  base_conhecimento?: boolean;
  gerar_playbook?: boolean;
  tags?: string[];
}

// Helper function to convert string to number or null
const toNumberOrNull = (value: string | number | undefined): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const stringValue = typeof value === 'string' ? value.trim() : value.toString();
  if (stringValue === "") return null;
  const num = parseFloat(stringValue);
  return isNaN(num) ? null : num;
};

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
  const [experimento, setExperimento] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [metricas, setMetricas] = useState<any[]>([]);
  const [isAdvancedConfigOpen, setIsAdvancedConfigOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

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
      contexto_narrativo: "",
      contexto_negocio: "",
      metricas: [{ nome: "", valorEsperado: "", valorRealizado: "", baseline: "", unidade: "" }],
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

  // Buscar experimento e preencher formulário
  useEffect(() => {
    let cancelled = false;
    
    const fetchExperimentoData = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Buscar experimento
        const { data: exp, error: expError } = await supabase
          .from('experimentos')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (expError) {
          toast.error(`Erro ao carregar experimento: ${expError.message}`);
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        if (!exp) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        // Buscar métricas do experimento (todos os tipos)
        const { data: metricasData } = await supabase
          .from('metricas')
          .select('*')
          .eq('experimento_id', id);

        // Agrupar métricas por nome
        const metricasGrouped: Record<string, any> = {};
        metricasData?.forEach(metrica => {
          if (!metricasGrouped[metrica.nome]) {
            metricasGrouped[metrica.nome] = {
              nome: metrica.nome,
              unidade: metrica.unidade,
              valorEsperado: "",
              valorRealizado: "",
              baseline: ""
            };
          }
          
          if (metrica.tipo === 'esperada') {
            metricasGrouped[metrica.nome].valorEsperado = metrica.valor?.toString() || "";
          } else if (metrica.tipo === 'realizada') {
            metricasGrouped[metrica.nome].valorRealizado = metrica.valor?.toString() || "";
          } else if (metrica.tipo === 'baseline') {
            metricasGrouped[metrica.nome].baseline = metrica.valor?.toString() || "";
          }
        });

        const metricasArray = Object.values(metricasGrouped);

        if (!cancelled) {
          setMetricas(metricasData || []);
          setExperimento(exp);

          form.reset({
            nome: exp.nome ?? "",
            tipo_experimento_id: exp.tipo_experimento_id ?? undefined,
            subtipo_experimento_id: exp.subtipo_experimento_id ?? undefined,
            subtipo_customizado: exp.subtipo_customizado ?? "",
            responsavel: exp.responsavel ?? "",
            status: exp.status ?? "planejado",
            canais: exp.canais ?? [],
            hipotese: exp.hipotese ?? "",
            contexto_narrativo: (exp as any).contexto_narrativo ?? "",
            contexto_negocio: typeof (exp as any).contexto_negocio === 'object' ? JSON.stringify((exp as any).contexto_negocio, null, 2) : (exp as any).contexto_negocio ?? "",
            data_inicio: exp.data_inicio ? new Date(exp.data_inicio) : undefined,
            data_fim: exp.data_fim ? new Date(exp.data_fim) : undefined,
            metricas: metricasArray.length > 0 ? metricasArray : [{ nome: "", valorEsperado: "", valorRealizado: "", baseline: "", unidade: "" }],
            base_conhecimento: exp.base_conhecimento ?? true,
            gerar_playbook: false,
            tags: exp.tags ?? []
          });
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar experimento:', error);
        if (!cancelled) {
          toast.error('Erro inesperado ao carregar experimento');
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    fetchExperimentoData();
    
    return () => {
      cancelled = true;
    };
  }, [id]);

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

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Experimento não encontrado</h1>
          <p className="text-muted-foreground">
            O experimento que você está tentando editar não foi encontrado.
          </p>
          <Button onClick={() => navigate("/experimentos")}>
            Voltar para lista
          </Button>
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
          contexto_narrativo: data.contexto_narrativo,
          contexto_negocio: {
            canais: data.canais,
            periodo: { 
              inicio: data.data_inicio ? format(data.data_inicio, 'yyyy-MM-dd') : null,
              fim: data.data_fim ? format(data.data_fim, 'yyyy-MM-dd') : null
            },
            responsavel: data.responsavel,
            tipo_experimento_id: data.tipo_experimento_id
          },
          data_inicio: data.data_inicio?.toISOString().split('T')[0],
          data_fim: data.data_fim?.toISOString().split('T')[0],
          base_conhecimento: data.base_conhecimento,
          tags: data.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (experimentoError) throw experimentoError;

      // Handle metrics with upsert logic
      if (data.metricas.length > 0) {
        // Create a map of existing metrics by nome+tipo for quick lookup
        const existingMetricsMap = new Map<string, any>();
        metricas.forEach(metrica => {
          const key = `${metrica.nome}-${metrica.tipo}`;
          existingMetricsMap.set(key, metrica);
        });

        const metricasToUpsert: Array<{
          id?: string;
          experimento_id: string | undefined;
          nome: string;
          valor: number;
          unidade?: string;
          tipo: string;
        }> = [];
        const metricIdsToDelete: string[] = [];

        // Process each metric from the form
        data.metricas
          .filter(m => m.nome.trim())
          .forEach(metrica => {
            // Handle expected value metric
            const valorEsperado = toNumberOrNull(metrica.valorEsperado);
            const expectedKey = `${metrica.nome}-esperada`;
            const existingExpected = existingMetricsMap.get(expectedKey);
            
            if (valorEsperado !== null) {
              metricasToUpsert.push({
                id: existingExpected?.id,
                experimento_id: id,
                nome: metrica.nome,
                valor: valorEsperado,
                unidade: metrica.unidade,
                tipo: 'esperada'
              });
            } else if (existingExpected) {
              // Metric was cleared, mark for deletion
              metricIdsToDelete.push(existingExpected.id);
            }

            // Handle realized value metric
            const valorRealizado = toNumberOrNull(metrica.valorRealizado);
            const realizedKey = `${metrica.nome}-realizada`;
            const existingRealized = existingMetricsMap.get(realizedKey);
            
            if (valorRealizado !== null) {
              metricasToUpsert.push({
                id: existingRealized?.id,
                experimento_id: id,
                nome: metrica.nome,
                valor: valorRealizado,
                unidade: metrica.unidade,
                tipo: 'realizada'
              });
            } else if (existingRealized) {
              // Metric was cleared, mark for deletion
              metricIdsToDelete.push(existingRealized.id);
            }

            // Handle baseline metric
            const baseline = toNumberOrNull(metrica.baseline);
            const baselineKey = `${metrica.nome}-baseline`;
            const existingBaseline = existingMetricsMap.get(baselineKey);
            
            if (baseline !== null) {
              metricasToUpsert.push({
                id: existingBaseline?.id,
                experimento_id: id,
                nome: metrica.nome,
                valor: baseline,
                unidade: metrica.unidade,
                tipo: 'baseline'
              });
            } else if (existingBaseline) {
              // Metric was cleared, mark for deletion
              metricIdsToDelete.push(existingBaseline.id);
            }
          });

        // Check for metrics that were completely removed (no longer in form)
        const currentMetricNames = new Set(
          data.metricas.filter(m => m.nome.trim()).map(m => m.nome)
        );
        metricas.forEach(metrica => {
          if (!currentMetricNames.has(metrica.nome)) {
            metricIdsToDelete.push(metrica.id);
          }
        });

        // Perform upsert operation
        if (metricasToUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from('metricas')
            .upsert(metricasToUpsert, { onConflict: 'id' });

          if (upsertError) throw upsertError;
        }

        // Delete metrics that were cleared or removed
        if (metricIdsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('metricas')
            .delete()
            .in('id', metricIdsToDelete);

          if (deleteError) throw deleteError;
        }
      } else {
        // If no metrics in form, delete all existing metrics for this experiment
        const { error: deleteAllError } = await supabase
          .from('metricas')
          .delete()
          .eq('experimento_id', id);

        if (deleteAllError) throw deleteAllError;
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

      <Form {...form}>
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="hipotese">Hipótese</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => form.setValue('hipotese', 'ACREDITO QUE [AÇÃO] PARA [PÚBLICO-ALVO] RESULTARÁ EM [RESULTADO] MEDIDO POR [MÉTRICA]')}
                  >
                    Usar Template
                  </Button>
                </div>
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

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                  Contexto Adicional (para IA)
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="contexto_narrativo">Descrição Narrativa</Label>
                  <Textarea
                    id="contexto_narrativo"
                    placeholder="Descreva o contexto e detalhes do experimento de forma narrativa..."
                    className="min-h-[80px]"
                    {...form.register("contexto_narrativo")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use este campo para adicionar contexto narrativo que ajude a IA a entender melhor o experimento
                  </p>
                </div>

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
                  <FormField
                    control={form.control}
                    name="canais"
                    render={() => (
                      <FormItem>
                        <CanaisSelector control={form.control} />
                      </FormItem>
                    )}
                  />
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
                onClick={() => append({ nome: "", valorEsperado: "", valorRealizado: "", baseline: "", unidade: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Métrica
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => {
              const isRealized = status === 'concluido' || status === 'em_andamento';
              
              return (
                <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-1 gap-4 flex-1">
                    <div className="space-y-2">
                      <Label>Nome da Métrica</Label>
                      <Input
                        placeholder="Ex: Taxa de conversão"
                        {...form.register(`metricas.${index}.nome`)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Campos condicionais baseados no status */}
                      {!isRealized ? (
                        // Para experimentos futuros - apenas valor esperado
                        <div className="space-y-2">
                          <Label>Valor Esperado</Label>
                          <FormField
                            control={form.control}
                            name={`metricas.${index}.valorEsperado`}
                            render={({ field }) => (
                              <NumericInput
                                field={field}
                                placeholder="0,00"
                              />
                            )}
                          />
                        </div>
                      ) : (
                        // Para experimentos realizados - valor realizado e baseline
                        <>
                          <div className="space-y-2">
                            <Label>Valor Realizado</Label>
                            <FormField
                              control={form.control}
                              name={`metricas.${index}.valorRealizado`}
                              render={({ field }) => (
                                <NumericInput
                                  field={field}
                                  placeholder="0,00"
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor Anterior</Label>
                            <FormField
                              control={form.control}
                              name={`metricas.${index}.baseline`}
                              render={({ field }) => (
                                <NumericInput
                                  field={field}
                                  placeholder="0,00"
                                />
                              )}
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="space-y-2">
                        <Label>Unidade</Label>
                        <UnitSelector
                          value={form.watch(`metricas.${index}.unidade`)}
                          onChange={(v) => form.setValue(`metricas.${index}.unidade`, v)}
                        />
                      </div>
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
              );
            })}
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
      </Form>
    </div>
  );
}