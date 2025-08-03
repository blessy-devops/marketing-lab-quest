import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUser, UserRole } from '@/contexts/UserContext';
import { Shield, Edit, Eye } from 'lucide-react';

const roleConfig = {
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'destructive' as const,
    description: 'Acesso total'
  },
  editor: {
    label: 'Editor',
    icon: Edit,
    color: 'default' as const,
    description: 'Criar e editar'
  },
  viewer: {
    label: 'Viewer',
    icon: Eye,
    color: 'secondary' as const,
    description: 'Apenas visualizar'
  }
};

export const RoleSelector = () => {
  const { role, setRole } = useUser();

  // Só mostra em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const currentConfig = roleConfig[role];
  const Icon = currentConfig.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={currentConfig.color} className="gap-1">
        <Icon className="w-3 h-3" />
        {currentConfig.label}
      </Badge>
      
      <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(roleConfig).map(([key, config]) => {
            const RoleIcon = config.icon;
            return (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <RoleIcon className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{config.label}</div>
                    <div className="text-xs text-muted-foreground">{config.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};