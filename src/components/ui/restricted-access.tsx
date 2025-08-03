import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useUser, UserPermissions } from '@/contexts/UserContext';

interface RestrictedAccessProps {
  requiredPermission: keyof UserPermissions;
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

export const RestrictedAccess = ({ 
  requiredPermission, 
  title = "Acesso Restrito",
  description = "Você não tem permissão para acessar esta página.",
  showBackButton = true 
}: RestrictedAccessProps) => {
  const navigate = useNavigate();
  const { permissions, role } = useUser();

  // Se tem permissão, não renderiza nada
  if (permissions[requiredPermission]) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Seu nível de acesso atual: <strong className="capitalize">{role}</strong></p>
            <p>Permissão necessária: <strong>{String(requiredPermission)}</strong></p>
          </div>
          
          {showBackButton && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Ir para Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};