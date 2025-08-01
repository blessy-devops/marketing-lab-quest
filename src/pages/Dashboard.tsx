import { BarChart3, Beaker, TrendingUp, Users, Calendar, Target, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Experimentos Ativos",
    value: "12",
    change: "+3 esta semana",
    icon: Beaker,
    color: "text-primary"
  },
  {
    title: "Taxa de Conversão Média",
    value: "8.4%",
    change: "+2.1% vs último mês",
    icon: TrendingUp,
    color: "text-green-600"
  },
  {
    title: "Usuários Impactados",
    value: "45.2K",
    change: "+12% este mês",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "ROI Médio",
    value: "284%",
    change: "+15% vs trimestre anterior",
    icon: Target,
    color: "text-purple-600"
  }
];

const recentExperiments = [
  {
    id: 1,
    name: "Teste A/B - Botão CTA Principal",
    status: "Ativo",
    progress: 75,
    startDate: "2024-01-15",
    participants: "2.3K"
  },
  {
    id: 2,
    name: "Landing Page - Headline Variação",
    status: "Concluído",
    progress: 100,
    startDate: "2024-01-10",
    participants: "1.8K"
  },
  {
    id: 3,
    name: "Email Marketing - Subject Line",
    status: "Em andamento",
    progress: 45,
    startDate: "2024-01-20",
    participants: "5.1K"
  },
  {
    id: 4,
    name: "Checkout - Formulário Simplificado",
    status: "Planejado",
    progress: 0,
    startDate: "2024-02-01",
    participants: "0"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Ativo":
    case "Em andamento":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Concluído":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Planejado":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Ativo":
    case "Em andamento":
      return <Clock className="w-3 h-3" />;
    case "Concluído":
      return <CheckCircle className="w-3 h-3" />;
    case "Planejado":
      return <Calendar className="w-3 h-3" />;
    default:
      return null;
  }
};

export default function Dashboard() {
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
        <Button className="bg-gradient-to-r from-primary to-primary-glow">
          <Beaker className="w-4 h-4 mr-2" />
          Novo Experimento
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Experiments */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Experimentos Recentes
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso dos seus experimentos mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExperiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{experiment.name}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs flex items-center gap-1 ${getStatusColor(experiment.status)}`}
                      >
                        {getStatusIcon(experiment.status)}
                        {experiment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Início: {experiment.startDate}</span>
                      <span>Participantes: {experiment.participants}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${experiment.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[3rem]">
                          {experiment.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}