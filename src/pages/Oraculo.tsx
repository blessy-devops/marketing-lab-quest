import { useState, FormEvent } from "react";
import { Brain, BookOpen, Target, Zap, Gift, TrendingUp, CheckSquare, AlertTriangle, BarChart, ExternalLink, Filter, Grid3X3, Bookmark, Play, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
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
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOraculo } from "@/hooks/useOraculo";

export default function Oraculo() {
  const [activeTab, setActiveTab] = useState("consulta-livre");
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [contexto, setContexto] = useState("");
  const [tipo, setTipo] = useState("geral");
  const [metricas, setMetricas] = useState<string[]>([]);
  const [priorizacao, setPriorizacao] = useState("ice");

  const { 
    consultarOraculo, 
    limparResposta, 
    loading, 
    resposta, 
    erro, 
    historico 
  } = useOraculo();


  // Métricas disponíveis
  const metricasDisponiveis = [
    { id: "receita", label: "📈 Receita", emoji: "📈" },
    { id: "conversao", label: "💳 Conversão", emoji: "💳" },
    { id: "ticket", label: "🛒 Ticket Médio", emoji: "🛒" },
    { id: "retencao", label: "👥 Retenção", emoji: "👥" },
    { id: "cac", label: "📊 CAC", emoji: "📊" },
    { id: "ltv", label: "🔄 LTV", emoji: "🔄" },
    { id: "abertura", label: "📧 Taxa de Abertura", emoji: "📧" },
    { id: "ctr", label: "🎯 CTR", emoji: "🎯" },
    { id: "outras", label: "Outras", emoji: "🔧" }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Incluir métricas e priorização no contexto
    const contextoPadrao = [
      contexto,
      metricas.length > 0 ? `Métricas alvo: ${metricas.join(', ')}` : '',
      `Priorização: ${priorizacao === 'ice' ? 'Por ICE Score (Impacto, Confiança, Facilidade)' : 'Livre'}`
    ].filter(Boolean).join(' | ');
    
    await consultarOraculo(pergunta, contextoPadrao, tipo);
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
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="consulta-livre" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            🔮 Consulta Livre
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
                Descreva seu problema atual e/ou objetivo desejado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="query">O que você quer fazer?</Label>
                  <Textarea
                    id="query"
                    placeholder="Descreva seu problema atual e/ou objetivo desejado. Seja específico sobre:
• Situação atual (métricas, problemas, gaps)
• Objetivo desejado (metas, prazos, valores)
• Contexto relevante (público, produto, restrições)"
                    value={pergunta}
                    onChange={(e) => setPergunta(e.target.value)}
                    className="min-h-[140px]"
                    disabled={loading}
                    required
                    minLength={10}
                  />
                  <div className="text-xs text-muted-foreground">
                    {pergunta.length}/500 caracteres
                  </div>
                </div>

                {/* Orientações em texto */}
                <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">💡 Exemplos de perguntas efetivas:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• "Estamos com queda de 30% na conversão do checkout. Como recuperar?"</li>
                    <li>• "Preciso aumentar ticket médio em 20% no próximo mês. Quais estratégias usar?"</li>
                    <li>• "Gap de R$ 50k detectado. Tenho 5 dias para recuperar. O que fazer?"</li>
                  </ul>
                </div>

                {/* Métricas que quer impactar */}
                <div className="space-y-3">
                  <Label>Métricas que quero impactar</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {metricasDisponiveis.map((metrica) => (
                      <div key={metrica.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={metrica.id}
                          checked={metricas.includes(metrica.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setMetricas([...metricas, metrica.id]);
                            } else {
                              setMetricas(metricas.filter(m => m !== metrica.id));
                            }
                          }}
                        />
                        <Label htmlFor={metrica.id} className="text-sm cursor-pointer">
                          {metrica.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seletor de priorização ICE */}
                <div className="space-y-3">
                  <Label>Como priorizar as sugestões?</Label>
                  <RadioGroup value={priorizacao} onValueChange={setPriorizacao}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ice" id="ice" />
                      <Label htmlFor="ice" className="cursor-pointer">
                        <span className="font-medium">Por ICE Score</span> - Prioriza por Impacto, Confiança e Facilidade
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="livre" id="livre" />
                      <Label htmlFor="livre" className="cursor-pointer">
                        <span className="font-medium">Livre</span> - Mostra todas as opções sem ordem específica
                      </Label>
                    </div>
                  </RadioGroup>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Erro na consulta</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="text-red-600 hover:text-red-700"
                >
                  {showErrorDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showErrorDetails ? 'Ocultar' : 'Ver'} detalhes
                </Button>
              </div>
              <p className="text-sm text-red-600 mt-2">{erro}</p>
              
              <Collapsible open={showErrorDetails} onOpenChange={setShowErrorDetails}>
                <CollapsibleContent className="mt-4">
                  <Separator className="mb-4" />
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-red-700">Resposta do servidor:</Label>
                      <div className="mt-1 p-3 bg-red-100 dark:bg-red-900/30 rounded border text-xs text-red-800 dark:text-red-300 font-mono overflow-auto max-h-48">
                        {JSON.stringify(resposta || {}, null, 2)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-red-700">Última consulta:</Label>
                      <div className="mt-1 p-3 bg-red-100 dark:bg-red-900/30 rounded border text-xs text-red-800 dark:text-red-300">
                        <p><strong>Pergunta:</strong> {pergunta}</p>
                        <p><strong>Contexto:</strong> {contexto || 'Nenhum'}</p>
                        <p><strong>Tipo:</strong> {tipo}</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}