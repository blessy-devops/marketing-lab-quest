import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { TopProgressBar } from "@/components/ui/top-progress-bar";
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
    <SidebarProvider 
      defaultOpen={true}
      open={undefined}
      onOpenChange={undefined}
    >
      <TopProgressBar />
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/30">
        {/* Sidebar - direct sibling */}
        <AppSidebar />
        
        {/* Main content area with proper inset */}
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            {/* Desktop Header */}
            <div className="hidden md:block">
              <AppHeader />
            </div>
            
            {/* Mobile Header */}
            <MobileHeader />
            
            <main className="flex-1 min-h-0">
              {children}
            </main>
            
            {/* Mobile Bottom Navigation */}
            <MobileBottomNavigation />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}