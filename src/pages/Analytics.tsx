import { TrendingUp, Users, Target, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Análise detalhada do desempenho dos experimentos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Conversões Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Visitantes Únicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K</div>
            <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.8%</div>
            <p className="text-xs text-muted-foreground">+0.3% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tempo Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3m 24s</div>
            <p className="text-xs text-muted-foreground">-15s vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em Desenvolvimento</CardTitle>
          <CardDescription>
            Esta página estará disponível em breve com gráficos interativos e análises avançadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Funcionalidade em desenvolvimento
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}