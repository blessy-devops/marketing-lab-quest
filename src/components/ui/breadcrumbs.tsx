import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs if not provided
  const autoItems = React.useMemo(() => {
    if (items) return items;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      let label = segment;
      
      // Custom labels for known paths
      const pathLabels: Record<string, string> = {
        'experimentos': 'Experimentos',
        'novo': 'Novo Experimento',
        'editar': 'Editar',
        'analytics': 'Analytics',
        'relatorios': 'Relatórios',
        'galeria': 'Galeria',
        'admin': 'Administração',
        'tipos-experimento': 'Tipos de Experimento'
      };
      
      if (pathLabels[segment]) {
        label = pathLabels[segment];
      } else if (segment.length === 36) {
        // Looks like a UUID, try to get experiment name
        label = 'Detalhes';
      } else {
        // Capitalize first letter
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      breadcrumbItems.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast
      });
    });
    
    return breadcrumbItems;
  }, [location.pathname, items]);

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center space-x-1">
        {autoItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
            )}
            
            {index === 0 && (
              <Home className="h-4 w-4 mr-1" />
            )}
            
            {item.href && !item.current ? (
              <Link 
                to={item.href}
                className="hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(
                "font-medium",
                item.current ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Hook to set custom breadcrumbs
export function useBreadcrumbs(items: BreadcrumbItem[]) {
  React.useEffect(() => {
    // This could be enhanced to work with a context provider
    // For now, we'll just return the items for manual usage
  }, [items]);
  
  return items;
}