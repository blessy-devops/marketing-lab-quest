import { Suspense, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Save, Trash2, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { IconPicker, NamedIcon } from "@/components/ui/icon-picker";

interface Canal {
  id: string;
  nome: string;
  icone: string | null;
  ordem: number;
  ativo: boolean;
}

interface Subcanal {
  id: string;
  canal_id: string;
  nome: string;
  icone: string | null;
  ordem: number;
  ativo: boolean; // subcanais table doesn't define 'ativo' in schema; we'll infer as true by absence, handle optional
}

export default function GestaoCanais() {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [canais, setCanais] = useState<Canal[]>([]);
  const [subcanais, setSubcanais] = useState<Subcanal[]>([]);

  // Form states for new canal
  const [novoCanal, setNovoCanal] = useState({ nome: "", icone: "", ordem: 0, ativo: true });

  // Form states for new subcanal per canal
  const [novosSubcanais, setNovosSubcanais] = useState<Record<string, { nome: string; icone: string; ordem: number }>>({});

  const groupedSubcanais = useMemo(() => {
    const map: Record<string, Subcanal[]> = {};
    subcanais.forEach((s) => {
      if (!map[s.canal_id]) map[s.canal_id] = [];
      map[s.canal_id].push(s);
    });
    // sort by ordem then nome
    Object.keys(map).forEach((k) => map[k].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.nome.localeCompare(b.nome)));
    return map;
  }, [subcanais]);

  useEffect(() => {
    document.title = "Admin: Gestão de Canais | Blessy";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Administração de canais e subcanais: crie, edite e organize seus canais de marketing");
  }, []);

  const carregar = async () => {
    setLoading(true);
    try {
      const [{ data: canaisData, error: canaisErr }, { data: subData, error: subErr }] = await Promise.all([
        supabase.from("canais").select("id, nome, icone, ordem, ativo").order("ordem", { ascending: true }),
        supabase.from("subcanais").select("id, canal_id, nome, icone, ordem").order("ordem", { ascending: true }),
      ]);
      if (canaisErr) throw canaisErr;
      if (subErr) throw subErr;
      setCanais((canaisData || []) as Canal[]);
      setSubcanais((subData || []) as Subcanal[]);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar canais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  if (!hasRole("admin")) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso restrito</CardTitle>
            <CardDescription>Somente administradores podem acessar a gestão de canais.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const adicionarCanal = async () => {
    if (!novoCanal.nome.trim()) {
      toast.error("Informe o nome do canal");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("canais").insert({
        nome: novoCanal.nome.trim(),
        icone: novoCanal.icone || null,
        ordem: Number(novoCanal.ordem) || 0,
        ativo: novoCanal.ativo,
      });
      if (error) throw error;
      toast.success("Canal criado com sucesso");
      setNovoCanal({ nome: "", icone: "", ordem: 0, ativo: true });
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao criar canal");
    } finally {
      setLoading(false);
    }
  };

  const atualizarCanal = async (canal: Canal) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("canais")
        .update({ nome: canal.nome, icone: canal.icone, ordem: canal.ordem, ativo: canal.ativo })
        .eq("id", canal.id);
      if (error) throw error;
      toast.success("Canal atualizado");
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar canal");
    } finally {
      setLoading(false);
    }
  };

  const removerCanal = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este canal? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("canais").delete().eq("id", id);
      if (error) throw error;
      toast.success("Canal removido");
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover canal");
    } finally {
      setLoading(false);
    }
  };

  const adicionarSubcanal = async (canalId: string) => {
    const form = novosSubcanais[canalId] || { nome: "", icone: "", ordem: 0 };
    if (!form.nome.trim()) {
      toast.error("Informe o nome do subcanal");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("subcanais").insert({
        canal_id: canalId,
        nome: form.nome.trim(),
        icone: form.icone || null,
        ordem: Number(form.ordem) || 0,
      });
      if (error) throw error;
      toast.success("Subcanal criado");
      setNovosSubcanais((old) => ({ ...old, [canalId]: { nome: "", icone: "", ordem: 0 } }));
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao criar subcanal");
    } finally {
      setLoading(false);
    }
  };

  const atualizarSubcanal = async (sub: Subcanal) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("subcanais")
        .update({ nome: sub.nome, icone: sub.icone, ordem: sub.ordem })
        .eq("id", sub.id);
      if (error) throw error;
      toast.success("Subcanal atualizado");
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar subcanal");
    } finally {
      setLoading(false);
    }
  };

  const removerSubcanal = async (id: string) => {
    if (!confirm("Remover este subcanal?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("subcanais").delete().eq("id", id);
      if (error) throw error;
      toast.success("Subcanal removido");
      await carregar();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover subcanal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Canais</h1>
          <p className="text-muted-foreground">Crie, edite e organize seus canais e subcanais</p>
        </div>
        <Button variant="outline" onClick={carregar} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Canais</CardTitle>
          <CardDescription>Estruture seus canais principais de aquisição</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Novo Canal */}
          <div className="grid gap-3 md:grid-cols-5 items-end">
            <div className="md:col-span-2">
              <Label>Nome</Label>
              <Input placeholder="Ex: Email, Social, SEO" value={novoCanal.nome} onChange={(e) => setNovoCanal({ ...novoCanal, nome: e.target.value })} />
            </div>
            <div>
              <Label>Ícone</Label>
              <IconPicker
                value={novoCanal.icone || ""}
                onChange={(name) => setNovoCanal({ ...novoCanal, icone: name })}
                triggerLabel="Escolher ícone"
              />
            </div>
            <div>
              <Label>Ordem</Label>
              <Input type="number" value={novoCanal.ordem} onChange={(e) => setNovoCanal({ ...novoCanal, ordem: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={novoCanal.ativo} onCheckedChange={(v) => setNovoCanal({ ...novoCanal, ativo: v })} />
                <span className="text-sm text-muted-foreground">Ativo</span>
              </div>
              <Button onClick={adicionarCanal} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar Canal
              </Button>
            </div>
          </div>

          <Separator />

          {/* Lista de canais */}
          <Accordion type="multiple" className="space-y-2">
            {canais.map((canal) => (
              <AccordionItem key={canal.id} value={canal.id} className="rounded-lg border">
                <AccordionTrigger className="px-4 py-3">
                  <div className="flex items-center gap-3 text-left">
                    {canal.icone ? (
                      <NamedIcon name={canal.icone} className="h-5 w-5" />
                    ) : (
                      <div className="h-5 w-5 rounded bg-muted" />
                    )}
                    <span className="text-base font-medium truncate">{canal.nome || "Sem nome"}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid gap-3 md:grid-cols-6 md:items-end">
                    <div className="md:col-span-2">
                      <Label>Nome</Label>
                      <Input value={canal.nome} onChange={(e) => setCanais((prev) => prev.map((c) => (c.id === canal.id ? { ...c, nome: e.target.value } : c)))} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Ícone</Label>
                      <IconPicker
                        value={canal.icone || ""}
                        onChange={(name) => setCanais((prev) => prev.map((c) => (c.id === canal.id ? { ...c, icone: name } : c)))}
                        triggerLabel="Escolher ícone"
                      />
                    </div>
                    <div>
                      <Label>Ordem</Label>
                      <Input type="number" value={canal.ordem ?? 0} onChange={(e) => setCanais((prev) => prev.map((c) => (c.id === canal.id ? { ...c, ordem: Number(e.target.value) } : c)))} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={canal.ativo} onCheckedChange={(v) => setCanais((prev) => prev.map((c) => (c.id === canal.id ? { ...c, ativo: v } : c)))} />
                      <span className="text-sm">Ativo</span>
                    </div>
                    <div className="md:col-span-6 flex flex-wrap gap-2 justify-end md:justify-start mt-2">
                      <Button variant="outline" onClick={() => atualizarCanal(canal)} disabled={loading}>
                        <Save className="w-4 h-4 mr-2" /> Salvar
                      </Button>
                      <Button variant="destructive" onClick={() => removerCanal(canal.id)} disabled={loading}>
                        <Trash2 className="w-4 h-4 mr-2" /> Remover
                      </Button>
                    </div>
                  </div>

                  {/* Subcanais do canal */}
                  <div className="mt-6 space-y-4">
                    <div className="text-sm text-muted-foreground">Subcanais</div>

                    {/* Form novo subcanal */}
                    <div className="grid gap-3 md:grid-cols-5 items-end">
                      <div className="md:col-span-2">
                        <Label>Nome</Label>
                        <Input
                          placeholder="Ex: Newsletter, Promoções"
                          value={novosSubcanais[canal.id]?.nome || ""}
                          onChange={(e) => setNovosSubcanais((old) => ({ ...old, [canal.id]: { ...(old[canal.id] || { nome: "", icone: "", ordem: 0 }), nome: e.target.value } }))}
                        />
                      </div>
                      <div>
                        <Label>Ícone</Label>
                        <IconPicker
                          value={novosSubcanais[canal.id]?.icone || ""}
                          onChange={(name) => setNovosSubcanais((old) => ({ ...old, [canal.id]: { ...(old[canal.id] || { nome: "", icone: "", ordem: 0 }), icone: name } }))}
                          triggerLabel="Escolher ícone"
                        />
                      </div>
                      <div>
                        <Label>Ordem</Label>
                        <Input
                          type="number"
                          value={novosSubcanais[canal.id]?.ordem ?? 0}
                          onChange={(e) => setNovosSubcanais((old) => ({ ...old, [canal.id]: { ...(old[canal.id] || { nome: "", icone: "", ordem: 0 }), ordem: Number(e.target.value) } }))}
                        />
                      </div>
                      <div>
                        <Button onClick={() => adicionarSubcanal(canal.id)} disabled={loading} className="w-full">
                          <Plus className="w-4 h-4 mr-2" /> Adicionar
                        </Button>
                      </div>
                    </div>

                    {/* Lista de subcanais existentes */}
                    <div className="space-y-3">
                      {(groupedSubcanais[canal.id] || []).map((sub) => (
                        <div key={sub.id} className="grid gap-3 md:grid-cols-5 items-end">
                          <div className="md:col-span-2">
                            <Label>Nome</Label>
                            <Input value={sub.nome} onChange={(e) => setSubcanais((prev) => prev.map((s) => (s.id === sub.id ? { ...s, nome: e.target.value } : s)))} />
                          </div>
                          <div>
                            <Label>Ícone</Label>
                            <IconPicker
                              value={sub.icone || ""}
                              onChange={(name) => setSubcanais((prev) => prev.map((s) => (s.id === sub.id ? { ...s, icone: name } : s)))}
                              triggerLabel="Escolher ícone"
                            />
                          </div>
                          <div>
                            <Label>Ordem</Label>
                            <Input type="number" value={sub.ordem ?? 0} onChange={(e) => setSubcanais((prev) => prev.map((s) => (s.id === sub.id ? { ...s, ordem: Number(e.target.value) } : s)))} />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => atualizarSubcanal(sub)} disabled={loading}>
                              <Save className="w-4 h-4 mr-2" /> Salvar
                            </Button>
                            <Button variant="destructive" onClick={() => removerSubcanal(sub.id)} disabled={loading}>
                              <Trash2 className="w-4 h-4 mr-2" /> Remover
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            {canais.length === 0 && (
              <div className="text-sm text-muted-foreground px-1">Nenhum canal cadastrado ainda.</div>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
