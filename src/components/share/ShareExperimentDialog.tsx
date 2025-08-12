import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Link as LinkIcon, RefreshCw, Copy as CopyIcon } from "lucide-react";
import { toast } from "sonner";

interface ShareExperimentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experimentoId: string;
}

type AccessType = "restricted" | "link";

type ShareRow = {
  id: string;
  experimento_id: string;
  access_type: AccessType;
  link_token: string | null;
  active: boolean;
  expires_at: string | null;
};

export const ShareExperimentDialog: React.FC<ShareExperimentDialogProps> = ({ open, onOpenChange, experimentoId }) => {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [row, setRow] = React.useState<ShareRow | null>(null);
  const [access, setAccess] = React.useState<AccessType>("restricted");

  const load = React.useCallback(async () => {
    if (!open || !experimentoId) return;
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("experiment_shares")
      .select("id, experimento_id, access_type, link_token, active, expires_at")
      .eq("experimento_id", experimentoId)
      .maybeSingle();
    if (error) {
      console.error(error);
      toast.error("Erro ao carregar opções de compartilhamento");
    } else if (data) {
      setRow(data as any);
      setAccess((data as any).active && (data as any).access_type === "link" ? "link" : "restricted");
    } else {
      setRow(null);
      setAccess("restricted");
    }
    setLoading(false);
  }, [open, experimentoId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const buildLink = React.useCallback(() => {
    if (!row?.link_token) return "";
    return `${window.location.origin}/share/${row.link_token}`;
  }, [row?.link_token]);

  const ensureLinkAndSave = async (newAccess: AccessType) => {
    setSaving(true);
    try {
      const needsToken = newAccess === "link" && !row?.link_token;
      const link_token = needsToken ? crypto.randomUUID() : row?.link_token ?? null;

      const payload: Partial<ShareRow> & { experimento_id: string } = {
        experimento_id: experimentoId,
        access_type: newAccess,
        link_token,
        active: newAccess === "link",
      } as any;

      const { data, error } = await (supabase as any)
        .from("experiment_shares")
        .upsert(payload as any, { onConflict: "experimento_id" })
        .select()
        .single();

      if (error) throw error;
      setRow(data as any);
      setAccess(newAccess);
      if (newAccess === "link") toast.success("Link de compartilhamento ativado");
      else toast.success("Compartilhamento restringido a pessoas com acesso");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível salvar as opções");
    } finally {
      setSaving(false);
    }
  };

  const regenerate = async () => {
    if (!row) return;
    setSaving(true);
    try {
      const link_token = crypto.randomUUID();
      const { data, error } = await (supabase as any)
        .from("experiment_shares")
        .update({ link_token })
        .eq("experimento_id", experimentoId)
        .select()
        .single();
      if (error) throw error;
      setRow(data as any);
      toast.success("Novo link gerado");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar novo link");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    const url = buildLink();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch (e) {
      toast.error("Falha ao copiar o link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartilhar experimento</DialogTitle>
          <DialogDescription>Defina quem pode visualizar este experimento.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Opções de acesso</Label>
              <RadioGroup
                value={access}
                onValueChange={(val) => ensureLinkAndSave(val as AccessType)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="restricted" id="acc1" />
                  <Label htmlFor="acc1">Somente pessoas com acesso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="link" id="acc2" />
                  <Label htmlFor="acc2">Qualquer pessoa com o link</Label>
                </div>
              </RadioGroup>
            </div>

            {access === "link" && (
              <div className="space-y-2">
                <Label>Link de compartilhamento</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={buildLink()} className="flex-1" />
                  <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copiar link">
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={regenerate} disabled={saving} aria-label="Gerar novo link">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                  <Button onClick={copyLink}>
                    <LinkIcon className="h-4 w-4 mr-2" /> Copiar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Qualquer pessoa com este link poderá visualizar este experimento.</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
