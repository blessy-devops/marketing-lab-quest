import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Copy, Trash2, Plus, Upload, FileText, Image, Link, Calendar, User, Target, TrendingUp, CheckCircle, XCircle, MessageSquare, History, Send, Edit, X, Share2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestrictedButton } from "@/components/ui/restricted-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useExperimentosComResultados } from "@/hooks/useSupabaseData";
import { useComentarios } from "@/hooks/useComentarios";
import { useAuth } from "@/hooks/useAuth";
import { DeleteExperimentDialog } from "@/components/DeleteExperimentDialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ComentarioItem } from "@/components/ComentarioItem";
import { TipoExperimentoDisplay } from "@/components/forms/TipoExperimentoDisplay";
import { FileUpload } from "@/components/anexos/FileUpload";
import { useAnexos } from "@/hooks/useAnexos";
import { ShareExperimentDialog } from "@/components/share/ShareExperimentDialog";
import { ExperimentDetailsShellSkeleton } from '@/components/ui/page-shell-skeleton';

type Metrica = Tables<"metricas">;

const ExperimentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { data: experimentos, loading, error } = useExperimentosComResultados();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [metricasAgrupadas, setMetricasAgrupadas] = useState<Record<string, {
    nome: string;
    unidade?: string;
    baseline?: number;
    esperada?: number;
    realizada?: number;
  }>>({});
  const [novoComentario, setNovoComentario] = useState("");
  const [editingText, setEditingText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  
  // Hook de anexos
  const { anexos, loading: loadingAnexos, setAnexos } = useAnexos(id);

  const experimento = experimentos?.find(exp => exp.id === id);
  
  // Hook de comentários
  const {
    comentarios,
    loading: loadingComentarios,
    user,
    editingId,
    setEditingId,
    adicionarComentario,
    editarComentario,
    excluirComentario
  } = useComentarios(id || "");

  // Buscar métricas do experimento
  useEffect(() => {
    if (experimento?.id) {
      const fetchMetricas = async () => {
        const { data, error } = await supabase
          .from('metricas')
          .select('*')
          .eq('experimento_id', experimento.id);
        
        if (!error && data) {
          setMetricas(data);
          
          // Agrupar métricas por nome
          const agrupadas = data.reduce((acc, metrica) => {
            const { nome, unidade, valor, tipo } = metrica;
            
            if (!acc[nome]) {
              acc[nome] = {
                nome,
                unidade,
              };
            }
            
            if (tipo === 'baseline') {
              acc[nome].baseline = valor;
            } else if (tipo === 'esperada') {
              acc[nome].esperada = valor;
            } else if (tipo === 'realizada') {
              acc[nome].realizada = valor;
            }
            
            return acc;
          }, {} as Record<string, {
            nome: string;
            unidade?: string;
            baseline?: number;
            esperada?: number;
            realizada?: number;
          }>);
          
          setMetricasAgrupadas(agrupadas);
        }
      };
      fetchMetricas();
    }
  }, [experimento?.id]);

  if (loading) {
    return <ExperimentDetailsShellSkeleton />;
  }

  if (!experimento) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Experimento não encontrado</h1>
          <Button onClick={() => navigate("/experimentos")}>
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'planejado': 'bg-secondary text-secondary-foreground',
      'em_andamento': 'bg-primary text-primary-foreground',
      'pausado': 'bg-destructive/20 text-destructive',
      'concluido': 'bg-accent text-accent-foreground',
      'cancelado': 'bg-muted text-muted-foreground'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const handleNameEdit = () => {
    if (isEditingName) {
      // Aqui salvaria no banco
      setIsEditingName(false);
    } else {
      setEditedName(experimento.nome);
      setIsEditingName(true);
    }
  };

  const handleDuplicate = async () => {
    if (!experimento) return;
    
    try {
      // Criar experimento duplicado
      const { data: novoExperimento, error } = await supabase
        .from('experimentos')
        .insert({
          nome: `${experimento.nome} (Cópia)`,
          tipo: experimento.tipo,
          responsavel: experimento.responsavel,
          status: 'planejado',
          canais: experimento.canais,
          hipotese: experimento.hipotese,
          data_inicio: null,
          data_fim: null
        })
        .select()
        .single();

      if (error) throw error;

      // Duplicar métricas (apenas as esperadas, não as realizadas)
      if (metricas.length > 0) {
        const metricasEsperadas = metricas
          .filter(m => m.tipo === 'esperada')
          .map(metrica => ({
            experimento_id: novoExperimento.id,
            nome: metrica.nome,
            valor: metrica.valor,
            unidade: metrica.unidade,
            tipo: 'esperada'
          }));

        if (metricasEsperadas.length > 0) {
          await supabase
            .from('metricas')
            .insert(metricasEsperadas);
        }
      }

      toast.success('Experimento duplicado com sucesso!');
      navigate(`/experimentos/${novoExperimento.id}`);
      
    } catch (error) {
      console.error('Erro ao duplicar experimento:', error);
      toast.error('Erro ao duplicar experimento');
    }
  };

  // Funções auxiliares para a tabela de métricas
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    return value.toFixed(2);
  };

  const calculatePercentage = (newValue: number | undefined, oldValue: number | undefined): string => {
    if (!newValue || !oldValue || oldValue === 0) return '-';
    const percentage = ((newValue / oldValue) - 1) * 100;
    return percentage.toFixed(1);
  };

  const getVariationDisplay = (newValue: number | undefined, oldValue: number | undefined) => {
    if (!newValue || !oldValue || oldValue === 0) {
      return { text: '-', color: '', icon: null };
    }
    
    const percentage = ((newValue / oldValue) - 1) * 100;
    const isPositive = percentage > 0;
    
    return {
      text: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      icon: isPositive ? ArrowUp : ArrowDown
    };
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ShareExperimentDialog open={openShare} onOpenChange={setOpenShare} experimentoId={experimento.id} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/experimentos")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameEdit}
                onKeyDown={(e) => e.key === 'Enter' && handleNameEdit()}
                className="text-2xl font-bold border-none p-0 h-auto bg-transparent"
                autoFocus
              />
            ) : (
              <h1 
                className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
                onClick={handleNameEdit}
              >
                {experimento.nome}
              </h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNameEdit}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>

          <Badge className={getStatusColor(experimento.status)}>
            {experimento.status?.replace('_', ' ')}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <RestrictedButton 
                permission="canEdit"
                tooltipMessage="Apenas editores e admins podem editar experimentos"
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/experimentos/${id}/editar`)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </RestrictedButton>
              <RestrictedButton 
                permission="canCreate"
                tooltipMessage="Apenas editores e admins podem duplicar experimentos"
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </RestrictedButton>
              <RestrictedButton
                permission="canEdit"
                tooltipMessage="Compartilhar experimento via link público"
                variant="outline"
                size="sm"
                onClick={() => setOpenShare(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </RestrictedButton>
              <RestrictedButton
                permission="canDelete"
                tooltipMessage="Apenas admins podem excluir experimentos"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </RestrictedButton>
            </>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="results" disabled={experimento.status !== 'concluido'}>
            Resultados
          </TabsTrigger>
          <TabsTrigger value="attachments">
            Anexos ({anexos.length})
          </TabsTrigger>
          <TabsTrigger value="comments">Comentários</TabsTrigger>
        </TabsList>

        {/* Aba Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tipo de Experimento</CardTitle>
                <Target className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <TipoExperimentoDisplay 
                  tipoId={(experimento as any).tipo_experimento_id || undefined}
                  subtipoId={(experimento as any).subtipo_experimento_id || undefined}
                  subtipoCustomizado={(experimento as any).subtipo_customizado || undefined}
                  showDescription={true}
                  size="sm"
                />
                {(!(experimento as any).tipo_experimento_id && experimento.tipo) && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <span className="text-muted-foreground">Tipo legado:</span> {experimento.tipo}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Responsável</CardTitle>
                <User className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{experimento.responsavel || 'Não definido'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duração</CardTitle>
                <Calendar className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {experimento.data_inicio && experimento.data_fim
                    ? `${Math.ceil((new Date(experimento.data_fim).getTime() - new Date(experimento.data_inicio).getTime()) / (1000 * 60 * 60 * 24))} dias`
                    : 'Não definido'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hipótese */}
          <Card>
            <CardHeader>
              <CardTitle>Hipótese</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                {experimento.hipotese || 'Nenhuma hipótese definida'}
              </p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline do Experimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {experimento.data_inicio && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-medium">Início</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(experimento.data_inicio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
                {experimento.data_fim && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <div>
                      <p className="font-medium">Fim</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(experimento.data_fim).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Canais */}
          {experimento.canais && experimento.canais.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Canais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {experimento.canais.map((canal, index) => (
                    <Badge key={index} variant="secondary">
                      {canal}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Métricas */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Métricas do Experimento</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Métrica
            </Button>
          </div>

          {Object.keys(metricasAgrupadas).length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Métrica</TableHead>
                      <TableHead className="text-center font-semibold">Baseline</TableHead>
                      <TableHead className="text-center font-semibold">Esperado</TableHead>
                      <TableHead className="text-center font-semibold">Realizado</TableHead>
                      <TableHead className="text-center font-semibold">Resultado vs. Baseline (%)</TableHead>
                      <TableHead className="text-center font-semibold">Resultado vs. Esperado (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(metricasAgrupadas).map(([nomeMetrica, metrica]) => {
                      const variationBaseline = getVariationDisplay(metrica.realizada, metrica.baseline);
                      const variationEsperada = getVariationDisplay(metrica.realizada, metrica.esperada);
                      
                      return (
                        <TableRow key={nomeMetrica}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{metrica.nome}</div>
                              {metrica.unidade && (
                                <div className="text-sm text-muted-foreground">({metrica.unidade})</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {formatNumber(metrica.baseline)}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatNumber(metrica.esperada)}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {formatNumber(metrica.realizada)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className={`flex items-center justify-center gap-1 ${variationBaseline.color}`}>
                              {variationBaseline.icon && (
                                <variationBaseline.icon className="h-3 w-3" />
                              )}
                              <span className="font-medium">{variationBaseline.text}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className={`flex items-center justify-center gap-1 ${variationEsperada.color}`}>
                              {variationEsperada.icon && (
                                <variationEsperada.icon className="h-3 w-3" />
                              )}
                              <span className="font-medium">{variationEsperada.text}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma métrica definida para este experimento</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Resultados */}
        <TabsContent value="results" className="space-y-6">
          {experimento.resultado ? (
            <div key={experimento.resultado.id} className="space-y-6">
              {/* Status de Sucesso */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {experimento.resultado.sucesso ? (
                      <CheckCircle className="h-6 w-6 text-accent" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive" />
                    )}
                    {experimento.resultado.sucesso ? 'Experimento Bem-sucedido' : 'Experimento Não Bem-sucedido'}
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* ROI */}
              {experimento.resultado.roi && (
                <Card>
                  <CardHeader>
                    <CardTitle>ROI (Retorno sobre Investimento)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-accent">
                      {experimento.resultado.roi.toFixed(2)}x
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Análise FCA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fatos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{experimento.resultado.fatos || 'Nenhum fato registrado'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Causas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{experimento.resultado.causas || 'Nenhuma causa registrada'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{experimento.resultado.acoes || 'Nenhuma ação registrada'}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Aprendizados */}
              <Card>
                <CardHeader>
                  <CardTitle>Aprendizados Principais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">
                    {experimento.resultado.aprendizados || 'Nenhum aprendizado registrado'}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum resultado disponível para este experimento</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Anexos */}
        <TabsContent value="attachments" className="space-y-6">
          <FileUpload 
            experimentoId={id!}
            anexos={anexos}
            onAnexosChange={setAnexos}
          />
        </TabsContent>

        {/* Aba Comentários */}
        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comentários e Notas ({comentarios.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulário para novo comentário */}
              {user && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Adicionar comentário..."
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={async () => {
                            await adicionarComentario(novoComentario);
                            setNovoComentario("");
                          }}
                          disabled={!novoComentario.trim()}
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Comentar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de comentários */}
              {loadingComentarios ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comentarios.length > 0 ? (
                <div className="space-y-4 mt-6">
                  {comentarios.map((comentario) => (
                    <ComentarioItem
                      key={comentario.id}
                      comentario={comentario}
                      user={user}
                      editingId={editingId}
                      editingText={editingText}
                      setEditingId={setEditingId}
                      setEditingText={setEditingText}
                      editarComentario={editarComentario}
                      excluirComentario={excluirComentario}
                      onEditClick={(comentario) => {
                        setEditingId(comentario.id);
                        setEditingText(comentario.texto);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum comentário ainda.</p>
                  <p className="text-sm">Seja o primeiro a comentar!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Exclusão */}
      {experimento && (
        <DeleteExperimentDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          experimentoId={experimento.id}
          experimentoNome={experimento.nome}
        />
      )}
    </div>
  );
};

export default ExperimentDetails;