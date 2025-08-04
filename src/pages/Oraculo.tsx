import { useState } from "react";
import { Brain, BookOpen, Target, Zap, Gift, TrendingUp, CheckSquare, AlertTriangle, BarChart, ExternalLink, Filter, Grid3X3, Bookmark, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function Oraculo() {
  const [activeTab, setActiveTab] = useState("consulta-livre");
  const [query, setQuery] = useState("");
  const [context, setContext] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para consultas guiadas
  const [gapData, setGapData] = useState({
    meta: "",
    dias: "",
    margem: ""
  });

  const [produtoData, setProdutoData] = useState({
    tipo: "",
    ticket: "",
    publico: "",
    orcamento: ""
  });

  const [sazonalData, setSazonalData] = useState({
    evento: "",
    meta: "",
    dias: ""
  });

  // Exemplos clicáveis
  const exemplos = [
    "Campanha relâmpago para fechar gap de 50k em 3 dias",
    "Melhor estratégia para Black Friday",
    "Como aumentar ticket médio em 30%",
    "Estratégia de recuperação de carrinho abandonado",
    "Campanha para público frio com orçamento limitado"
  ];

  // Playbooks mockados
  const playbooks = [
    {
      id: 1,
      titulo: "Gap Recovery 72h",
      tags: ["urgência", "gap", "email"],
      roi: "234%",
      usos: 12,
      tipo: "Gap Recovery"
    },
    {
      id: 2,
      titulo: "Black Friday Playbook",
      tags: ["sazonal", "promoção", "conversão"],
      roi: "189%",
      usos: 8,
      tipo: "Campanha Sazonal"
    },
    {
      id: 3,
      titulo: "Lançamento Premium",
      tags: ["lançamento", "premium", "ticket-alto"],
      roi: "156%",
      usos: 5,
      tipo: "Lançamento"
    }
  ];

  const handleExemploClick = (exemplo: string) => {
    setQuery(exemplo);
  };

  const handleConsultaLivre = async () => {
    setIsLoading(true);
    // Simular resposta
    setTimeout(() => {
      setResponse({
        tipo: "Consulta Livre",
        cache: false,
        resposta: "Para fechar um gap de 50k em 3 dias, recomendo uma estratégia multi-canal focada em conversão imediata...",
        historicos: "Baseado em 15 experimentos similares",
        recomendacoes: [
          "Email urgência para base ativa (ROI esperado: 180%)",
          "Remarketing Facebook com desconto progressivo",
          "Push notification com oferta limitada"
        ],
        alertas: ["Cuidado: promoções > 30% não aumentaram conversão", "Evitar campanhas genéricas em períodos curtos"]
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleTemplateGap = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setResponse({
        tipo: "Template Gap",
        cache: true,
        resposta: `Para recuperar R$ ${gapData.meta} em ${gapData.dias} dias com margem ${gapData.margem}...`,
        historicos: "Baseado em 23 casos similares",
        recomendacoes: [
          "Campanha de urgência via email",
          "Remarketing com countdown",
          "Oferta especial para clientes VIP"
        ],
        alertas: ["Margem baixa pode limitar estratégias", "Tempo curto exige foco em conversão"]
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Oráculo</h1>
              <p className="text-muted-foreground">
                Inteligência artificial para estratégias de marketing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="consulta-livre" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            🔮 Consulta Livre
          </TabsTrigger>
          <TabsTrigger value="consultas-guiadas" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            📋 Consultas Guiadas
          </TabsTrigger>
          <TabsTrigger value="playbooks" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            📚 Playbooks
          </TabsTrigger>
        </TabsList>

        {/* Tab Consulta Livre */}
        <TabsContent value="consulta-livre" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Consulta Livre
              </CardTitle>
              <CardDescription>
                Faça perguntas abertas sobre estratégias de marketing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">O que você quer fazer?</Label>
                <Textarea
                  id="query"
                  placeholder="Descreva sua necessidade ou desafio..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* Exemplos clicáveis */}
              <div className="space-y-2">
                <Label>Exemplos de consultas:</Label>
                <div className="flex flex-wrap gap-2">
                  {exemplos.map((exemplo, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExemploClick(exemplo)}
                      className="text-xs"
                    >
                      {exemplo}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Campo contexto opcional */}
              <div className="space-y-2">
                <Label htmlFor="context">Contexto adicional (opcional)</Label>
                <Textarea
                  id="context"
                  placeholder="Segmento, orçamento, público-alvo, restrições..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleConsultaLivre}
                disabled={!query.trim() || isLoading}
                className="w-full"
              >
                <Brain className="w-4 h-4 mr-2" />
                {isLoading ? "Consultando Oráculo..." : "Consultar Oráculo"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Consultas Guiadas */}
        <TabsContent value="consultas-guiadas" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Card Gap Recovery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-500" />
                  Recuperar Gap de Vendas
                </CardTitle>
                <CardDescription>
                  Estratégia para fechar gaps em prazos curtos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta em R$</Label>
                  <Input
                    placeholder="50.000"
                    value={gapData.meta}
                    onChange={(e) => setGapData({...gapData, meta: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dias restantes</Label>
                  <Input
                    placeholder="3"
                    type="number"
                    value={gapData.dias}
                    onChange={(e) => setGapData({...gapData, dias: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Margem disponível</Label>
                  <Select onValueChange={(value) => setGapData({...gapData, margem: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa (5-15%)</SelectItem>
                      <SelectItem value="media">Média (15-25%)</SelectItem>
                      <SelectItem value="alta">Alta (25%+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleTemplateGap} className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Gerar Estratégia
                </Button>
              </CardContent>
            </Card>

            {/* Card Lançamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Lançamento de Produto
                </CardTitle>
                <CardDescription>
                  Plano completo para lançamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de produto</Label>
                  <Input
                    placeholder="Ex: Curso, Infoproduto, SaaS..."
                    value={produtoData.tipo}
                    onChange={(e) => setProdutoData({...produtoData, tipo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ticket médio</Label>
                  <Input
                    placeholder="197"
                    value={produtoData.ticket}
                    onChange={(e) => setProdutoData({...produtoData, ticket: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Público-alvo</Label>
                  <Select onValueChange={(value) => setProdutoData({...produtoData, publico: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frio">Público Frio</SelectItem>
                      <SelectItem value="morno">Público Morno</SelectItem>
                      <SelectItem value="quente">Base Aquecida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Orçamento</Label>
                  <Input
                    placeholder="5000"
                    value={produtoData.orcamento}
                    onChange={(e) => setProdutoData({...produtoData, orcamento: e.target.value})}
                  />
                </div>
                <Button className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Criar Plano
                </Button>
              </CardContent>
            </Card>

            {/* Card Campanha Sazonal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  Campanha Sazonal
                </CardTitle>
                <CardDescription>
                  Estratégias para datas comemorativas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Evento</Label>
                  <Select onValueChange={(value) => setSazonalData({...sazonalData, evento: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="black-friday">Black Friday</SelectItem>
                      <SelectItem value="natal">Natal</SelectItem>
                      <SelectItem value="dia-maes">Dia das Mães</SelectItem>
                      <SelectItem value="dia-pais">Dia dos Pais</SelectItem>
                      <SelectItem value="valentine">Dia dos Namorados</SelectItem>
                      <SelectItem value="cyber-monday">Cyber Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Meta de faturamento</Label>
                  <Input
                    placeholder="100.000"
                    value={sazonalData.meta}
                    onChange={(e) => setSazonalData({...sazonalData, meta: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dias de campanha</Label>
                  <Input
                    placeholder="7"
                    type="number"
                    value={sazonalData.dias}
                    onChange={(e) => setSazonalData({...sazonalData, dias: e.target.value})}
                  />
                </div>
                <Button className="w-full">
                  <Gift className="w-4 h-4 mr-2" />
                  Gerar Playbook
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Playbooks */}
        <TabsContent value="playbooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Biblioteca de Playbooks</h3>
              <p className="text-sm text-muted-foreground">
                Playbooks testados e validados pela IA
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Visualização
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {playbooks.map((playbook) => (
              <Card key={playbook.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{playbook.titulo}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {playbook.tipo}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {playbook.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">ROI médio</p>
                      <p className="font-semibold text-green-600">{playbook.roi}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Utilizado</p>
                      <p className="font-semibold">{playbook.usos}x</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="w-3 h-3 mr-1" />
                      Usar como base
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Área de Resposta Unificada */}
      {response && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={response.cache ? "secondary" : "default"}>
                  {response.tipo}
                </Badge>
                {response.cache && (
                  <Badge variant="outline" className="text-xs">
                    Cache ⚡
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Salvar como Playbook
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Card 1 - Resposta Contextualizada */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    Resposta Contextualizada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {response.resposta}
                  </p>
                </CardContent>
              </Card>

              {/* Card 2 - Dados Históricos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-blue-600" />
                    Dados Históricos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {response.historicos}
                  </p>
                  <div className="bg-muted/50 h-20 rounded flex items-center justify-center text-xs text-muted-foreground">
                    Mini gráfico de performance
                  </div>
                  <Button variant="link" size="sm" className="p-0 h-auto">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver experimentos
                  </Button>
                </CardContent>
              </Card>

              {/* Card 3 - Recomendações */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-green-600" />
                    Recomendações Prioritárias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {response.recomendacoes.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Checkbox id={`rec-${index}`} />
                      <div className="flex-1 space-y-1">
                        <label 
                          htmlFor={`rec-${index}`}
                          className="text-sm leading-relaxed cursor-pointer"
                        >
                          {rec}
                        </label>
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                          Criar experimento
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Card 4 - Alertas e Riscos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Alertas e Riscos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {response.alertas.map((alerta: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{alerta}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}