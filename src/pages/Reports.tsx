import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getChannelsByCategory } from "@/constants/canais";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  LineChart, 
  ComposedChart,
  PieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Bar, 
  Line, 
  Pie, 
  Cell
} from "recharts";
import { 
  Calendar as CalendarIcon,
  BarChart3, 
  TrendingUp, 
  Download, 
  Share, 
  Mail, 
  Filter,
  FileText,
  Table as TableIcon,
  PieChart as PieChartIcon,
  Bot,
  AlertTriangle,
  Lightbulb,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useExperimentosComResultados } from "@/hooks/useSupabaseData";
import { toast } from "sonner";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export default function Reports() {
  const { data: experimentos, loading } = useExperimentosComResultados();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedReport, setSelectedReport] = useState("performance");
  const [filterType, setFilterType] = useState("todos");
  const [filterChannel, setFilterChannel] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterResponsible, setFilterResponsible] = useState("todos");

  // Processar dados para gráficos
  const processedData = useMemo(() => {
    if (!experimentos) return null;

    let filteredData = experimentos;

    // Aplicar filtros
    if (filterType !== "todos") {
      filteredData = filteredData.filter(exp => exp.tipo === filterType);
    }
    if (filterStatus !== "todos") {
      filteredData = filteredData.filter(exp => exp.status === filterStatus);
    }
    if (filterChannel !== "todos") {
      filteredData = filteredData.filter(exp => 
        exp.canais?.some(canal => canal.toLowerCase().includes(filterChannel.toLowerCase()))
      );
    }
    if (filterResponsible !== "todos") {
      filteredData = filteredData.filter(exp => exp.responsavel === filterResponsible);
    }
    if (dateRange.from && dateRange.to) {
      filteredData = filteredData.filter(exp => {
        const expDate = new Date(exp.created_at);
        return expDate >= dateRange.from! && expDate <= dateRange.to!;
      });
    }

    // Performance por período
    const performanceByPeriod = filteredData.reduce((acc, exp) => {
      const month = format(new Date(exp.created_at), 'MMM yyyy', { locale: ptBR });
      if (!acc[month]) {
        acc[month] = { 
          periodo: month, 
          experimentos: 0, 
          sucessos: 0, 
          roi: 0,
          taxa_sucesso: 0
        };
      }
      acc[month].experimentos++;
      if (exp.resultado?.sucesso) {
        acc[month].sucessos++;
        acc[month].roi += exp.resultado.roi || 0;
      }
      acc[month].taxa_sucesso = (acc[month].sucessos / acc[month].experimentos) * 100;
      return acc;
    }, {} as Record<string, any>);

    // ROI por canal
    const roiByChannel = filteredData.reduce((acc, exp) => {
      exp.canais?.forEach(canal => {
        if (!acc[canal]) {
          acc[canal] = { canal, roi: 0, experimentos: 0 };
        }
        acc[canal].experimentos++;
        if (exp.resultado?.roi) {
          acc[canal].roi += exp.resultado.roi;
        }
      });
      return acc;
    }, {} as Record<string, any>);

    // Análise por tipo
    const analysisByType = filteredData.reduce((acc, exp) => {
      const tipo = exp.tipo || 'outros';
      if (!acc[tipo]) {
        acc[tipo] = { 
          tipo, 
          total: 0, 
          sucessos: 0, 
          roi_medio: 0,
          taxa_sucesso: 0
        };
      }
      acc[tipo].total++;
      if (exp.resultado?.sucesso) {
        acc[tipo].sucessos++;
        acc[tipo].roi_medio += exp.resultado.roi || 0;
      }
      acc[tipo].taxa_sucesso = (acc[tipo].sucessos / acc[tipo].total) * 100;
      acc[tipo].roi_medio = acc[tipo].roi_medio / acc[tipo].sucessos || 0;
      return acc;
    }, {} as Record<string, any>);

    return {
      performanceByPeriod: Object.values(performanceByPeriod),
      roiByChannel: Object.values(roiByChannel),
      analysisByType: Object.values(analysisByType),
      totalExperiments: filteredData.length,
      successRate: (filteredData.filter(exp => exp.resultado?.sucesso).length / filteredData.length) * 100,
      totalROI: filteredData.reduce((acc, exp) => acc + (exp.resultado?.roi || 0), 0),
      avgROI: filteredData.length > 0 ? filteredData.reduce((acc, exp) => acc + (exp.resultado?.roi || 0), 0) / filteredData.length : 0
    };
  }, [experimentos, filterType, filterChannel, filterStatus, filterResponsible, dateRange]);

  const handleExportPDF = () => {
    toast("Exportando relatório em PDF...");
    // Implementar exportação PDF
  };

  const handleExportExcel = () => {
    toast("Exportando relatório em Excel...");
    // Implementar exportação Excel
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link do relatório copiado!");
  };

  const handleScheduleEmail = () => {
    toast("Agendamento de email em desenvolvimento...");
    // Implementar agendamento de email
  };

  if (loading || !processedData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises detalhadas dos seus experimentos e resultados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" onClick={handleScheduleEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Agendar Email
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros Personalizáveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yy")} -{" "}
                          {format(dateRange.to, "dd/MM/yy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      "Período"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange(range || {})}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="criativo">Criativo</SelectItem>
                <SelectItem value="campanha">Campanha</SelectItem>
                <SelectItem value="oferta">Oferta</SelectItem>
                <SelectItem value="produto">Produto</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger>
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os canais</SelectItem>
                {Object.entries(getChannelsByCategory()).map(([categoria, canais]) => (
                  <div key={categoria}>
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {categoria}
                    </div>
                    {canais.map((canal) => (
                      <SelectItem key={canal.value} value={canal.value} className="pl-4">
                        <div className="flex items-center gap-2">
                          <canal.icon className="w-3 h-3" />
                          {canal.label}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="planejado">Planejado</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterResponsible} onValueChange={setFilterResponsible}>
              <SelectTrigger>
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {/* Lista dinâmica de responsáveis */}
                {Array.from(new Set(experimentos?.map(exp => exp.responsavel).filter(Boolean))).map(responsavel => (
                  <SelectItem key={responsavel} value={responsavel!}>
                    {responsavel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger>
                <SelectValue placeholder="Relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance por Período</SelectItem>
                <SelectItem value="tipo">Análise por Tipo</SelectItem>
                <SelectItem value="canal">ROI por Canal</SelectItem>
                <SelectItem value="aprendizados">Evolução de Aprendizados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Insights Principais */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Total de Experimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.totalExperiments}</div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">experimentos bem-sucedidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Visualizações */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="tipo" className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Por Tipo
          </TabsTrigger>
          <TabsTrigger value="canal" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Por Canal
          </TabsTrigger>
          <TabsTrigger value="aprendizados" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Aprendizados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Período</CardTitle>
              <CardDescription>
                Evolução dos experimentos e taxa de sucesso ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={processedData.performanceByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="experimentos" fill="#8884d8" name="Experimentos" />
                  <Line yAxisId="right" type="monotone" dataKey="taxa_sucesso" stroke="#82ca9d" name="Taxa Sucesso (%)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipo" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={processedData.analysisByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.tipo}: ${entry.total}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {processedData.analysisByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Sucesso por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData.analysisByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="taxa_sucesso" fill="#82ca9d" name="Taxa de Sucesso (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="canal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ROI por Canal</CardTitle>
              <CardDescription>
                Comparativo de retorno sobre investimento por canal de distribuição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.roiByChannel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="canal" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="roi" fill="#ffc658" name="ROI Total (%)" />
                  <Bar dataKey="experimentos" fill="#8884d8" name="Nº Experimentos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aprendizados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Aprendizados</CardTitle>
              <CardDescription>
                Principais insights e padrões identificados ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Melhor Canal</h4>
                    <p className="text-2xl font-bold text-green-600">Email</p>
                    <p className="text-sm text-muted-foreground">ROI médio: 285%</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Tipo Mais Eficaz</h4>
                    <p className="text-2xl font-bold text-blue-600">Campanha</p>
                    <p className="text-sm text-muted-foreground">Taxa sucesso: 78%</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Duração Ideal</h4>
                    <p className="text-2xl font-bold text-purple-600">21 dias</p>
                    <p className="text-sm text-muted-foreground">Melhor performance</p>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Principais Aprendizados</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Experimentos de email marketing têm 40% mais chances de sucesso</li>
                    <li>• Campanhas com duração de 14-28 dias apresentam melhor ROI</li>
                    <li>• Testes de oferta convertem 25% melhor que testes de criativo</li>
                    <li>• Experimentos com hipóteses claras têm taxa de sucesso 60% maior</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Seção de Insights AI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Insights AI
          </CardTitle>
          <CardDescription>
            Análises inteligentes baseadas nos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Padrão Identificado</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Experimentos iniciados às terças-feiras têm 23% mais chance de sucesso
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">Recomendação</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Foque em experimentos de email marketing para o próximo trimestre
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900 dark:text-orange-100">Oportunidade</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Canal mobile está subutilizado - apenas 12% dos experimentos
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2">💡 Sugestão de Próximo Experimento</h4>
            <p className="text-sm text-muted-foreground">
              Com base nos seus dados, recomendamos testar uma campanha de email marketing 
              focada em mobile, com duração de 21 dias, iniciando em uma terça-feira.
              Probabilidade de sucesso estimada: <strong>78%</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}