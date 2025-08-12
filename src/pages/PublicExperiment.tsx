import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Download, ExternalLink } from "lucide-react";

interface SharedPayload {
  experimento: any;
  metricas: any[];
  resultados: any[];
  anexos: any[];
  comentarios: any[];
}

const statusClass = (status?: string) => {
  const map: Record<string, string> = {
    planejado: "bg-secondary text-secondary-foreground",
    em_andamento: "bg-primary text-primary-foreground",
    pausado: "bg-destructive/20 text-destructive",
    concluido: "bg-accent text-accent-foreground",
    cancelado: "bg-muted text-muted-foreground",
  };
  return map[status || ""] || "bg-muted text-muted-foreground";
};

export default function PublicExperiment() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SharedPayload | null>(null);

  useEffect(() => {
    document.title = data?.experimento?.nome
      ? `${data.experimento.nome} • Experimento (compartilhado)`
      : "Experimento compartilhado";
  }, [data?.experimento?.nome]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await (supabase as any).rpc("get_shared_experiment", { token });
      if (!error && data) setData(data as SharedPayload);
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!data || !data.experimento) {
    return (
      <div className="container mx-auto py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold">Link inválido ou expirado</h1>
        <p className="text-muted-foreground">
          Solicite um novo link de compartilhamento ao criador do experimento.
        </p>
      </div>
    );
  }

  const exp = data.experimento;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{exp.nome}</h1>
          <p className="text-sm text-muted-foreground">Visualização somente-leitura (link compartilhado)</p>
        </div>
        <Badge className={statusClass(exp.status)}>{String(exp.status || "").replace("_", " ")}</Badge>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Responsável</span>
              <div className="font-medium">{exp.responsavel || "Não definido"}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Período</span>
              <div className="font-medium">
                {exp.data_inicio && exp.data_fim
                  ? `${new Date(exp.data_inicio).toLocaleDateString("pt-BR")} → ${new Date(exp.data_fim).toLocaleDateString("pt-BR")}`
                  : "Não definido"}
              </div>
            </div>
            {!!(exp.canais && exp.canais.length) && (
              <div>
                <span className="text-sm text-muted-foreground">Canais</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {exp.canais.map((c: string, i: number) => (
                    <Badge key={i} variant="secondary">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Hipótese</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">{exp.hipotese || "Nenhuma hipótese definida"}</p>
          </CardContent>
        </Card>
      </section>

      {!!(data.metricas?.length) && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Métricas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.metricas.map((m) => (
              <Card key={m.id}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    {m.nome}
                    <Badge variant={m.tipo === "esperada" ? "secondary" : "default"}>{m.tipo}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {m.valor?.toFixed?.(2) ?? m.valor} {m.unidade}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {!!(data.resultados?.length) && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Resultados</h2>
          {data.resultados.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-sm text-muted-foreground">Sucesso</span>
                  <div className="font-medium">{r.sucesso ? "Sim" : "Não"}</div>
                </div>
                {r.roi != null && (
                  <div>
                    <span className="text-sm text-muted-foreground">ROI</span>
                    <div className="font-medium">{Number(r.roi).toFixed(2)}x</div>
                  </div>
                )}
                {r.aprendizados && (
                  <div className="md:col-span-3">
                    <span className="text-sm text-muted-foreground">Aprendizados</span>
                    <p className="mt-1">{r.aprendizados}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {!!(data.anexos?.length) && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Anexos</h2>
          <Card>
            <CardContent className="py-4">
              <ul className="divide-y">
                {data.anexos.map((a) => (
                  <li key={a.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.file_name || a.url}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.descricao || a.mime_type}</div>
                    </div>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      Abrir <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {!!(data.comentarios?.length) && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Comentários</h2>
          <Card>
            <CardContent className="py-4 space-y-4">
              {data.comentarios.map((c) => (
                <div key={c.id} className="space-y-1">
                  <div className="font-medium">{c.usuario_id?.slice?.(0, 8) || "Usuário"}</div>
                  <div className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleString("pt-BR")}</div>
                  <p>{c.texto}</p>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      <footer className="text-xs text-muted-foreground text-center pt-6">
        Visualização pública – Compartilhado via link
      </footer>
    </div>
  );
}
