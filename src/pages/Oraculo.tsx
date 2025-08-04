import { useState, FormEvent } from "react";
import { Brain, BookOpen, Target, Zap, Gift, TrendingUp, CheckSquare, AlertTriangle, BarChart, ExternalLink, Filter, Grid3X3, Bookmark, Play, Loader2, Sparkles } from "lucide-react";
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
import { useOraculo } from "@/hooks/useOraculo";

export default function Oraculo() {
  const [activeTab, setActiveTab] = useState("consulta-livre");
  const [pergunta, setPergunta] = useState("");
  const [contexto, setContexto] = useState("");
  const [tipo, setTipo] = useState("geral");

  const { 
    consultarOraculo, 
    limparResposta, 
    loading, 
    resposta, 
    erro, 
    historico 
  } = useOraculo();

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
    setPergunta(exemplo);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await consultarOraculo(pergunta, contexto, tipo);
  };

  const handleHistoricoClick = (item: any) => {
    setPergunta(item.pergunta);
    // Set response directly from history
    const fakeResponse = {
      resposta: {
        resposta_completa: item.resposta?.resposta_completa || "Resposta do histórico"
      },
      metadados: item.resposta?.metadados || {}
    };
    // Temporarily set response state for display (this should use actual state management)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTemplateGap = async () => {
    const gapQuery = `Recuperar gap de vendas de R$ ${gapData.meta} em ${gapData.dias} dias com margem ${gapData.margem}`;
    await consultarOraculo(gapQuery, `Meta: ${gapData.meta}, Dias: ${gapData.dias}, Margem: ${gapData.margem}`, 'urgente');
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
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">O que você quer fazer?</Label>
                <Textarea
                  id="query"
                  placeholder="Descreva sua necessidade ou desafio..."
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  className="min-h-[120px]"
                  disabled={loading}
                  required
                  minLength={10}
                />
                <div className="text-xs text-muted-foreground">
                  {pergunta.length}/500 caracteres
                </div>
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
                  value={contexto}
                  onChange={(e) => setContexto(e.target.value)}
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Tipo de consulta */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de consulta</Label>
                <Select value={tipo} onValueChange={setTipo} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="estrategico">Estratégico</SelectItem>
                    <SelectItem value="analise">Análise</SelectItem>
                    <SelectItem value="otimizacao">Otimização</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit"
                disabled={!pergunta.trim() || pergunta.length < 10 || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Consultar Oráculo
                  </>
                )}
              </Button>
            </form>
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

      {/* Área de Resposta */}
      {resposta && !loading && (
        <div className="max-w-4xl mx-auto mt-8 animate-fadeIn">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Resposta do Oráculo
                  {resposta.metadados?.cache && (
                    <Badge variant="secondary">Cache</Badge>
                  )}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={limparResposta}>
                  Nova Consulta
                </Button>
              </div>
              {resposta.metadados?.processado_em && (
                <CardDescription>
                  Processado em {resposta.metadados.processado_em} • 
                  {resposta.metadados.experimentos_analisados || 0} experimentos analisados
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resposta principal */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">💡 Análise e Recomendações</h4>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {resposta.resposta.resposta_completa || resposta.resposta.resumo || "Resposta não disponível"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Dados históricos */}
              {resposta.resposta.dados && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    📊 Dados Históricos
                  </h4>
                  <p className="text-sm text-muted-foreground">{resposta.resposta.dados}</p>
                </div>
              )}

              {/* Próximos passos */}
              {resposta.resposta.proximos_passos && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    🎯 Próximos Passos
                  </h4>
                  <div className="space-y-2">
                    {resposta.resposta.proximos_passos.split('\n').map((passo: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <Checkbox id={`passo-${index}`} />
                        <label htmlFor={`passo-${index}`} className="text-sm cursor-pointer">
                          {passo}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alertas */}
              {resposta.resposta.alertas && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    ⚠️ Alertas e Riscos
                  </h4>
                  <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                    {resposta.resposta.alertas}
                  </p>
                </div>
              )}

              {/* Metadados */}
              {resposta.metadados && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {resposta.metadados.fonte && (
                      <div>
                        <p className="text-muted-foreground">Fonte</p>
                        <p className="font-medium">{resposta.metadados.fonte}</p>
                      </div>
                    )}
                    {resposta.metadados.agentes_consultados && (
                      <div>
                        <p className="text-muted-foreground">Agentes</p>
                        <p className="font-medium">{resposta.metadados.agentes_consultados.join(', ')}</p>
                      </div>
                    )}
                    {resposta.metadados.experimentos_analisados && (
                      <div>
                        <p className="text-muted-foreground">Experimentos</p>
                        <p className="font-medium">{resposta.metadados.experimentos_analisados}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Cache</p>
                      <p className="font-medium">{resposta.metadados.cache ? 'Sim' : 'Não'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico Lateral */}
      {historico.length > 0 && (
        <div className="fixed right-4 top-20 w-80 bg-white dark:bg-gray-950 rounded-lg shadow-lg p-4 border z-50">
          <h3 className="font-semibold mb-3">Consultas Recentes</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {historico.map((item: any) => (
              <button
                key={item.id}
                onClick={() => handleHistoricoClick(item)}
                className="w-full text-left p-2 hover:bg-muted rounded text-sm"
              >
                <div className="font-medium truncate">
                  {item.pergunta}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString('pt-BR')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {erro && (
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Erro na consulta</span>
              </div>
              <p className="text-sm text-red-600 mt-2">{erro}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}