import { useState } from "react";
import { ArrowLeft, Save, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function NewExperiment() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hypothesis: "",
    type: "",
    target: "",
    successMetric: "",
    sampleSize: "",
    confidence: "95",
    power: "80"
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log("Saving experiment...", formData);
    // Implementar lógica de salvamento
  };

  const handleStart = () => {
    console.log("Starting experiment...", formData);
    // Implementar lógica para iniciar experimento
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
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button className="bg-gradient-to-r from-primary to-primary-glow" onClick={handleStart}>
            <Play className="w-4 h-4 mr-2" />
            Iniciar Experimento
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Defina as informações principais do seu experimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Experimento</Label>
                <Input
                  id="name"
                  placeholder="Ex: Teste A/B - Botão CTA"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Experimento</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ab-test">Teste A/B</SelectItem>
                    <SelectItem value="multivariate">Teste Multivariado</SelectItem>
                    <SelectItem value="split-url">Split URL</SelectItem>
                    <SelectItem value="redirect">Teste de Redirecionamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o objetivo e contexto do experimento..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hypothesis">Hipótese</Label>
              <Textarea
                id="hypothesis"
                placeholder="Se alterarmos X, então esperamos que Y aconteça porque..."
                value={formData.hypothesis}
                onChange={(e) => handleInputChange("hypothesis", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Target & Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Público-Alvo e Métricas</CardTitle>
            <CardDescription>
              Defina quem será impactado e como medir o sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target">Público-Alvo</Label>
              <Select value={formData.target} onValueChange={(value) => handleInputChange("target", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o público" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-users">Todos os usuários</SelectItem>
                  <SelectItem value="new-users">Novos usuários</SelectItem>
                  <SelectItem value="returning-users">Usuários recorrentes</SelectItem>
                  <SelectItem value="mobile-users">Usuários mobile</SelectItem>
                  <SelectItem value="desktop-users">Usuários desktop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="successMetric">Métrica de Sucesso</Label>
              <Select value={formData.successMetric} onValueChange={(value) => handleInputChange("successMetric", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a métrica principal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversion-rate">Taxa de Conversão</SelectItem>
                  <SelectItem value="click-through-rate">Taxa de Cliques (CTR)</SelectItem>
                  <SelectItem value="bounce-rate">Taxa de Rejeição</SelectItem>
                  <SelectItem value="time-on-page">Tempo na Página</SelectItem>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="signup-rate">Taxa de Cadastro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampleSize">Tamanho da Amostra</Label>
              <Input
                id="sampleSize"
                type="number"
                placeholder="Ex: 1000"
                value={formData.sampleSize}
                onChange={(e) => handleInputChange("sampleSize", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cronograma e Configurações</CardTitle>
            <CardDescription>
              Configure quando e como o experimento será executado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
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
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="confidence">Nível de Confiança (%)</Label>
                <Select value={formData.confidence} onValueChange={(value) => handleInputChange("confidence", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95%</SelectItem>
                    <SelectItem value="99">99%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="power">Poder Estatístico (%)</Label>
                <Select value={formData.power} onValueChange={(value) => handleInputChange("power", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}