import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, Play, Plus, X, CalendarIcon, Upload, Link2, RadioIcon, CheckCircle, XCircle, Brain, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
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
  }>;
  // Campos de resultado para experimentos já realizados
  sucesso?: boolean;
  roi?: number;
  fatos?: string;
  causas?: string;
  acoes?: string;
  aprendizados?: string;
  // Configurações de IA
  base_conhecimento?: boolean;
  gerar_playbook?: boolean;
  tags?: string[];
}

// Remove old static arrays - now using dynamic data
// const canaisOptions = [...]
// const tiposExperimento = [...] 

// Get channel names for compatibility
const canaisOptions = CANAIS_OPTIONS.map(c => c.value);

export default function NewExperiment() {
  const navigate = useNavigate();
  const { hasRole, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedConfigOpen, setIsAdvancedConfigOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Aguardar o carregamento antes de verificar permissões
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
      </div>
    );
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
      sucesso: undefined,
      roi: undefined,
      fatos: "",
      causas: "",
      acoes: "",
      aprendizados: "",
      base_conhecimento: true,
      gerar_playbook: false,
      tags: []
    }
  });

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
      if (data.sucesso === undefined) {
        toast.error('Informe se o experimento foi bem-sucedido');
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
        data_inicio: data.data_inicio?.toISOString().split('T')[0],
        data_fim: data.data_fim?.toISOString().split('T')[0],
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

      // Inserir métricas
      if (data.metricas.length > 0) {
        const metricasPrincipais = data.metricas
          .filter((metrica) => metrica.nome.trim())
          .map((metrica) => ({
            experimento_id: novoExperimento.id,
            nome: metrica.nome,
            valor: metrica.valor,
            unidade: metrica.unidade,
            tipo: tipoCadastro === 'realizado' ? 'realizada' : 'esperada',
          }));

        const metricasBaseline = data.metricas
          .filter((metrica) => metrica.nome.trim() && metrica.baseline !== undefined && metrica.baseline !== null && !Number.isNaN(metrica.baseline))
          .map((metrica) => ({
            experimento_id: novoExperimento.id,
            nome: metrica.nome,
            valor: metrica.baseline as number,
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
            sucesso: data.sucesso,
            roi: data.roi,
            fatos: data.fatos,
            causas: data.causas,
            acoes: data.acoes,
            aprendizados: data.aprendizados
          });

        if (resultadoError) throw resultadoError;
      }

      // Inserir anexos se houver
      if (data.anexos && data.anexos.length > 0) {
        const anexosData = data.anexos
          .filter(anexo => anexo.url.trim())
          .map(anexo => ({
            experimento_id: novoExperimento.id,
            tipo: anexo.tipo,
            url: anexo.url,
            descricao: anexo.descricao
          }));

        if (anexosData.length > 0) {
          const { error: anexosError } = await supabase
            .from('anexos')
            .insert(anexosData);

          if (anexosError) throw anexosError;
        }
      }

      toast.success('Experimento criado com sucesso!');
      navigate(`/experimentos/${novoExperimento.id}`);
      
    } catch (error) {
      console.error('Erro ao criar experimento:', error);
      toast.error('Erro ao criar experimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit(onSubmit)();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/experimentos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Novo Experimento</h1>
          <p className="text-muted-foreground">
            Configure um novo experimento de marketing
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {tipoCadastro === 'realizado' ? 'Salvar Experimento' : 'Criar Experimento'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Tipo de Cadastro */}
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Informações Básicas */}
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

                  {/* Novo Seletor de Tipos Dinâmicos */}
                  <div className="md:col-span-2">
                    <TipoExperimentoSelector 
                      control={form.control} 
                      canaisSelecionados={canaisSelecionados}
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

            {/* Canais */}
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
          </div>

            {/* Hipótese */}
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

          {/* Métricas Esperadas */}
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
                  <div className="w-32">
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-32">
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
                  <div className="w-24">
                    <FormField
                      control={form.control}
                      name={`metricas.${index}.unidade`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade</FormLabel>
                          <FormControl>
                            <Input placeholder="%" {...field} />
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

          {/* Resultados - apenas para experimentos já realizados */}
          {tipoCadastro === 'realizado' && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados do Experimento</CardTitle>
                <CardDescription>
                  Informe os resultados e aprendizados obtidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="sucesso"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>O experimento foi bem-sucedido? *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === 'true')}
                            value={field.value?.toString()}
                            className="flex flex-row space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="sucesso-sim" />
                              <Label htmlFor="sucesso-sim" className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Sim
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="sucesso-nao" />
                              <Label htmlFor="sucesso-nao" className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                Não
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ROI (Retorno sobre Investimento)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="1.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Valor em múltiplos (ex: 1.5 = 150% de retorno)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

          {/* Anexos */}
          <Card>
            <CardHeader>
              <CardTitle>Anexos</CardTitle>
              <CardDescription>
                Adicione imagens ou links de referência para o experimento
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
                onClick={() => appendAnexo({ tipo: "", url: "", descricao: "" })}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Anexo
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}