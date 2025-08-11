import React, { lazy, Suspense, useMemo, useState } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { LucideProps } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface IconPickerProps {
  value?: string | null;
  onChange: (name: string) => void;
  triggerLabel?: string;
}

const fallbackIcon = <div className="h-5 w-5 rounded bg-muted" />;

export function NamedIcon({ name, className, ...props }: { name: keyof typeof dynamicIconImports | string } & Omit<LucideProps, "ref">) {
  const key = (name as keyof typeof dynamicIconImports) || "circle";
  const LucideIcon = useMemo(() => lazy(dynamicIconImports[key as keyof typeof dynamicIconImports] || dynamicIconImports["circle"]), [key]);
  return (
    <Suspense fallback={fallbackIcon}>
      <LucideIcon className={className} {...props} />
    </Suspense>
  );
}

export function IconPicker({ value, onChange, triggerLabel = "Escolher ícone" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const allNames = useMemo(() => Object.keys(dynamicIconImports) as (keyof typeof dynamicIconImports)[], []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? allNames.filter((n) => n.includes(q))
      : allNames;
    return list.slice(0, 200); // limite por performance
  }, [allNames, query]);

  const handlePick = (name: string) => {
    onChange(name);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        {value ? (
          <div className="inline-flex items-center gap-2 rounded border px-2 py-1">
            <NamedIcon name={value} className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">{value}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded border px-2 py-1">
            <div className="h-4 w-4 rounded bg-muted" />
            <span className="text-xs text-muted-foreground">Sem ícone</span>
          </div>
        )}
        <DialogTrigger asChild>
          <Button variant="outline" type="button" size="sm">
            {triggerLabel}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Selecionar ícone</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Busque por nome (ex: mail, instagram, send)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <ScrollArea className="h-[420px] w-full rounded border">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 p-3">
              {filtered.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handlePick(name)}
                  className="group flex flex-col items-center justify-center gap-2 rounded-md border p-3 hover:bg-accent transition-colors"
                >
                  <NamedIcon name={name} className="h-6 w-6" />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground text-center truncate w-full">
                    {name}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
