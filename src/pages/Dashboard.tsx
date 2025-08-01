import React from "react";
import { BarChart3, Beaker, TrendingUp, Users, Calendar, Target, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardMetrics, useExperimentosComResultados } from "@/hooks/useSupabaseData";
import { Link } from "react-router-dom";
import { format, differenceInDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const getStatusColor = (status: string) => {
  switch (status) {
    case "em_andamento":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "concluido":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "planejado":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "em_andamento":
      return <Clock className="w-3 h-3" />;
    case "concluido":
      return <CheckCircle className="w-3 h-3" />;
    case "planejado":
      return <Calendar className="w-3 h-3" />;
    default:
      return null;
  }
};

const getTipoLabel = (tipo: string) => {
  const tipos: { [key: string]: string } = {
    "criativo": "Criativo",
    "oferta": "Oferta",
    "promocao": "Promoção",
    "canal": "Canal",
    "campanha": "Campanha",
    "narrativa": "Narrativa",
    "landing_page": "Landing Page"
  };
  return tipos[tipo] || tipo;
};

export default function Dashboard() {
  const { metrics, loading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: experimentosData, loading: dataLoading, error: dataError } = useExperimentosComResultados();

  // Preparar dados do gráfico de linha (últimos 6 meses)
  const chartData = React.useMemo(() => {
    if (!experimentosData.length) return [];

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const experimentsInMonth = experimentosData.filter(exp => {
        const expDate = new Date(exp.created_at);
        return expDate >= monthStart && expDate <= monthEnd;
      }).length;

      last6Months.push({
        month: format(date, 'MMM', { locale: ptBR }),
        experimentos: experimentsInMonth
      });
    }
    
    return last6Months;
  }, [experimentosData]);

  // Últimos 5 experimentos concluídos
  const experimentosConcluidos = React.useMemo(() => {
    return experimentosData
      .filter(exp => exp.status === 'concluido')
      .slice(0, 5);
  }, [experimentosData]);

  // Experimentos em andamento
  const experimentosEmAndamento = React.useMemo(() => {
    return experimentosData.filter(exp => exp.status === 'em_andamento');
  }, [experimentosData]);

  // Top 3 aprendizados recentes
  const aprendizadosRecentes = React.useMemo(() => {
    return experimentosData
      .filter(exp => exp.resultado?.aprendizados)
      .slice(0, 3)
      .map(exp => ({
        titulo: exp.nome,
        aprendizado: exp.resultado!.aprendizados!,
        tipo: exp.tipo
      }));
  }, [experimentosData]);

  if (metricsError || dataError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <div>
            <h3 className="font-medium text-destructive">Erro ao carregar dados</h3>
            <p className="text-sm text-muted-foreground">
              {metricsError || dataError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus experimentos de marketing
          </p>
        </div>
        <Link to="/experimentos/novo">
          <Button className="bg-gradient-to-r from-primary to-primary-glow">
            <Beaker className="w-4 h-4 mr-2" />
            Novo Experimento
          </Button>
        </Link>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Experimentos
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.totalExperimentos}</div>
                <p className="text-xs text-muted-foreground">
                  experimentos realizados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.taxaSucesso}%</div>
                <p className="text-xs text-muted-foreground">
                  de experimentos bem-sucedidos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Andamento
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.experimentosEmAndamento}</div>
                <p className="text-xs text-muted-foreground">
                  experimentos ativos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ROI Médio
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.roiMedio}%</div>
                <p className="text-xs text-muted-foreground">
                  retorno sobre investimento
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de evolução */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Evolução Mensal de Experimentos
            </CardTitle>
            <CardDescription>
              Número de experimentos criados nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="experimentos" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos experimentos concluídos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Experimentos Concluídos
            </CardTitle>
            <CardDescription>
              Últimos 5 experimentos finalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : experimentosConcluidos.length > 0 ? (
              <div className="space-y-3">
                {experimentosConcluidos.map((exp) => (
                  <Link
                    key={exp.id}
                    to={`/experimentos/${exp.id}`}
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{exp.nome}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getTipoLabel(exp.tipo)}
                        </Badge>
                        {exp.resultado?.sucesso !== null && (
                          <Badge variant={exp.resultado.sucesso ? "default" : "destructive"} className="text-xs">
                            {exp.resultado.sucesso ? "Sucesso" : "Falha"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        ROI: {exp.resultado?.roi ? `${exp.resultado.roi}%` : "N/A"}
                      </span>
                      <span>
                        {format(new Date(exp.created_at), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Nenhum experimento concluído ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experimentos em andamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Em Andamento
            </CardTitle>
            <CardDescription>
              Experimentos atualmente em execução
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : experimentosEmAndamento.length > 0 ? (
              <div className="space-y-3">
                {experimentosEmAndamento.map((exp) => {
                  const diasEmExecucao = exp.data_inicio 
                    ? differenceInDays(new Date(), new Date(exp.data_inicio))
                    : 0;
                  
                  return (
                    <Link
                      key={exp.id}
                      to={`/experimentos/${exp.id}`}
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{exp.nome}</h4>
                        <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <Clock className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Responsável: {exp.responsavel || "Não definido"}
                        </span>
                        <span>
                          {diasEmExecucao} dias em execução
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p>Nenhum experimento em andamento</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 3 aprendizados recentes */}
      {aprendizadosRecentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Aprendizados Recentes
            </CardTitle>
            <CardDescription>
              Principais insights dos experimentos mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {aprendizadosRecentes.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-gradient-to-br from-card to-card/80"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getTipoLabel(item.tipo)}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-2">{item.titulo}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {item.aprendizado}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}