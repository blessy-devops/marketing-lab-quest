import { BarChart3, Download, Filter, Calendar, TrendingUp, Users, Target, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Reports() {
  const monthlyData = [
    { month: "Jan", experiments: 8, conversions: 156, roi: 45000 },
    { month: "Fev", experiments: 12, conversions: 203, roi: 67000 },
    { month: "Mar", experiments: 10, conversions: 178, roi: 52000 },
    { month: "Abr", experiments: 15, conversions: 267, roi: 89000 },
    { month: "Mai", experiments: 13, conversions: 234, roi: 76000 },
    { month: "Jun", experiments: 18, conversions: 312, roi: 124000 }
  ];

  const topExperiments = [
    {
      name: "Redesign do Checkout",
      category: "UX/UI",
      improvement: 34,
      roi: 284000,
      participants: 12500
    },
    {
      name: "Nova Landing Page",
      category: "Landing Page", 
      improvement: 48,
      roi: 156000,
      participants: 8200
    },
    {
      name: "Email Subject Lines",
      category: "Email Marketing",
      improvement: 67,
      roi: 89000,
      participants: 25300
    },
    {
      name: "Pricing Page Redesign",
      category: "Pricing",
      improvement: 23,
      roi: 412000,
      participants: 6800
    }
  ];

  const categories = [
    { name: "UX/UI", experiments: 12, avgImprovement: 28, color: "bg-purple-500" },
    { name: "Landing Page", experiments: 8, avgImprovement: 35, color: "bg-green-500" },
    { name: "Email Marketing", experiments: 15, avgImprovement: 42, color: "bg-blue-500" },
    { name: "Pricing", experiments: 6, avgImprovement: 19, color: "bg-yellow-500" },
    { name: "A/B Test", experiments: 23, avgImprovement: 24, color: "bg-pink-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise completa do desempenho dos seus experimentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button className="bg-gradient-to-r from-primary to-primary-glow">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Período de Análise</CardTitle>
              <CardDescription>
                Selecione o período para análise dos dados
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="6months">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Último mês</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Total de Experimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76</div>
                <p className="text-xs text-muted-foreground">+12 vs período anterior</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Taxa de Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">73%</div>
                <p className="text-xs text-muted-foreground">+5% vs período anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuários Impactados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">284K</div>
                <p className="text-xs text-muted-foreground">+18% vs período anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  ROI Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 1.2M</div>
                <p className="text-xs text-muted-foreground">+34% vs período anterior</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
              <CardDescription>
                Acompanhe o crescimento dos experimentos ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center">
                        <div className="font-medium">{data.month}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-8 text-sm">
                        <div>
                          <p className="text-muted-foreground">Experimentos</p>
                          <p className="font-medium">{data.experiments}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversões</p>
                          <p className="font-medium">{data.conversions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ROI</p>
                          <p className="font-medium">R$ {(data.roi / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(data.experiments / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Experimentos por Performance</CardTitle>
              <CardDescription>
                Os experimentos com melhor retorno sobre investimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topExperiments.map((experiment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{experiment.name}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {experiment.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-sm text-right">
                      <div>
                        <p className="text-muted-foreground">Melhoria</p>
                        <p className="font-medium text-green-600">+{experiment.improvement}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROI</p>
                        <p className="font-medium">R$ {(experiment.roi / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Participantes</p>
                        <p className="font-medium">{(experiment.participants / 1000).toFixed(1)}K</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Categoria</CardTitle>
              <CardDescription>
                Compare o desempenho entre diferentes tipos de experimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <h4 className="font-medium">{category.name}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experimentos:</span>
                        <span className="font-medium">{category.experiments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Melhoria Média:</span>
                        <span className="font-medium text-green-600">+{category.avgImprovement}%</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.color}`}
                          style={{ width: `${(category.avgImprovement / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Crescimento</CardTitle>
                <CardDescription>
                  Análise das tendências ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Volume de Experimentos</span>
                    <span className="text-sm font-medium text-green-600">+25% trimestre</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Conversão Média</span>
                    <span className="text-sm font-medium text-green-600">+12% trimestre</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ROI por Experimento</span>
                    <span className="text-sm font-medium text-green-600">+18% trimestre</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tempo Médio de Teste</span>
                    <span className="text-sm font-medium text-blue-600">-8% trimestre</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Previsões</CardTitle>
                <CardDescription>
                  Projeções baseadas em tendências atuais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary">Próximo Trimestre</p>
                    <p className="text-xs text-muted-foreground">Expectativa de +30% em experimentos</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">ROI Projetado</p>
                    <p className="text-xs text-green-600 dark:text-green-400">R$ 1.8M baseado na tendência atual</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}