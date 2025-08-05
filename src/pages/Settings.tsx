import { ArrowLeft, Moon, Sun, Monitor, Bell, Shield, User, Settings as SettingsIcon, Users, Camera, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit3 } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { userRole, user, profile, updateProfile } = useAuth();
  
  // Estados para o formulário de perfil
  const [profileData, setProfileData] = useState({
    nome_completo: profile?.nome_completo || '',
    cargo: profile?.cargo || '',
    departamento: profile?.departamento as "Marketing" | "Comercial" | "Produto" | "Tech" | undefined
  });

  // Estados para o formulário de convite
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'viewer' as 'viewer' | 'editor' | 'admin',
    departamento: '' as 'Marketing' | 'Comercial' | 'Produto' | 'Tech' | ''
  });

  // Estados para o modal de convite
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Estados para gerenciamento de usuários
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'default';
      case 'viewer':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Visualizador';
      default:
        return 'Não definido';
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const { error } = await updateProfile(profileData);
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o perfil.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar perfil.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateInvite = async () => {
    if (!inviteData.email || !inviteData.departamento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingInvite(true);
    
    try {
      const { data, error } = await supabase
        .from('convites')
        .insert({
          email: inviteData.email,
          role: inviteData.role,
          enviado_por: user?.id,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível gerar o convite.",
          variant: "destructive",
        });
        return;
      }

      const inviteLink = `${window.location.origin}/convite?token=${data.token}`;
      setGeneratedLink(inviteLink);
      setInviteEmail(inviteData.email);
      setShowInviteModal(true);

      // Limpar formulário
      setInviteData({
        email: '',
        role: 'viewer',
        departamento: ''
      });

      toast({
        title: "Convite gerado",
        description: "Link de convite criado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao gerar convite.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      toast({
        title: "Link copiado!",
        description: "Link de convite copiado para a área de transferência.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  // Função para buscar usuários
  const loadUsers = async () => {
    if (userRole !== 'admin') return;
    
    setIsLoadingUsers(true);
    try {
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .eq('ativo', true)
        .order('nome_completo');

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários.",
          variant: "destructive",
        });
        return;
      }

      console.log('Usuários carregados:', usersData);
      setUsers(usersData || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Função para atualizar role do usuário
  const updateUserRole = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o papel do usuário.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, user_roles: { role: newRole } }
          : user
      ));

      toast({
        title: "Sucesso",
        description: "Papel do usuário atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar papel do usuário.",
        variant: "destructive",
      });
    }
  };

  // Função para desativar usuário
  const deactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ativo: false })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível desativar o usuário.",
          variant: "destructive",
        });
        return;
      }

      // Remover da lista local
      setUsers(prev => prev.filter(user => user.user_id !== userId));

      toast({
        title: "Sucesso",
        description: "Usuário desativado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao desativar usuário.",
        variant: "destructive",
      });
    }
  };

  // Carregar usuários quando for admin
  useEffect(() => {
    if (userRole === 'admin') {
      loadUsers();
    }
  }, [userRole]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências do sistema
          </p>
        </div>
      </div>

      {/* Sistema de Abas */}
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Meu Perfil
          </TabsTrigger>
          <TabsTrigger value="preferencias" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        {/* Aba Meu Perfil */}
        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload de Foto */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-lg">
                    {profile?.nome_completo?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Alterar Foto
                </Button>
              </div>

              {/* Campos do Formulário */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={profileData.nome_completo}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      nome_completo: e.target.value
                    }))}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={profileData.cargo}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      cargo: e.target.value
                    }))}
                    placeholder="Seu cargo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select
                    value={profileData.departamento || ""}
                    onValueChange={(value) => setProfileData(prev => ({
                      ...prev,
                      departamento: value as "Marketing" | "Comercial" | "Produto" | "Tech"
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Comercial">Comercial</SelectItem>
                      <SelectItem value="Produto">Produto</SelectItem>
                      <SelectItem value="Tech">Tech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleProfileUpdate} className="w-full">
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Preferências */}
        <TabsContent value="preferencias" className="space-y-6">
          {/* Aparência */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {getThemeIcon()}
                </div>
                <div>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription>
                    Personalize a aparência da aplicação
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Tema</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Claro
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Escuro
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>
                    Configure suas preferências de notificação
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações de experimentos</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre novos experimentos e atualizações
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações de resultados</Label>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado quando experimentos tiverem resultados
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resumos semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um resumo semanal das suas atividades
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Usuários */}
        <TabsContent value="usuarios" className="space-y-6">
          {userRole !== 'admin' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sem permissão para editar usuários</p>
                  <p className="text-sm mt-1">Apenas administradores podem gerenciar usuários</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conta e Permissões */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Conta e Permissões</CardTitle>
                  <CardDescription>
                    Informações sobre sua conta e nível de acesso
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nível de acesso atual</Label>
                  <p className="text-sm text-muted-foreground">
                    Determina quais funcionalidades você pode acessar
                  </p>
                </div>
                <Badge variant={getRoleColor(userRole || '')} className="capitalize">
                  {getRoleLabel(userRole || '')}
                </Badge>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Para alterar suas permissões, entre em contato com um administrador do sistema.
                </p>
              </div>
            </CardContent>
          </Card>

          {userRole === 'admin' && (
            <>
              {/* Lista de Usuários */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Usuários do Sistema</CardTitle>
                      <CardDescription>
                        Gerencie os usuários e suas permissões
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum usuário encontrado</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead>Papel</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar_url || ''} />
                                  <AvatarFallback>
                                    {user.nome_completo?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.nome_completo}</p>
                                  <p className="text-sm text-muted-foreground">{user.cargo}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.departamento && (
                                <Badge variant="outline">{user.departamento}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant={getRoleColor(user.user_roles?.role)}>
                                  {getRoleLabel(user.user_roles?.role)}
                                </Badge>
                                {editingUser?.id === user.id ? (
                                  <Select
                                    value={user.user_roles?.role}
                                    onValueChange={(newRole: 'admin' | 'editor' | 'viewer') => {
                                      updateUserRole(user.user_id, newRole);
                                      setEditingUser(null);
                                    }}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="viewer">Visualizador</SelectItem>
                                      <SelectItem value="editor">Editor</SelectItem>
                                      <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {user.user_id !== profile?.user_id && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setEditingUser(user)}
                                      className="h-8 w-8"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deactivateUser(user.user_id)}
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Convidar Novo Membro */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Send className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Convidar Novo Membro</CardTitle>
                      <CardDescription>
                        Envie convites para novos usuários ingressarem no sistema
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Nível de acesso</Label>
                    <Select
                      value={inviteData.role}
                      onValueChange={(value) => setInviteData(prev => ({
                        ...prev,
                        role: value as 'viewer' | 'editor' | 'admin'
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-departamento">Departamento</Label>
                    <Select
                      value={inviteData.departamento}
                      onValueChange={(value) => setInviteData(prev => ({
                        ...prev,
                        departamento: value as 'Marketing' | 'Comercial' | 'Produto' | 'Tech'
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                        <SelectItem value="Produto">Produto</SelectItem>
                        <SelectItem value="Tech">Tech</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateInvite}
                  disabled={isGeneratingInvite}
                  className="w-full flex items-center gap-2"
                >
                  {isGeneratingInvite ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Gerar Link de Convite
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Link de Convite */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Link de Convite Gerado</DialogTitle>
            <DialogDescription>
              Envie este link para <strong>{inviteEmail}</strong>. O convite expira em 7 dias.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Link de convite:</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-sm"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  {linkCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                className="flex-1 flex items-center gap-2"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Link Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar Link
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowInviteModal(false)}
                variant="outline"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}