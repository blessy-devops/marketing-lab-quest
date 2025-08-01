import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { CANAIS_OPTIONS, getChannelIcon } from '@/constants/canais';
import { TipoExperimento, CanalTipoSugestao, useUpdateCanalTipoSugestao } from '@/hooks/useTiposExperimento';

interface SugestoesCanalMatrixProps {
  tipos: TipoExperimento[];
  sugestoes: CanalTipoSugestao[];
}

export function SugestoesCanalMatrix({ tipos, sugestoes }: SugestoesCanalMatrixProps) {
  const updateSugestao = useUpdateCanalTipoSugestao();

  const getSugestaoPeso = (canal: string, tipoId: string): number => {
    const sugestao = sugestoes.find(s => s.canal === canal && s.tipo_id === tipoId);
    return sugestao?.peso || 0;
  };

  const handlePesoChange = async (canal: string, tipoId: string, peso: number) => {
    await updateSugestao.mutateAsync({ canal, tipoId, peso });
  };

  const renderStars = (canal: string, tipoId: string) => {
    const currentPeso = getSugestaoPeso(canal, tipoId);
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map((peso) => (
          <Button
            key={peso}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handlePesoChange(
              canal, 
              tipoId, 
              currentPeso === peso ? 0 : peso
            )}
          >
            <Star
              size={14}
              className={
                peso <= currentPeso
                  ? "fill-current text-yellow-500"
                  : "text-muted-foreground"
              }
            />
          </Button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sugestões por Canal</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure quais tipos de experimento são sugeridos para cada canal. 
          Use as estrelas para definir a relevância (1-3).
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 min-w-[200px]">Canal</th>
                {tipos.filter(t => t.ativo).map((tipo) => (
                  <th key={tipo.id} className="text-center p-2 min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium text-white"
                        style={{ backgroundColor: tipo.cor }}
                      >
                        {tipo.nome.charAt(0)}
                      </div>
                      <span className="text-xs">{tipo.nome}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CANAIS_OPTIONS.map((canal) => {
                const IconComponent = getChannelIcon(canal.value);
                return (
                  <tr key={canal.value} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">
                      <div className="flex items-center gap-2">
                        <IconComponent size={16} className="text-muted-foreground" />
                        {canal.label}
                      </div>
                    </td>
                    {tipos.filter(t => t.ativo).map((tipo) => (
                      <td key={tipo.id} className="p-2 text-center">
                        {renderStars(canal.value, tipo.id)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Legenda:</h4>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-muted-foreground" />
              <span>Sem sugestão</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-current text-yellow-500" />
              <span>Baixa relevância</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-current text-yellow-500" />
              <Star size={14} className="fill-current text-yellow-500" />
              <span>Média relevância</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-current text-yellow-500" />
              <Star size={14} className="fill-current text-yellow-500" />
              <Star size={14} className="fill-current text-yellow-500" />
              <span>Alta relevância</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}