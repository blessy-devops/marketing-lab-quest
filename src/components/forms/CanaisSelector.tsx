import { useMemo, useState } from "react";
import { Control } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getChannelsByCategory } from "@/constants/canais";
import { cn } from "@/lib/utils";
import { useCanaisComSubcanais } from "@/hooks/useCanais";
import { 
  ShoppingCart, Package, Users, UserCheck, DollarSign, Heart, Instagram, Mail, Facebook, 
  Search, Headphones, Briefcase, MessageCircle, Phone, Video, Globe, Store, Building 
} from "lucide-react";

interface CanaisSelectorProps {
  control: Control<any>;
}

const iconMap: Record<string, any> = {
  ShoppingCart,
  Package,
  Users,
  UserCheck,
  DollarSign,
  Heart,
  Instagram,
  Mail,
  Facebook,
  Search,
  Headphones,
  Briefcase,
  MessageCircle,
  Phone,
  Video,
  Globe,
  Store,
  Building,
};

const getIcon = (name?: string | null) => {
  if (!name) return Globe;
  return iconMap[name] || Globe;
};

export function CanaisSelector({ control }: CanaisSelectorProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const { data: categoriasDB, isLoading, error } = useCanaisComSubcanais();

  // Fallback para constantes se DB falhar ou não houver dados
  const categorias = useMemo(() => {
    if (isLoading || error || !categoriasDB || categoriasDB.length === 0) {
      const grouped = getChannelsByCategory();
      return Object.entries(grouped).map(([nome, itens]) => ({
        id: nome,
        nome,
        icone: null,
        ordem: 0,
        ativo: true,
        subcanais: itens.map((i) => ({ id: i.value, canal_id: nome, nome: i.label, icone: null, ordem: 0, ativo: true }))
      }));
    }
    return categoriasDB;
  }, [categoriasDB, isLoading, error]);

  const toggleCategory = (categoriaId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoriaId]: !prev[categoriaId]
    }));
  };

  return (
    <FormField
      control={control}
      name="canais"
      render={() => (
        <FormItem>
          <div className="space-y-3">
            {categorias.map((categoria) => (
              <Collapsible
                key={categoria.id}
                open={openCategories[categoria.id]}
                onOpenChange={() => toggleCategory(categoria.id)}
                className="border rounded-lg"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <span>{categoria.nome}</span>
                      <Badge variant="secondary" className="text-xs">
                        {categoria.subcanais.length}
                      </Badge>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        openCategories[categoria.id] && "rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <div className="grid gap-2 pt-2">
                    {categoria.subcanais.map((canal) => (
                      <FormField
                        key={canal.id}
                        control={control}
                        name="canais"
                        render={({ field }) => {
                          const IconComponent = getIcon(canal.icone);
                          return (
                            <FormItem
                              key={canal.id}
                              className="flex flex-row items-center space-x-3 space-y-0 py-1"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(canal.nome)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), canal.nome])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value: string) => value !== canal.nome
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-muted-foreground" />
                                <FormLabel className="font-normal text-sm">
                                  {canal.nome}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
