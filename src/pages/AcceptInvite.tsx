import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, UserPlus, Mail, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedWrapper } from "@/components/ui/animated-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInvites, type Invite } from "@/hooks/useInvites";
import { useAuth } from "@/hooks/useAuth";

interface AcceptInviteData {
  nome_completo: string;
  password: string;
  confirmPassword: string;
  departamento?: string;
}

const AcceptInvite = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const { loading, getInviteByToken, acceptInvite } = useInvites();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AcceptInviteData>();

  const watchedDepartamento = watch("departamento");

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Load invite data
  useEffect(() => {
    const loadInvite = async () => {
      if (!token) {
        setError("Token de convite não encontrado na URL");
        return;
      }

      const { data, error } = await getInviteByToken(token);
      
      if (error || !data) {
        setError("Convite inválido, expirado ou já aceito");
        return;
      }

      setInvite(data);
      setError(null);
    };

    loadInvite();
  }, [token]); // Removido getInviteByToken das dependências para evitar loop

  const onSubmit = async (data: AcceptInviteData) => {
    if (!token) {
      setError("Token de convite não encontrado");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    const result = await acceptInvite(token, {
      nome_completo: data.nome_completo,
      password: data.password,
      departamento: data.departamento,
    });

    if (result.success) {
      // Wait a bit for the auth state to update, then redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  };

  if (loading && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Skeleton className="w-full max-w-md h-96" />
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <AnimatedWrapper>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl font-bold">Convite Inválido</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full"
                variant="outline"
              >
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        </AnimatedWrapper>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <AnimatedWrapper duration={0.4} delay={0.1}>
        <Card className="w-full max-w-2xl shadow-lg" style={{ minHeight: '500px' }}>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Aceitar Convite</CardTitle>
              <CardDescription>
                Você foi convidado para se juntar ao Marketing Lab
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {invite && (
              <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Email:</strong> {invite.email}
                  </span>
                </div>
                <div className="text-sm">
                  <strong>Função:</strong> {invite.role === 'admin' ? 'Administrador' : invite.role === 'editor' ? 'Editor' : 'Visualizador'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Convite expira em: {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  placeholder="Seu nome completo"
                  {...register("nome_completo", { 
                    required: "Nome completo é obrigatório",
                    minLength: {
                      value: 2,
                      message: "Nome deve ter pelo menos 2 caracteres"
                    }
                  })}
                />
                {errors.nome_completo && (
                  <p className="text-sm text-destructive">{errors.nome_completo.message}</p>
                )}
              </div>

              {/* Departamento */}
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select onValueChange={(value) => setValue("departamento", value)} value={watchedDepartamento}>
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

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    {...register("password", { 
                      required: "Senha é obrigatória",
                      minLength: {
                        value: 6,
                        message: "Senha deve ter pelo menos 6 caracteres"
                      }
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    {...register("confirmPassword", { 
                      required: "Confirmação de senha é obrigatória"
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/login")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Criando conta..." : "Aceitar Convite"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </AnimatedWrapper>
    </div>
  );
};

export default AcceptInvite;