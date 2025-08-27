import React from "react";
import { BarChart3, Beaker, Users, Calendar, Target, Clock, AlertCircle, CheckCircle, TrendingUp, Hexagon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RestrictedButton } from "@/components/ui/restricted-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useDashboardMetrics, useExperimentosComResultados } from "@/hooks/useSupabaseData";
import { Link } from "react-router-dom";
import { format, differenceInDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardShellSkeleton } from "@/components/ui/page-shell-skeleton";

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
        const expDate = new Date(exp.data_inicio || exp.created_at);
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

  // Dados do calendário - experimentos com datas
  const calendarEvents = React.useMemo(() => {
    return experimentosData.map(exp => ({
      id: exp.id,
      title: exp.nome,
      start: new Date(exp.data_inicio || exp.created_at),
      end: exp.data_fim ? new Date(exp.data_fim) : new Date(exp.data_inicio || exp.created_at),
      resource: {
        status: exp.status,
        tipo: exp.tipo,
        responsavel: exp.responsavel
      }
    }));
  }, [experimentosData]);

  // Dados do gráfico radar - tipos de experimentos
  const radarData = React.useMemo(() => {
    const tiposCounts: { [key: string]: number } = {};
    
    experimentosData.forEach(exp => {
      const tipo = getTipoLabel(exp.tipo);
      tiposCounts[tipo] = (tiposCounts[tipo] || 0) + 1;
    });

    return Object.entries(tiposCounts).map(([tipo, count]) => ({
      tipo,
      quantidade: count,
      fullMark: Math.max(...Object.values(tiposCounts))
    }));
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

  if (metricsLoading || dataLoading) {
    return <DashboardShellSkeleton />;
  }
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
        <RestrictedButton 
          permission="canCreate"
          tooltipMessage="Apenas editores e admins podem criar experimentos"
          asChild
          className="bg-gradient-to-r from-primary to-primary-glow"
        >
          <Link to="/experimentos/novo" className="flex items-center">
            <Beaker className="w-4 h-4 mr-2" />
            Novo Experimento
          </Link>
        </RestrictedButton>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Evolução mensal como tabela simples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Últimos 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead className="text-right">Experimentos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.month}</TableCell>
                      <TableCell className="text-right">{item.experimentos}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Calendário de experimentos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendário de Experimentos
            </CardTitle>
            <CardDescription>
              Visualização temporal dos experimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-3">
                {calendarEvents.slice(0, 6).map((event) => (
                  <Link
                    key={event.id}
                    to={`/experimentos/${event.id}`}
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(event.resource.status)}`}
                        >
                          {getStatusIcon(event.resource.status)}
                          {event.resource.status === 'em_andamento' ? 'Ativo' : 
                           event.resource.status === 'concluido' ? 'Concluído' : 'Planejado'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {getTipoLabel(event.resource.tipo)}
                      </span>
                      <span>
                        {format(event.start, 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </Link>
                ))}
                {calendarEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <p>Nenhum experimento agendado</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico radar de tipos de experimentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hexagon className="w-5 h-5" />
              Tipos de Experimentos
            </CardTitle>
            <CardDescription>
              Distribuição por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="tipo" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 'dataMax']} 
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name="Quantidade"
                    dataKey="quantidade"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Hexagon className="w-8 h-8 mx-auto mb-2" />
                <p>Nenhum dado disponível</p>
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