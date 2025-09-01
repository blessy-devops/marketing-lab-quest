import { 
  BarChart3, 
  Beaker, 
  Home, 
  Trophy,
  FileText,
  Settings,
  Users,
  LogOut,
  Brain,
  BookOpen
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
  { title: "Oráculo", url: "/oraculo", icon: Brain },
  { title: "Playbooks", url: "/playbooks", icon: BookOpen },
];

const analyticsItems = [
  { title: "Galeria de Sucessos", url: "/galeria", icon: Trophy },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";
  const isNewExperimentPage = currentPath === "/experimentos/novo";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors";

  return (
    <Sidebar variant="inset" collapsible={isNewExperimentPage ? "offcanvas" : "icon"}>
      <SidebarContent className="p-3 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
        {/* Logo Section */}
        <div className="mb-6 flex items-center justify-center group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2 w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
            <img 
              src="/src/assets/blessy-logo.png" 
              alt="Blessy" 
              className="w-8 h-8 rounded-lg flex-shrink-0 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6"
            />
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-sm text-sidebar-foreground">Blessy</h1>
                <p className="text-xs text-sidebar-foreground/70">Growth Lab</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only">
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
          <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only">
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

        {/* Admin Navigation */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only">
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/tipos-experimento" className={getNavCls}>
                    <Settings className="w-4 h-4" />
                    {!isCollapsed && <span>Tipos de Experimento</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/canais" className={getNavCls}>
                    <Settings className="w-4 h-4" />
                    {!isCollapsed && <span>Canais & Subcanais</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}