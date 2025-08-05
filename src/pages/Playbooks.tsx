import { useState } from "react";
import { BookOpen, Filter, Grid3X3, Bookmark, Play, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Playbooks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Playbooks mockados
  const playbooks = [
    {
      id: 1,
      titulo: "Gap Recovery 72h",
      tags: ["urgência", "gap", "email"],
      roi: "234%",
      usos: 12,
      tipo: "Gap Recovery",
      categoria: "recovery",
      rating: 4.8,
      descricao: "Estratégia comprovada para recuperar gaps de receita em 72 horas através de campanhas de email direcionadas."
    },
    {
      id: 2,
      titulo: "Black Friday Playbook",
      tags: ["sazonal", "promoção", "conversão"],
      roi: "189%",
      usos: 8,
      tipo: "Campanha Sazonal",
      categoria: "promocional",
      rating: 4.6,
      descricao: "Guia completo para maximizar resultados durante a Black Friday com estratégias multi-canal."
    },
    {
      id: 3,
      titulo: "Lançamento Premium",
      tags: ["lançamento", "premium", "ticket-alto"],
      roi: "156%",
      usos: 5,
      tipo: "Lançamento",
      categoria: "lancamento",
      rating: 4.9,
      descricao: "Metodologia para lançar produtos premium com alta conversão e ticket médio elevado."
    },
    {
      id: 4,
      titulo: "Reativação de Churn",
      tags: ["retenção", "email", "automação"],
      roi: "198%",
      usos: 15,
      tipo: "Retenção",
      categoria: "retention",
      rating: 4.7,
      descricao: "Sequência automatizada para reativar clientes em risco de churn com alta taxa de sucesso."
    },
    {
      id: 5,
      titulo: "Upsell Cross-sell",
      tags: ["upsell", "cross-sell", "receita"],
      roi: "167%",
      usos: 10,
      tipo: "Monetização",
      categoria: "monetization",
      rating: 4.5,
      descricao: "Estratégias para aumentar ticket médio através de ofertas complementares inteligentes."
    },
    {
      id: 6,
      titulo: "Onboarding Acelerado",
      tags: ["onboarding", "ativação", "trial"],
      roi: "143%",
      usos: 18,
      tipo: "Ativação",
      categoria: "activation",
      rating: 4.6,
      descricao: "Processo otimizado para acelerar a ativação de novos usuários em produtos SaaS."
    }
  ];

  const categories = [
    { value: "all", label: "Todas as categorias" },
    { value: "recovery", label: "Recovery" },
    { value: "promocional", label: "Promocional" },
    { value: "lancamento", label: "Lançamento" },
    { value: "retention", label: "Retenção" },
    { value: "monetization", label: "Monetização" },
    { value: "activation", label: "Ativação" }
  ];

  const filteredPlaybooks = playbooks.filter(playbook => {
    const matchesSearch = playbook.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playbook.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || playbook.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">📚 Playbooks</h1>
              <p className="text-muted-foreground">
                Estratégias testadas e validadas pela comunidade
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar playbooks por nome ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Grid3X3 className="w-4 h-4 mr-2" />
            {viewMode === "grid" ? "Lista" : "Grade"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{playbooks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Rating Médio</p>
                <p className="text-2xl font-bold">4.7</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Usos</p>
                <p className="text-2xl font-bold">{playbooks.reduce((acc, p) => acc + p.usos, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full" />
              <div>
                <p className="text-sm text-muted-foreground">ROI Médio</p>
                <p className="text-2xl font-bold">184%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Playbooks */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlaybooks.map((playbook) => (
          <Card key={playbook.id} className="hover:shadow-lg transition-shadow group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {playbook.titulo}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {playbook.descricao}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      {playbook.tipo}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{playbook.rating}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {playbook.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ROI médio</p>
                  <p className="font-semibold text-green-600">{playbook.roi}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Utilizado</p>
                  <p className="font-semibold">{playbook.usos}x</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Play className="w-3 h-3 mr-1" />
                  Usar Playbook
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPlaybooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum playbook encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      )}
    </div>
  );
}