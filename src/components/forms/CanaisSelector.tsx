import { useState } from "react";
import { Control } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getChannelsByCategory, CATEGORIAS_CANAIS } from "@/constants/canais";
import { cn } from "@/lib/utils";

interface CanaisSelectorProps {
  control: Control<any>;
}

export function CanaisSelector({ control }: CanaisSelectorProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const canaisPorCategoria = getChannelsByCategory();

  const toggleCategory = (categoria: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  return (
    <FormField
      control={control}
      name="canais"
      render={() => (
        <FormItem>
          <div className="space-y-3">
            {Object.entries(canaisPorCategoria).map(([categoria, canais]) => (
              <Collapsible
                key={categoria}
                open={openCategories[categoria]}
                onOpenChange={() => toggleCategory(categoria)}
                className="border rounded-lg"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <span>{categoria}</span>
                      <Badge variant="secondary" className="text-xs">
                        {canais.length}
                      </Badge>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        openCategories[categoria] && "rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3">
                  <div className="grid gap-2 pt-2">
                    {canais.map((canal) => (
                      <FormField
                        key={canal.value}
                        control={control}
                        name="canais"
                        render={({ field }) => {
                          const IconComponent = canal.icon;
                          return (
                            <FormItem
                              key={canal.value}
                              className="flex flex-row items-center space-x-3 space-y-0 py-1"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(canal.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, canal.value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value: string) => value !== canal.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-muted-foreground" />
                                <FormLabel className="font-normal text-sm">
                                  {canal.label}
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