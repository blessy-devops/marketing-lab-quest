import React, { useState, useMemo, lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getChannelsByCategory, getChannelIcon } from "@/constants/canais";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUpRight, 
  Calendar, 
  Target, 
  TrendingUp, 
  Users, 
  Filter,
  Copy,
  Eye,
  Award,
  BarChart3,
  Zap,
  Gift,
  Trophy,
  Star,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { useExperimentosComResultados } from "@/hooks/useSupabaseData";

// Lazy loading para imagens
const LazyImage = lazy(() => Promise.resolve({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format`;
      }}
    />
  )
}));

const getCategoryColor = (category: string) => {
  const colors = {
    "e-commerce": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "produto": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "conversao": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "email": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "landing": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    "atendimento": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "mobile": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
  };
  return colors[category?.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
};

const getChannelEmojiIcon = (channel: string) => {
  switch (channel?.toLowerCase()) {
    case "email": return "📧";
    case "social": return "📱";
    case "web": return "🌐";
    case "mobile": return "📲";
    default: return "🎯";
  }
};

export default function Gallery() {
  const { data: experimentos, loading } = useExperimentosComResultados();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [filterPeriod, setFilterPeriod] = useState("todos");
  const [filterChannel, setFilterChannel] = useState("todos");
  const [sortBy, setSortBy] = useState("roi");

  // Filtrar apenas experimentos com sucesso
  const successExperiments = useMemo(() => {
    if (!experimentos) return [];
    
    return experimentos
      .filter(exp => 
        exp.resultado?.sucesso === true &&
        exp.status === "concluido"
      )
      .map(exp => ({
        ...exp,
        roi: exp.resultado?.roi || 0
      }));
  }, [experimentos]);

  // Aplicar filtros
  const filteredData = useMemo(() => {
    let filtered = successExperiments;

    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.hipotese?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "todos") {
      filtered = filtered.filter(exp => exp.tipo === filterType);
    }

    if (filterChannel !== "todos") {
      filtered = filtered.filter(exp => 
        exp.canais?.some(canal => canal.toLowerCase().includes(filterChannel.toLowerCase()))
      );
    }

    if (filterPeriod !== "todos") {
      const now = new Date();
      const months = parseInt(filterPeriod);
      const cutoffDate = new Date(now.setMonth(now.getMonth() - months));
      filtered = filtered.filter(exp => 
        new Date(exp.data_fim || exp.created_at) >= cutoffDate
      );
    }

    // Ordenação
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "roi":
          return (b.roi || 0) - (a.roi || 0);
        case "data":
          return new Date(b.data_fim || b.created_at).getTime() - new Date(a.data_fim || a.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [successExperiments, searchTerm, filterType, filterPeriod, filterChannel, sortBy]);

  // Separar por categorias
  const topCreatives = filteredData.filter(exp => exp.tipo === "criativo").slice(0, 6);
  const bestCampaigns = filteredData.filter(exp => exp.tipo === "campanha").slice(0, 6);
  const championOffers = filteredData.filter(exp => exp.tipo === "oferta").slice(0, 6);

  // Estatísticas gerais
  const totalROI = filteredData.reduce((acc, exp) => acc + (exp.roi || 0), 0);
  const avgROI = filteredData.length > 0 ? totalROI / filteredData.length : 0;
  const totalExperiments = filteredData.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galeria de Sucessos</h1>
          <p className="text-muted-foreground">
            Explore os experimentos que geraram os melhores resultados
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary/80">
          <Trophy className="w-4 h-4 mr-2" />
          Ver Relatório Completo
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Input
                placeholder="Buscar experimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
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

            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os períodos</SelectItem>
                <SelectItem value="1">Último mês</SelectItem>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Último ano</SelectItem>
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roi">ROI (maior)</SelectItem>
                <SelectItem value="data">Data (mais recente)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Sucessos Encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExperiments}</div>
            <p className="text-xs text-muted-foreground">experimentos de sucesso</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              ROI Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalROI.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">retorno total gerado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              ROI Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgROI.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">retorno médio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Padrões Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">insights automáticos</p>
          </CardContent>
        </Card>
      </div>

      {/* Seções Organizadas */}
      <Tabs defaultValue="criativos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="criativos" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Top Criativos
          </TabsTrigger>
          <TabsTrigger value="campanhas" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Melhores Campanhas
          </TabsTrigger>
          <TabsTrigger value="ofertas" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Ofertas Campeãs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="criativos" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topCreatives.map((exp) => (
              <Card key={exp.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      <Award className="w-3 h-3 mr-1" />
                      Top Performer
                    </Badge>
                    <Badge className={getCategoryColor(exp.tipo || "")}>
                      {exp.tipo}
                    </Badge>
                  </div>
                  
                  <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                    <Suspense fallback={<Skeleton className="w-full h-full" />}>
                      <LazyImage
                        src={`https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format`}
                        alt={exp.nome || "Criativo"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Suspense>
                  </div>

                  <CardTitle className="text-lg leading-tight">
                    {exp.nome}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {exp.hipotese}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">ROI</p>
                      <p className="font-semibold text-green-600">{exp.roi}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Canal</p>
                      <p className="font-semibold flex items-center gap-1">
                        {React.createElement(getChannelIcon(exp.canais?.[0] || ""), { className: "w-4 h-4" })}
                        {exp.canais?.[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link to={`/experimentos/${exp.id}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Copy className="w-3 h-3 mr-1" />
                      Usar como Base
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campanhas" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {bestCampaigns.map((exp) => (
              <Card key={exp.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <Award className="w-3 h-3 mr-1" />
                      Top Performer
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {new Date(exp.data_fim || exp.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl leading-tight">
                    {exp.nome}
                  </CardTitle>
                  <CardDescription>
                    {exp.hipotese}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{exp.roi}%</div>
                      <div className="text-sm text-muted-foreground">ROI alcançado</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Duração</p>
                      <p className="font-semibold">
                        {exp.data_inicio && exp.data_fim ? 
                          Math.ceil((new Date(exp.data_fim).getTime() - new Date(exp.data_inicio).getTime()) / (1000 * 60 * 60 * 24)) 
                          : 'N/A'} dias
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-semibold capitalize">{exp.status}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link to={`/experimentos/${exp.id}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Copy className="w-3 h-3 mr-1" />
                      Usar como Base
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ofertas" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {championOffers.map((exp) => (
              <Card key={exp.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      <Award className="w-3 h-3 mr-1" />
                      Oferta Campeã
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {exp.data_fim ? `Válida até ${new Date(exp.data_fim).toLocaleDateString('pt-BR')}` : 'Permanente'}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl leading-tight">
                    {exp.nome}
                  </CardTitle>
                  <CardDescription>
                    {exp.hipotese}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-purple-600">{exp.roi}%</div>
                        <div className="text-xs text-muted-foreground">Conversão</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-purple-600">
                          {exp.resultado?.aprendizados ? 'Alto' : 'Médio'}
                        </div>
                        <div className="text-xs text-muted-foreground">Faturamento</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Principais aprendizados:</p>
                    <p className="line-clamp-2">{exp.resultado?.aprendizados || 'Dados em análise...'}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link to={`/experimentos/${exp.id}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Copy className="w-3 h-3 mr-1" />
                      Usar como Base
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights Automáticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Insights Automáticos
          </CardTitle>
          <CardDescription>
            Padrões identificados automaticamente nos seus experimentos de sucesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium">Canal Mais Efetivo</div>
              <div className="text-lg font-bold text-primary">Email Marketing</div>
              <div className="text-xs text-muted-foreground">73% de taxa de sucesso</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium">Melhor Período</div>
              <div className="text-lg font-bold text-primary">Terça-feira</div>
              <div className="text-xs text-muted-foreground">+45% de engajamento</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium">Duração Ideal</div>
              <div className="text-lg font-bold text-primary">14-21 dias</div>
              <div className="text-xs text-muted-foreground">ROI médio de 280%</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm font-medium">Tipo Mais Eficaz</div>
              <div className="text-lg font-bold text-primary">Campanhas</div>
              <div className="text-xs text-muted-foreground">ROI médio 40% maior</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="text-center py-8">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Pronto para criar o próximo sucesso?
          </h3>
          <p className="text-muted-foreground mb-4">
            Use os insights da galeria para criar experimentos ainda mais efetivos
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link to="/experimentos/novo">
                Criar Novo Experimento
              </Link>
            </Button>
            <Button variant="outline">
              Ver Relatório Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}