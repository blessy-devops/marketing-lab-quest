import { Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RoleSelector } from "@/components/ui/role-selector";
import { useAuth } from "@/hooks/useAuth";

export function AppHeader() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8" />
        
        {/* Search */}
        <div className="relative w-96 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar experimentos..."
            className="pl-10 bg-muted/50 border-border/40"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Selector (Development) */}
        <RoleSelector />

        {/* Notifications */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'usuario@empresa.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}