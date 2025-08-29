import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, Plus, X, CalendarIcon, Star, Brain, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import { TipoExperimentoSelector } from "@/components/forms/TipoExperimentoSelector";
import { CanaisSelector } from "@/components/forms/CanaisSelector";
import { CANAIS_OPTIONS } from "@/constants/canais";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { NewExperimentShellSkeleton } from '@/components/ui/page-shell-skeleton';
import { UnitSelector } from "@/components/forms/UnitSelector";
import { Stepper, type Step } from "@/components/ui/stepper";
import { useFormAutoSave } from "@/hooks/useFormAutoSave";

interface FormData {
  tipoCadastro: 'futuro' | 'realizado';
  nome: string;
  tipo_experimento_id?: string;
  subtipo_experimento_id?: string;
  subtipo_customizado?: string;
  tipo: string; // Keep for backward compatibility during transition
  responsavel?: string;
  data_inicio?: Date;
  data_fim?: Date;
  status: string;
  canais: string[];
  hipotese: string;
  metricas: Array<{
    nome: string;
    valor: number;
    unidade?: string;
    baseline?: number;
  }>;
  anexos?: Array<{
    tipo: string;
    url: string;
    descricao?: string;
    file?: File | null;
  }>;
  // Campos de resultado para experimentos já realizados
  rating?: number;
  fatos?: string;
  causas?: string;
  acoes?: string;
  aprendizados?: string;
  // Configurações de IA
  base_conhecimento?: boolean;
  gerar_playbook?: boolean;
  tags?: string[];
}

