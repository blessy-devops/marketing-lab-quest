import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageTypes: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
}

interface UserContextType {
  role: UserRole;
  permissions: UserPermissions;
  setRole: (role: UserRole) => void; // Para desenvolvimento
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getPermissionsByRole = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'admin':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManageTypes: true,
        canViewAnalytics: true,
        canManageUsers: true,
      };
    case 'editor':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canManageTypes: false,
        canViewAnalytics: true,
        canManageUsers: false,
      };
    case 'viewer':
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManageTypes: false,
        canViewAnalytics: true,
        canManageUsers: false,
      };
    default:
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManageTypes: false,
        canViewAnalytics: false,
        canManageUsers: false,
      };
  }
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { userRole } = useAuth();
  const [devRole, setDevRole] = React.useState<UserRole | null>(null);
  
  // Em desenvolvimento, permite sobrescrever o role
  const currentRole = devRole || (userRole as UserRole) || 'viewer';
  const permissions = getPermissionsByRole(currentRole);

  const setRole = (role: UserRole) => {
    if (process.env.NODE_ENV === 'development') {
      setDevRole(role);
    }
  };

  return (
    <UserContext.Provider value={{ role: currentRole, permissions, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};