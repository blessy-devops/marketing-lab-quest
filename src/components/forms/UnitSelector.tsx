import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export interface UnitSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const COMMON_UNITS: { value: string; label: string }[] = [
  { value: "%", label: "Percentual (%)" },
  { value: "R$", label: "Reais (R$)" },
  { value: "unid", label: "Unidades (unid.)" },
  { value: "leads", label: "Leads" },
  { value: "cliques", label: "Cliques" },
  { value: "visitas", label: "Visitas" },
  { value: "conversões", label: "Conversões" },
  { value: "vendas", label: "Vendas" },
  { value: "custo", label: "Custo" },
  { value: "receita", label: "Receita" },
  { value: "CAC", label: "CAC" },
  { value: "LTV", label: "LTV" },
  { value: "NPS", label: "NPS" },
  { value: "CSAT", label: "CSAT" },
  { value: "min", label: "Minutos (min)" },
  { value: "h", label: "Horas (h)" },
  { value: "dias", label: "Dias" },
];

export function UnitSelector({ value, onChange, disabled, placeholder = "Selecione", className }: UnitSelectorProps) {
  const isInList = React.useMemo(() => COMMON_UNITS.some(u => u.value === value), [value]);
  const [isCustom, setIsCustom] = React.useState(false);

  React.useEffect(() => {
    setIsCustom(!!value && !isInList);
  }, [value, isInList]);

  const selectValue = isCustom ? "custom" : (isInList ? value : undefined);

  return (
    <div className={className}>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          if (v === "custom") {
            setIsCustom(true);
            if (!value) onChange("");
          } else {
            setIsCustom(false);
            onChange(v);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {COMMON_UNITS.map((u) => (
            <SelectItem key={u.value} value={u.value}>
              {u.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Outro (personalizado)</SelectItem>
        </SelectContent>
      </Select>

      {isCustom && (
        <div className="mt-2">
          <Input
            placeholder="Digite a unidade"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
