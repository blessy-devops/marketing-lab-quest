import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const experiments = [
  {
    id: 1,
    name: "Teste A/B - Botão CTA Principal",
    description: "Testando diferentes cores e textos para o botão de call-to-action",
    status: "Ativo",
    type: "A/B Test",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    participants: 2300,
    conversionRate: 8.4,
    progress: 75
  },
  {
    id: 2,
    name: "Landing Page - Headline Variação",
    description: "Comparando diferentes headlines para aumentar conversão",
    status: "Concluído",
    type: "Multivariate",
    startDate: "2024-01-10",
    endDate: "2024-01-25",
    participants: 1800,
    conversionRate: 12.1,
    progress: 100
  },
  {
    id: 3,
    name: "Email Marketing - Subject Line",
    description: "Testando subject lines para campanha de newsletter",
    status: "Em andamento",
    type: "A/B Test",
    startDate: "2024-01-20",
    endDate: "2024-02-20",
    participants: 5100,
    conversionRate: 6.7,
    progress: 45
  },
  {
    id: 4,
    name: "Checkout - Formulário Simplificado",
    description: "Reduzindo etapas do checkout para diminuir abandono",
    status: "Rascunho",
    type: "A/B Test",
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    participants: 0,
    conversionRate: 0,
    progress: 0
  },
  {
    id: 5,
    name: "Pricing Page - Tabela de Preços",
    description: "Testando diferentes layouts para página de preços",
    status: "Pausado",
    type: "Multivariate",
    startDate: "2024-01-05",
    endDate: "2024-02-05",
    participants: 950,
    conversionRate: 4.2,
    progress: 60
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Ativo":
    case "Em andamento":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Concluído":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Pausado":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Rascunho":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function ExperimentsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch = experiment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         experiment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || experiment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experimentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os seus experimentos de marketing
          </p>
        </div>
        <Link to="/experimentos/novo">
          <Button className="bg-gradient-to-r from-primary to-primary-glow">
            <Plus className="w-4 h-4 mr-2" />
            Novo Experimento
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>
                Use os filtros para encontrar experimentos específicos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar experimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Experiments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Experimentos</CardTitle>
          <CardDescription>
            {filteredExperiments.length} experimento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Conversão</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExperiments.map((experiment) => (
                <TableRow key={experiment.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{experiment.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {experiment.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(experiment.status)}
                    >
                      {experiment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{experiment.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {experiment.participants.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {experiment.conversionRate > 0 ? `${experiment.conversionRate}%` : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 w-16">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${experiment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground min-w-[3rem]">
                        {experiment.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{experiment.startDate}</div>
                      <div className="text-muted-foreground">{experiment.endDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/experimentos/${experiment.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}