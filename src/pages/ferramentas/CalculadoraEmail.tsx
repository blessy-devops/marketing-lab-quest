import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FormState = {
  envios: number;
  taxaEntrega: number;
  openRate: number;
  ctor: number;
  taxaConversao: number;
  ticketMedio: number;
};

export default function CalculadoraEmail() {
  const [form, setForm] = React.useState<FormState>({
    envios: 0,
    taxaEntrega: 98,
    openRate: 20,
    ctor: 10,
    taxaConversao: 2,
    ticketMedio: 150,
  });

  const handleNumberChange =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const value = raw === "" ? 0 : Number(raw);
      setForm((prev) => ({ ...prev, [key]: isNaN(value) ? 0 : value }));
    };

  const { emailsEntregues, emailsAbertos, totalCliques, totalVendas, receitaEstimada } =
    React.useMemo(() => {
      const emailsEntregues = form.envios * (form.taxaEntrega / 100);
      const emailsAbertos = emailsEntregues * (form.openRate / 100);
      const totalCliques = emailsAbertos * (form.ctor / 100);
      const totalVendas = totalCliques * (form.taxaConversao / 100);
      const receitaEstimada = totalVendas * form.ticketMedio;

      return { emailsEntregues, emailsAbertos, totalCliques, totalVendas, receitaEstimada };
    }, [form]);

  const fmtNumber = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  });
  const fmtCurrency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Calculadora de Receita de E-mail Marketing</h1>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Inputs */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="envios">Envios</Label>
            <Input
              id="envios"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={form.envios}
              onChange={handleNumberChange("envios")}
              placeholder="Ex.: 10000"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="taxaEntrega">Tx. Entrega (%)</Label>
            <Input
              id="taxaEntrega"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              value={form.taxaEntrega}
              onChange={handleNumberChange("taxaEntrega")}
              placeholder="Ex.: 98"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="openRate">Open Rate (%)</Label>
            <Input
              id="openRate"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              value={form.openRate}
              onChange={handleNumberChange("openRate")}
              placeholder="Ex.: 20"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ctor">CTOR (%)</Label>
            <Input
              id="ctor"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              value={form.ctor}
              onChange={handleNumberChange("ctor")}
              placeholder="Ex.: 10"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="taxaConversao">Tx. Conversão (%)</Label>
            <Input
              id="taxaConversao"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              value={form.taxaConversao}
              onChange={handleNumberChange("taxaConversao")}
              placeholder="Ex.: 2"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="ticketMedio">Ticket Médio (R$)</Label>
            <Input
              id="ticketMedio"
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={form.ticketMedio}
              onChange={handleNumberChange("ticketMedio")}
              placeholder="Ex.: 150"
            />
          </div>
        </div>

        {/* Coluna Direita - Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Emails entregues</span>
                <span className="font-medium">{fmtNumber.format(Math.round(emailsEntregues))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Emails abertos</span>
                <span className="font-medium">{fmtNumber.format(Math.round(emailsAbertos))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de cliques</span>
                <span className="font-medium">{fmtNumber.format(Math.round(totalCliques))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de vendas</span>
                <span className="font-medium">{fmtNumber.format(Math.round(totalVendas))}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Receita estimada</span>
                <span className="font-semibold">{fmtCurrency.format(receitaEstimada)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}