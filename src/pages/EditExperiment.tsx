import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, CalendarIcon, Plus, X } from "lucide-react";
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
import { useExperimentosComResultados } from "@/hooks/useSupabaseData";

interface FormData {
  nome: string;
  tipo: string;
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
}

const tiposExperimento = [
  { value: "a-b-test", label: "Teste A/B" },
  { value: "multivariate", label: "Teste Multivariado" },
  { value: "split-url", label: "Split URL" },
  { value: "redirect", label: "Teste de Redirecionamento" },
  { value: "feature-flag", label: "Feature Flag" }
];

const statusOptions = [
  { value: "planejado", label: "Planejado" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "pausado", label: "Pausado" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" }
];

const canaisDisponiveis = [
  { value: "site", label: "Site" },
  { value: "app", label: "App Mobile" },
  { value: "social-media", label: "Redes Sociais" },
  { value: "email", label: "E-mail Marketing" },
  { value: "ads", label: "Anúncios Pagos" },
  { value: "landing-page", label: "Landing Page" }
];

export default function EditExperiment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<any[]>([]);
  const { data: experimentos } = useExperimentosComResultados();

  const experimento = experimentos?.find(exp => exp.id === id);

  const form = useForm<FormData>({
    defaultValues: {
      nome: "",
      tipo: "",
      responsavel: "",
      status: "planejado",
      canais: [],
      hipotese: "",
      metricas: [{ nome: "", valor: 0, unidade: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "metricas"
  });

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
        tipo: experimento.tipo || "",
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
        })) : [{ nome: "", valor: 0, unidade: "" }]
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
          tipo: data.tipo,
          responsavel: data.responsavel,
          status: data.status,
          canais: data.canais,
          hipotese: data.hipotese,
          data_inicio: data.data_inicio?.toISOString().split('T')[0],
          data_fim: data.data_fim?.toISOString().split('T')[0],
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

  const toggleCanal = (canal: string) => {
    const canaisAtuais = form.getValues('canais');
    const novosCanais = canaisAtuais.includes(canal)
      ? canaisAtuais.filter(c => c !== canal)
      : [...canaisAtuais, canal];
    
    form.setValue('canais', novosCanais);
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Experimento</Label>
                  <Select
                    value={form.watch("tipo")}
                    onValueChange={(value) => form.setValue("tipo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposExperimento.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.tipo && (
                    <p className="text-sm text-destructive">{form.formState.errors.tipo.message}</p>
                  )}
                </div>

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
              <CardContent className="space-y-3">
                {canaisDisponiveis.map((canal) => (
                  <div key={canal.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={canal.value}
                      checked={form.watch("canais").includes(canal.value)}
                      onCheckedChange={() => toggleCanal(canal.value)}
                    />
                    <Label htmlFor={canal.value}>{canal.label}</Label>
                  </div>
                ))}
                {form.formState.errors.canais && (
                  <p className="text-sm text-destructive">{form.formState.errors.canais.message}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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
                    <Input
                      placeholder="Ex: %, R$, unidades"
                      {...form.register(`metricas.${index}.unidade`)}
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