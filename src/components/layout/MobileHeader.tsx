import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AppSidebar } from "./AppSidebar";

interface MobileHeaderProps {
  onSearchToggle?: () => void;
  showSearch?: boolean;
}

export function MobileHeader({ onSearchToggle, showSearch }: MobileHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    onSearchToggle?.();
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-sm px-4 md:hidden">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <AppSidebar />
            </SheetContent>
          </Sheet>
          
          <h1 className="text-lg font-semibold">Marketing Lab</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleSearchToggle}
          >
            {isSearchOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isSearchOpen ? "Fechar busca" : "Abrir busca"}
            </span>
          </Button>
          
          <ThemeToggle />
          <NotificationDropdown />
        </div>
      </header>

      {/* Search Bar Expandido */}
      {isSearchOpen && (
        <div className="bg-background border-b border-border/40 p-4 md:hidden animate-slide-in-right">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar experimentos, resultados..."
              className="pl-10 bg-muted/50 border-border/40"
              autoFocus
            />
          </div>
        </div>
      )}
    </>
  );
}