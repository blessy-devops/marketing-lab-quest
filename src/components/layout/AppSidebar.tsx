import { 
  BarChart3, 
  Beaker, 
  Home, 
  Plus, 
  Trophy,
  FileText
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Experimentos", url: "/experimentos", icon: Beaker },
  { title: "Novo Experimento", url: "/experimentos/novo", icon: Plus },
];

const analyticsItems = [
  { title: "Galeria de Sucessos", url: "/galeria", icon: Trophy },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors";

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-64"} border-r border-sidebar-border bg-sidebar-background`}
      collapsible="icon"
    >
      <SidebarContent className="px-3 py-4">
        {/* Logo Section */}
        <div className="mb-6 px-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <img 
                src="/src/assets/blessy-logo.png" 
                alt="Blessy" 
                className="w-8 h-8 rounded-lg"
              />
              <div>
                <h1 className="font-bold text-sm text-sidebar-foreground">Blessy</h1>
                <p className="text-xs text-sidebar-foreground/70">Marketing Lab</p>
              </div>
            </div>
          ) : (
            <img 
              src="/src/assets/blessy-logo.png" 
              alt="Blessy" 
              className="w-8 h-8 rounded-lg mx-auto"
            />
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className={getNavCls}
                    >
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics Navigation */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                    >
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}