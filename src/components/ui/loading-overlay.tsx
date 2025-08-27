import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  className?: string;
  children: React.ReactNode;
  blur?: boolean;
}

export function LoadingOverlay({ 
  isLoading, 
  className, 
  children, 
  blur = true 
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className={cn(
          "absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center",
          !blur && "backdrop-blur-none bg-background/80"
        )}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando...
          </div>
        </div>
      )}
    </div>
  );
}