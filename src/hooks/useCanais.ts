import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Subcanal {
  id: string;
  canal_id: string;
  nome: string;
  icone?: string | null;
  ordem: number;
  ativo: boolean;
}

export interface CanalCategoria {
  id: string;
  nome: string;
  icone?: string | null;
  ordem: number;
  ativo: boolean;
  subcanais: Subcanal[];
}

export function useCanaisComSubcanais() {
  return useQuery({
    queryKey: ["canais-com-subcanais"],
    queryFn: async (): Promise<CanalCategoria[]> => {
      const [canaisRes, subcanaisRes] = await Promise.all([
        supabase.from("canais").select("id, nome, icone, ordem, ativo").eq("ativo", true).order("ordem", { ascending: true }),
        supabase.from("subcanais").select("id, canal_id, nome, icone, ordem, ativo").eq("ativo", true).order("ordem", { ascending: true })
      ]);

      if (canaisRes.error) throw canaisRes.error;
      if (subcanaisRes.error) throw subcanaisRes.error;

      const canais = canaisRes.data || [];
      const subcanais = subcanaisRes.data || [];

      const byCanal: Record<string, Subcanal[]> = {};
      for (const s of subcanais) {
        if (!byCanal[s.canal_id]) byCanal[s.canal_id] = [];
        byCanal[s.canal_id].push(s as Subcanal);
      }

      return canais.map(c => ({
        id: c.id,
        nome: c.nome,
        icone: c.icone,
        ordem: c.ordem,
        ativo: c.ativo,
        subcanais: byCanal[c.id] || []
      }));
    }
  });
}
