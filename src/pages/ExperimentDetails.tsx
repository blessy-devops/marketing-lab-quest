import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Copy, Trash2, Plus, Upload, FileText, Image, Link, Calendar, User, Target, TrendingUp, CheckCircle, XCircle, MessageSquare, History, Send, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestrictedButton } from "@/components/ui/restricted-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type Metrica = Tables<"metricas">;

const ExperimentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { data: experimentos, loading, error } = useExperimentosComResultados();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [editingText, setEditingText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
        }
      };
      fetchMetricas();
    }
  }, [experimento?.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
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

  return (
    <div className="container mx-auto py-6 space-y-6">
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="results" disabled={experimento.status !== 'concluido'}>
            Resultados
          </TabsTrigger>
          <TabsTrigger value="attachments">Anexos</TabsTrigger>
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

          {metricas && metricas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metricas.map((metrica) => (
                <Card key={metrica.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {metrica.nome}
                      <Badge variant={metrica.tipo === 'esperada' ? 'secondary' : 'default'}>
                        {metrica.tipo}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {metrica.valor?.toFixed(2)} {metrica.unidade}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-4">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: metrica.tipo === 'esperada' ? '50%' : '80%' 
                        }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Anexos do Experimento</h3>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Arquivo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Área de upload */}
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Arraste arquivos aqui ou clique para selecionar</p>
                <Button variant="outline" className="mt-4">
                  Selecionar Arquivos
                </Button>
              </CardContent>
            </Card>

            {/* Exemplo de anexos */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3 mb-3">
                  <Image className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">screenshot_campanha.png</p>
                    <p className="text-sm text-muted-foreground">2.1 MB</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Visualizar</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">relatorio_metricas.pdf</p>
                    <p className="text-sm text-muted-foreground">1.8 MB</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Download</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Seção de Comentários */}
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

      {/* Histórico de Alterações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Alterações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>João Silva</strong> atualizou o status para "Concluído"
                </p>
                <p className="text-xs text-muted-foreground">16 de julho, 2024 - 14:30</p>
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
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>Maria Santos</strong> adicionou métricas realizadas
                </p>
                <p className="text-xs text-muted-foreground">16 de julho, 2024 - 10:15</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">
                  <strong>João Silva</strong> criou o experimento
                </p>
                <p className="text-xs text-muted-foreground">15 de julho, 2024 - 09:00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExperimentDetails;