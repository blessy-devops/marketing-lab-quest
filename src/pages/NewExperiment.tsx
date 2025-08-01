import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Play, Plus, X, CalendarIcon, Upload, Link2 } from "lucide-react";
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
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  responsavel: z.string().optional(),
  data_inicio: z.date().optional(),
  data_fim: z.date().optional(),
  status: z.string().default("planejado"),
  canais: z.array(z.string()).min(1, "Selecione pelo menos um canal"),
  hipotese: z.string().min(1, "Hipótese é obrigatória"),
  metricas: z.array(z.object({
    nome: z.string().min(1, "Nome da métrica é obrigatório"),
    valor: z.number().min(0, "Valor deve ser positivo"),
    unidade: z.string().optional()
  })).min(1, "Adicione pelo menos uma métrica"),
  anexos: z.array(z.object({
    tipo: z.string(),
    url: z.string(),
    descricao: z.string().optional()
  })).optional()
});

type FormData = z.infer<typeof formSchema>;

const canaisOptions = [
  "Meta Ads",
  "Google Ads", 
  "TikTok Shop",
  "Mercado Livre",
  "Site",
  "Email",
  "WhatsApp"
];

const tiposExperimento = [
  { value: "ab-test", label: "Teste A/B" },
  { value: "multivariate", label: "Teste Multivariado" },
  { value: "split-url", label: "Split URL" },
  { value: "redirect", label: "Teste de Redirecionamento" },
  { value: "landing-page", label: "Landing Page" },
  { value: "email", label: "E-mail Marketing" }
];

export default function NewExperiment() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      tipo: "",
      responsavel: "",
      status: "planejado",
      canais: [],
      hipotese: "",
      metricas: [{ nome: "", valor: 0, unidade: "" }],
      anexos: []
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

  const onSubmit = async (data: FormData, shouldStart = false) => {
    setIsSubmitting(true);
    
    try {
      // 1. Criar experimento
      const { data: experimento, error: experimentoError } = await supabase
        .from('experimentos')
        .insert({
          nome: data.nome,
          tipo: data.tipo,
          responsavel: data.responsavel,
          data_inicio: data.data_inicio?.toISOString().split('T')[0],
          data_fim: data.data_fim?.toISOString().split('T')[0],
          status: shouldStart ? 'ativo' : data.status,
          canais: data.canais,
          hipotese: data.hipotese
        })
        .select()
        .single();

      if (experimentoError) throw experimentoError;

      // 2. Criar métricas
      if (data.metricas.length > 0) {
        const metricas = data.metricas.map(metrica => ({
          experimento_id: experimento.id,
          nome: metrica.nome,
          valor: metrica.valor,
          unidade: metrica.unidade,
          tipo: 'esperada'
        }));

        const { error: metricasError } = await supabase
          .from('metricas')
          .insert(metricas);

        if (metricasError) throw metricasError;
      }

      // 3. Criar anexos se houver
      if (data.anexos && data.anexos.length > 0) {
        const anexos = data.anexos.map(anexo => ({
          experimento_id: experimento.id,
          tipo: anexo.tipo,
          url: anexo.url,
          descricao: anexo.descricao
        }));

        const { error: anexosError } = await supabase
          .from('anexos')
          .insert(anexos);

        if (anexosError) throw anexosError;
      }

      // Criar notificação se o experimento for iniciado
      if (shouldStart) {
        const { error: notificationError } = await supabase
          .from('notificacoes')
          .insert([{
            tipo: 'experimento_concluido',
            titulo: `Experimento "${experimento.nome}" foi iniciado`,
            descricao: 'O experimento foi criado e iniciado com sucesso.',
            experimento_id: experimento.id,
          }]);
        
        if (notificationError) {
          console.warn('Erro ao criar notificação:', notificationError);
        }
      }

      toast({
        title: shouldStart ? "Experimento iniciado!" : "Experimento salvo!",
        description: shouldStart 
          ? "O experimento foi criado e iniciado com sucesso."
          : "O experimento foi salvo como rascunho.",
      });

      navigate(`/experimentos/${experimento.id}`);
    } catch (error) {
      console.error('Erro ao salvar experimento:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o experimento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    form.handleSubmit((data) => onSubmit(data, false))();
  };

  const handleStart = () => {
    form.handleSubmit((data) => onSubmit(data, true))();
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
          <Button variant="outline" onClick={handleSave} disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button onClick={handleStart} disabled={isSubmitting}>
            <Play className="w-4 h-4 mr-2" />
            Iniciar Experimento
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informações Básicas */}
            <Card className="md:col-span-2">
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
                      <FormItem>
                        <FormLabel>Nome do Experimento *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Teste A/B - Botão CTA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Experimento *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposExperimento.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                              disabled={(date) => date < new Date()}
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
                              disabled={(date) => date < new Date()}
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
                <FormField
                  control={form.control}
                  name="canais"
                  render={() => (
                    <FormItem>
                      <div className="grid gap-3">
                        {canaisOptions.map((canal) => (
                          <FormField
                            key={canal}
                            control={form.control}
                            name="canais"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={canal}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(canal)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, canal])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== canal
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {canal}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

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
          </div>

          {/* Métricas Esperadas */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas Esperadas *</CardTitle>
              <CardDescription>
                Defina as métricas que serão acompanhadas no experimento
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
                          <FormLabel>Valor Esperado</FormLabel>
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
                onClick={() => appendMetrica({ nome: "", valor: 0, unidade: "" })}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Métrica
              </Button>
            </CardContent>
          </Card>

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