export default function NewExperiment() {
  const navigate = useNavigate();
  const { hasRole, loading } = useAuth();
  const { setOpen: setSidebarOpen } = useSidebar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedConfigOpen, setIsAdvancedConfigOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  // Collapse sidebar when entering the page and restore when leaving
  useEffect(() => {
    setSidebarOpen(false);
    return () => {
      setSidebarOpen(true);
    };
  }, [setSidebarOpen]);

  const steps: Step[] = [
    { id: "type", title: "Tipo", description: "Tipo de cadastro e experimento" },
    { id: "basic", title: "Básico", description: "Informações gerais" },
    { id: "channels", title: "Canais", description: "Canais e hipótese" },
    { id: "metrics", title: "Métricas", description: "Métricas esperadas/realizadas" },
    { id: "results", title: "Resultados", description: "Resultados (se realizado)" },
    { id: "attachments", title: "Anexos", description: "Arquivos e links" },
    { id: "review", title: "Revisar", description: "Revisar e finalizar" }
  ];

  // Aguardar o carregamento antes de verificar permissões
  if (loading) {
    return <NewExperimentShellSkeleton />;
  }

  // Verificar permissão de acesso
  if (!hasRole('editor')) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para criar experimentos. Apenas editores e administradores podem criar novos experimentos.
          </p>
          <Button onClick={() => navigate("/experimentos")}>
            Voltar para lista de experimentos
          </Button>
        </div>
      </div>
    );
  }

  const form = useForm<FormData>({
    defaultValues: {
      tipoCadastro: 'futuro',
      nome: "",
      tipo: "",
      tipo_experimento_id: "",
      subtipo_experimento_id: "",
      subtipo_customizado: "",
      responsavel: "",
      status: "planejado",
      canais: [],
      hipotese: "",
      metricas: [{ nome: "", valor: 0, unidade: "", baseline: undefined }],
      anexos: [],
      rating: undefined,
      fatos: "",
      causas: "",
      acoes: "",
      aprendizados: "",
      base_conhecimento: true,
      gerar_playbook: false,
      tags: []
    }
  });

  // Auto-save functionality
  const { loadFromStorage, clearStorage } = useFormAutoSave(
    form, 
    'new-experiment-draft',
    2000 // Save after 2 seconds of inactivity
  );

  // Load saved data on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Normalize dates after loading from localStorage (convert strings back to Date objects)
  useEffect(() => {
    const currentValues = form.getValues();
    
    // Convert date strings to Date objects for proper calendar display
    if (currentValues.data_inicio && typeof currentValues.data_inicio === 'string') {
      const startDate = new Date(currentValues.data_inicio);
      if (!isNaN(startDate.getTime())) {
        form.setValue('data_inicio', startDate);
      }
    }
    
    if (currentValues.data_fim && typeof currentValues.data_fim === 'string') {
      const endDate = new Date(currentValues.data_fim);
      if (!isNaN(endDate.getTime())) {
        form.setValue('data_fim', endDate);
      }
    }
  }, []); // Run only on mount

  const { fields: metricasFields, append: appendMetrica, remove: removeMetrica } = useFieldArray({
    control: form.control,
    name: "metricas"
  });

  const { fields: anexosFields, append: appendAnexo, remove: removeAnexo } = useFieldArray({
    control: form.control,
    name: "anexos"
  });

  const tipoCadastro = form.watch('tipoCadastro');
  const canaisSelecionados = form.watch('canais');
  const status = form.watch('status');
  const tags = form.watch('tags') || [];

  // Sugestões de tags
  const tagSuggestions = [
    "promoção", "lançamento", "email", "urgência", "black-friday", 
    "gap", "teste-preco", "frete-gratis", "a-b-test", "conversao",
    "checkout", "cta", "landing-page", "mobile", "desktop"
  ];

  // Ajustar status baseado no tipo de cadastro
  useEffect(() => {
    if (tipoCadastro === 'realizado') {
      form.setValue('status', 'concluido');
    } else {
      form.setValue('status', 'planejado');
    }
  }, [tipoCadastro, form]);

  // Helper function to convert values to number or null
  const toNumberOrNull = (v: any) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // Helper function to format date for database (handles Date objects and strings)
  const formatDateForDB = (dateValue: any) => {
    if (!dateValue) return null;
    
    // If it's already a Date object, use toISOString
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    
    // If it's a string (from localStorage), try to parse it
    if (typeof dateValue === 'string') {
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
    }
    
    return null;
  };

  const onSubmit = async (data: FormData) => {
    // Validar tipo de experimento
    if (!data.tipo_experimento_id) {
      toast.error('Selecione o tipo de experimento');
      return;
    }
    // Validações
    if (tipoCadastro === 'futuro') {
      if (data.data_inicio && data.data_inicio < new Date()) {
        toast.error('Data de início deve ser hoje ou futura para experimentos futuros');
        return;
      }
    } else {
      if (data.data_inicio && data.data_inicio >= new Date()) {
        toast.error('Datas devem ser passadas para experimentos já realizados');
        return;
      }
      if (data.data_fim && data.data_fim >= new Date()) {
        toast.error('Datas devem ser passadas para experimentos já realizados');
        return;
      }
      if (data.rating === undefined) {
        toast.error('Dê uma nota de 1 a 5 estrelas para o experimento');
        return;
      }
    }

    if (data.data_inicio && data.data_fim && data.data_fim < data.data_inicio) {
      toast.error('Data de fim deve ser posterior à data de início');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Criar experimento
      const experimentoData = {
        nome: data.nome,
        tipo: data.tipo || 'custom', // Keep for backward compatibility
        responsavel: data.responsavel,
        status: data.status,
        canais: data.canais,
        hipotese: data.hipotese,
        data_inicio: formatDateForDB(data.data_inicio),
        data_fim: formatDateForDB(data.data_fim),
        // Store tipo_experimento_id in tipo field for now
        tipo_experimento_id: data.tipo_experimento_id,
        subtipo_experimento_id: data.subtipo_experimento_id,
        subtipo_customizado: data.subtipo_customizado,
        base_conhecimento: data.base_conhecimento,
        tags: data.tags
      };

      const { data: novoExperimento, error: experimentoError } = await supabase
        .from('experimentos')
        .insert(experimentoData)
        .select()
        .single();

      if (experimentoError) throw experimentoError;

      // Inserir métricas com conversão e filtragem adequada
      if (data.metricas.length > 0) {
        // Primeiro, processar e filtrar métricas válidas
        const metricasProcessed = data.metricas
          .filter((metrica) => metrica.nome.trim())
          .map((metrica) => ({
            ...metrica,
            valorProcessado: toNumberOrNull(metrica.valor),
            baselineProcessado: toNumberOrNull(metrica.baseline)
          }))
          .filter((metrica) => metrica.valorProcessado !== null);

        const metricasPrincipais = metricasProcessed.map((metrica) => ({
          experimento_id: novoExperimento.id,
          nome: metrica.nome,
          valor: metrica.valorProcessado,
          unidade: metrica.unidade,
          tipo: tipoCadastro === 'realizado' ? 'realizada' : 'esperada',
        }));

        const metricasBaseline = metricasProcessed
          .filter((metrica) => metrica.baselineProcessado !== null)
          .map((metrica) => ({
            experimento_id: novoExperimento.id,
            nome: metrica.nome,
            valor: metrica.baselineProcessado,
            unidade: metrica.unidade,
            tipo: 'baseline',
          }));

        const metricasData = [...metricasPrincipais, ...metricasBaseline];

        if (metricasData.length > 0) {
          const { error: metricasError } = await supabase
            .from('metricas')
            .insert(metricasData);

          if (metricasError) throw metricasError;
        }
      }

      // Se experimento já realizado, inserir resultados
      if (tipoCadastro === 'realizado') {
        const { error: resultadoError } = await supabase
          .from('resultados')
          .insert({
            experimento_id: novoExperimento.id,
            rating: data.rating,
            fatos: data.fatos,
            causas: data.causas,
            acoes: data.acoes,
            aprendizados: data.aprendizados
          });

        if (resultadoError) throw resultadoError;
      }

      // Inserir anexos se houver
      if (data.anexos && data.anexos.length > 0) {
        // Salvar anexos do tipo link
        const linkAnexos = data.anexos.filter((anexo) => anexo.tipo === 'link' && (anexo.url || '').trim());
        if (linkAnexos.length > 0) {
          const { error: anexosError } = await supabase
            .from('anexos')
            .insert(
              linkAnexos.map((anexo) => ({
                experimento_id: novoExperimento.id,
                tipo: 'link',
                url: anexo.url,
                descricao: anexo.descricao,
                is_link: true,
              }))
            );
          if (anexosError) throw anexosError;
        }

        // Salvar anexos de arquivo (imagem/documento)
        const fileAnexos = data.anexos.filter((anexo) => anexo.tipo !== 'link' && (anexo as any).file);
        for (const anexo of fileAnexos as any[]) {
          const file: File | null = (anexo as any).file || null;
          if (!file) continue;

          const fileExt = file.name.split('.').pop();
          const fileName = `${novoExperimento.id}/${Date.now()}-${Math.random()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('experimento-anexos')
            .upload(fileName, file);
          if (uploadError) {
            console.error('Erro upload anexo:', uploadError);
            toast.error(`Erro ao enviar ${file.name}`);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from('experimento-anexos')
            .getPublicUrl(fileName);

          const { error: insertError } = await supabase
            .from('anexos')
            .insert({
              experimento_id: novoExperimento.id,
              tipo: file.type.startsWith('image/') ? 'imagem' : 'documento',
              url: urlData.publicUrl,
              storage_path: fileName,
              file_name: file.name,
              file_size: file.size,
              mime_type: file.type,
              is_link: false,
              descricao: anexo.descricao || file.name,
            });

          if (insertError) {
            console.error('Erro salvar anexo:', insertError);
            toast.error(`Erro ao salvar ${file.name}`);
          }
        }
      }

      toast.success('Experimento criado com sucesso!');
      clearStorage(); // Clear saved draft
      navigate(`/experimentos/${novoExperimento.id}`);
      
    } catch (error) {
      console.error('Erro ao criar experimento:', error);
      toast.error('Erro ao criar experimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const canProceedToNextStep = () => {
    const values = form.getValues();
    switch (currentStep) {
      case 0: // Type
        return values.tipoCadastro;
      case 1: // Basic Info
        return values.nome && values.tipo_experimento_id;
      case 2: // Channels
        return values.canais.length > 0 && values.hipotese;
      case 3: // Metrics
        return values.metricas.some(m => m.nome);
      case 4: // Results (only for realized experiments)
        return tipoCadastro === 'futuro' || (values.rating !== undefined);
      case 5: // Attachments
        return true; // Optional step
      default:
        return true;
    }
  };

  const canNavigateToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep) return true; // Can always go back
    
    // Can only proceed if all previous steps are valid
    for (let i = 0; i < stepIndex; i++) {
      const prevCurrentStep = currentStep;
      setCurrentStep(i);
      const canProceed = canProceedToNextStep();
      setCurrentStep(prevCurrentStep);
      if (!canProceed) return false;
    }
    return true;
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
    <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-8rem)]">
      {/* Vertical Stepper - Left Sidebar */}
      <div className="col-span-12 lg:col-span-3">
        <div className="sticky top-6">
          <div className="mb-6">
            <Link to="/experimentos">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Novo Experimento</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure um novo experimento de marketing
            </p>
          </div>
          
          <Stepper 
            steps={steps} 
            currentStep={currentStep}
            orientation="vertical"
            onStepClick={goToStep}
            canNavigateToStep={canNavigateToStep}
            className="lg:block hidden"
          />
          
          {/* Mobile horizontal stepper */}
          <Stepper 
            steps={steps} 
            currentStep={currentStep}
            orientation="horizontal"
            className="lg:hidden block mb-6"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-12 lg:col-span-9">
        <div className="space-y-6">
          {/* Action buttons */}
          <div className="flex justify-between items-center lg:justify-end">
            <div className="flex gap-2 lg:hidden">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" className="hidden lg:flex" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
              )}
              
              {currentStep === steps.length - 1 ? (
                <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {tipoCadastro === 'realizado' ? 'Salvar Experimento' : 'Criar Experimento'}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  disabled={!canProceedToNextStep()}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 0: Tipo de Cadastro */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Cadastro</CardTitle>
                <CardDescription>
                  Escolha se está criando um experimento futuro ou documentando um já realizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="tipoCadastro"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="futuro" id="futuro" />
                            <Label htmlFor="futuro" className="font-normal">
                              Experimento futuro (padrão)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="realizado" id="realizado" />
                            <Label htmlFor="realizado" className="font-normal">
                              Experimento já realizado
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      {tipoCadastro === 'realizado' && (
                        <FormDescription className="text-sm text-muted-foreground">
                          Use esta opção para documentar experimentos anteriores
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 1: Informações Básicas */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Defina as informações principais do seu experimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nome do Experimento *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Teste A/B - Botão CTA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <TipoExperimentoSelector 
                      control={form.control} 
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="responsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do responsável pelo experimento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="data_inicio"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Início</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecionar data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => 
                                tipoCadastro === 'futuro' 
                                  ? date < new Date()
                                  : date >= new Date()
                              }
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="data_fim"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Fim</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecionar data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => 
                                tipoCadastro === 'futuro' 
                                  ? date < new Date()
                                  : date >= new Date()
                              }
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Channels & Hypothesis */}
          {currentStep === 2 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Canais *</CardTitle>
                  <CardDescription>
                    Selecione os canais onde o experimento será executado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CanaisSelector control={form.control} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hipótese *</CardTitle>
                  <CardDescription>
                    Descreva sua hipótese para o experimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="hipotese"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Se fizermos X, esperamos que Y aconteça porque Z"
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

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
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                            Configurações de IA
                          </h4>
                          
                          <div className="grid gap-4 md:grid-cols-2">
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
                          </div>
                        </div>

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
            </>
          )}

          {/* Step 3: Metrics */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {tipoCadastro === 'realizado' ? 'Métricas Realizadas *' : 'Métricas Esperadas *'}
                </CardTitle>
                <CardDescription>
                  {tipoCadastro === 'realizado' 
                    ? 'Informe os resultados obtidos no experimento'
                    : 'Defina as métricas que serão acompanhadas no experimento'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metricasFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`metricas.${index}.nome`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Métrica</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Taxa de conversão" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-28">
                      <FormField
                        control={form.control}
                        name={`metricas.${index}.valor`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {tipoCadastro === 'realizado' ? 'Valor Realizado' : 'Valor Esperado'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value === '' ? '' : parseFloat(value));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-28">
                      <FormField
                        control={form.control}
                        name={`metricas.${index}.baseline`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {tipoCadastro === 'realizado' ? 'Valor Anterior (opcional)' : 'Valor Atual (opcional)'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={field.value ?? ''}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  field.onChange(v === '' ? undefined : parseFloat(v));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-28">
                      <FormField
                        control={form.control}
                        name={`metricas.${index}.unidade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade</FormLabel>
                            <FormControl>
                              <UnitSelector value={field.value || ""} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {metricasFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeMetrica(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendMetrica({ nome: "", valor: 0, unidade: "", baseline: undefined })}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Métrica
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Results (only for realized experiments) */}
          {currentStep === 4 && tipoCadastro === 'realizado' && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados do Experimento</CardTitle>
                <CardDescription>
                  Informe os resultados e aprendizados obtidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avaliação (1 a 5 estrelas) *</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => field.onChange(star)}
                              aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                              className="p-1"
                            >
                              <Star
                                className={cn(
                                  "h-6 w-6",
                                  (field.value || 0) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fatos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fatos</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="O que aconteceu de fato..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="causas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Causas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Por que aconteceu..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="acoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="O que deve ser feito..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aprendizados"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aprendizados</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="O que aprendemos..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Attachments */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Anexos</CardTitle>
                <CardDescription>
                  Adicione imagens, documentos ou links de referência para o experimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {anexosFields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex gap-4">
                      <div className="w-32">
                        <FormField
                          control={form.control}
                          name={`anexos.${index}.tipo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="imagem">Imagem</SelectItem>
                                  <SelectItem value="link">Link</SelectItem>
                                  <SelectItem value="documento">Documento</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        {form.watch(`anexos.${index}.tipo`) === 'link' ? (
                          <FormField
                            control={form.control}
                            name={`anexos.${index}.url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <FormField
                            control={form.control as any}
                            name={`anexos.${index}.file` as any}
                            render={() => (
                              <FormItem>
                                <FormLabel>Arquivo</FormLabel>
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.xlsx,.xls,.csv,.doc,.docx,.ppt,.pptx,.txt"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      form.setValue(`anexos.${index}.file` as any, file);
                                      form.setValue(`anexos.${index}.url` as any, '');
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeAnexo(index)}
                        className="mt-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name={`anexos.${index}.descricao`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição (opcional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descrição do anexo..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendAnexo({ tipo: "link", url: "", descricao: "" })}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Anexo
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Revisar Experimento</CardTitle>
                <CardDescription>
                  Revise todas as informações antes de finalizar o experimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="font-semibold">Nome:</Label>
                    <p>{form.watch('nome') || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Responsável:</Label>
                    <p>{form.watch('responsavel') || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Canais:</Label>
                    <p>{form.watch('canais')?.join(', ') || 'Nenhum selecionado'}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Status:</Label>
                    <p>{form.watch('status')}</p>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Hipótese:</Label>
                  <p className="text-sm text-muted-foreground">
                    {form.watch('hipotese') || 'Não informado'}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Métricas:</Label>
                  <div className="text-sm">
                    {form.watch('metricas')?.filter(m => m.nome).map((metrica, i) => (
                      <div key={i}>• {metrica.nome}: {metrica.valor} {metrica.unidade}</div>
                    )) || 'Nenhuma métrica definida'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToNextStep()}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {tipoCadastro === 'realizado' ? 'Salvar Experimento' : 'Criar Experimento'}
                </Button>
              )}
            </div>
          </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}