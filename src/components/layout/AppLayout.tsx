import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { useNotificationGenerator } from "@/hooks/useNotificationGenerator";
import { useGlobalShortcuts } from "@/hooks/useKeyboardShortcuts";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Inicializar sistema de notificações
  useNotificationGenerator();
  
  // Inicializar atalhos globais de teclado
  useGlobalShortcuts();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/30">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          <div className="hidden md:block">
            <AppHeader />
          </div>
          
          {/* Mobile Header */}
          <MobileHeader />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 pb-20 md:pb-6">
              {children}
            </div>
          </main>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNavigation />
      </div>
    </SidebarProvider>
  );
}