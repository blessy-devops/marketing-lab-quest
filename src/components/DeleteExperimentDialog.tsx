import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DeleteExperimentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  experimentoId: string;
  experimentoNome: string;
}

export const DeleteExperimentDialog = ({
  isOpen,
  onClose,
  experimentoId,
  experimentoNome,
}: DeleteExperimentDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirmText !== experimentoNome) {
      toast.error("Nome do experimento não confere");
      return;
    }

    setIsDeleting(true);

    try {
      // Deletar em ordem para evitar violação de foreign key
      
      // 1. Deletar comentários
      await supabase
        .from('comentarios')
        .delete()
        .eq('experimento_id', experimentoId);

      // 2. Deletar anexos
      await supabase
        .from('anexos')
        .delete()
        .eq('experimento_id', experimentoId);

      // 3. Deletar métricas
      await supabase
        .from('metricas')
        .delete()
        .eq('experimento_id', experimentoId);

      // 4. Deletar resultados
      await supabase
        .from('resultados')
        .delete()
        .eq('experimento_id', experimentoId);

      // 5. Deletar notificações relacionadas
      await supabase
        .from('notificacoes')
        .delete()
        .eq('experimento_id', experimentoId);

      // 6. Finalmente, deletar o experimento
      const { error } = await supabase
        .from('experimentos')
        .delete()
        .eq('id', experimentoId);

      if (error) throw error;

      toast.success('Experimento excluído com sucesso');
      navigate('/experimentos');
      
    } catch (error) {
      console.error('Erro ao excluir experimento:', error);
      toast.error('Erro ao excluir experimento');
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-left">Excluir Experimento</DialogTitle>
              <DialogDescription className="text-left">
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-destructive/5 p-4">
            <p className="text-sm text-muted-foreground">
              Este experimento e todos os dados relacionados serão permanentemente excluídos:
            </p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Métricas e resultados</li>
              <li>Comentários e anexos</li>
              <li>Notificações relacionadas</li>
              <li>Histórico completo</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Para confirmar, digite o nome do experimento: <strong>{experimentoNome}</strong>
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Digite o nome exato do experimento"
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== experimentoNome || isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir Permanentemente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};