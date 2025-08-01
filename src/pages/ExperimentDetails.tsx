import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, Square, Edit, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExperimentDetails() {
  const { id } = useParams();

  // Mock data - em produção viria do backend
  const experiment = {
    id: id,
    name: "Teste A/B - Botão CTA Principal",
    description: "Testando diferentes cores e textos para o botão de call-to-action na página inicial",
    status: "Ativo",
    type: "A/B Test",
    hypothesis: "Se alterarmos a cor do botão CTA de azul para verde e o texto de 'Saiba Mais' para 'Comece Agora', então a taxa de conversão aumentará porque o verde transmite mais urgência e o texto é mais direto.",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    progress: 75,
    participants: 2300,
    conversionRate: 8.4,
    confidence: 95,
    power: 80,
    variants: [
      {
        name: "Controle",
        traffic: 50,
        visitors: 1150,
        conversions: 92,
        conversionRate: 8.0,
        improvement: 0
      },
      {
        name: "Variação A",
        traffic: 50,
        visitors: 1150,
        conversions: 105,
        conversionRate: 9.1,
        improvement: 13.8
      }
    ],
    metrics: {
      significance: 87,
      pValue: 0.045,
      minDetectableEffect: 2.5
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Concluído":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Pausado":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{experiment.name}</h1>
            <Badge className={getStatusColor(experiment.status)}>
              {experiment.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{experiment.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          {experiment.status === "Ativo" ? (
            <Button variant="outline" size="sm">
              <Pause className="w-4 h-4 mr-2" />
              Pausar
            </Button>
          ) : (
            <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow">
              <Play className="w-4 h-4 mr-2" />
              Retomar
            </Button>
          )}
          <Button variant="destructive" size="sm">
            <Square className="w-4 h-4 mr-2" />
            Finalizar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiment.progress}%</div>
            <Progress value={experiment.progress} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiment.participants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">usuários no experimento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiment.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">média geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Significância</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiment.metrics.significance}%</div>
            <p className="text-xs text-muted-foreground">confiança estatística</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="results" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="variants">Variações</TabsTrigger>
          <TabsTrigger value="setup">Configuração</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance das Variações</CardTitle>
                <CardDescription>
                  Comparação entre controle e variação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {experiment.variants.map((variant, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{variant.name}</h4>
                        <Badge variant={variant.improvement > 0 ? "default" : "secondary"}>
                          {variant.improvement > 0 ? "+" : ""}{variant.improvement}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Visitantes</p>
                          <p className="font-medium">{variant.visitors.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversões</p>
                          <p className="font-medium">{variant.conversions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taxa</p>
                          <p className="font-medium">{variant.conversionRate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Estatísticas</CardTitle>
                <CardDescription>
                  Análise da confiabilidade dos resultados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nível de Confiança</p>
                    <p className="text-2xl font-bold">{experiment.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Poder Estatístico</p>
                    <p className="text-2xl font-bold">{experiment.power}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor P</p>
                    <p className="text-2xl font-bold">{experiment.metrics.pValue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">MDE</p>
                    <p className="text-2xl font-bold">{experiment.metrics.minDetectableEffect}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração das Variações</CardTitle>
              <CardDescription>
                Detalhes de cada variação do experimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {experiment.variants.map((variant, index) => (
                  <div key={index} className="p-6 rounded-lg border bg-card">
                    <h3 className="font-semibold mb-4">{variant.name}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium mb-2">Distribuição de Tráfego</p>
                        <Progress value={variant.traffic} className="mb-1" />
                        <p className="text-xs text-muted-foreground">{variant.traffic}% do tráfego</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Estatísticas</p>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Visitantes:</span>
                            <span>{variant.visitors.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Conversões:</span>
                            <span>{variant.conversions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taxa de Conversão:</span>
                            <span>{variant.conversionRate}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Experimento</CardTitle>
              <CardDescription>
                Informações sobre a configuração e hipótese
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Hipótese</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  {experiment.hypothesis}
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Tipo de Experimento</h4>
                  <p className="text-sm">{experiment.type}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Período</h4>
                  <p className="text-sm">{experiment.startDate} - {experiment.endDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline do Experimento</CardTitle>
              <CardDescription>
                Histórico de eventos e marcos importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Experimento iniciado</p>
                    <p className="text-xs text-muted-foreground">15 de Janeiro, 2024 - 09:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Primeira significância atingida</p>
                    <p className="text-xs text-muted-foreground">22 de Janeiro, 2024 - 14:30</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pb-4">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Finalização programada</p>
                    <p className="text-xs text-muted-foreground">15 de Fevereiro, 2024 - 23:59</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}