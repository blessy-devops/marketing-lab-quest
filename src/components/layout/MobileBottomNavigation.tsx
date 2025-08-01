import { Home, TestTube, BarChart3, Image, FileText } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/experimentos", icon: TestTube, label: "Experimentos" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/galeria", icon: Image, label: "Galeria" },
  { to: "/relatorios", icon: FileText, label: "Relatórios" },
];

export function MobileBottomNavigation() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border md:hidden">
      <nav className="flex justify-around items-center py-2 px-4">
        {navigationItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || 
            (to !== "/" && location.pathname.startsWith(to));
          
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200",
                "min-w-0 flex-1 max-w-[80px]",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-1 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium truncate",
                isActive && "font-semibold"
              )}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}