import { Trophy, Star, TrendingUp, Calendar, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const successStories = [
  {
    id: 1,
    title: "Redesign do Checkout - 34% mais conversões",
    description: "Simplificamos o processo de checkout removendo campos desnecessários e melhorando a experiência do usuário.",
    impact: "+34% conversões",
    roi: "R$ 284.000",
    duration: "21 dias",
    participants: "12.5K",
    date: "Dezembro 2023",
    category: "UX/UI",
    tags: ["checkout", "conversão", "ux"]
  },
  {
    id: 2,
    title: "Nova Landing Page - 48% mais leads",
    description: "Testamos uma nova estrutura de landing page com foco em benefícios e prova social.",
    impact: "+48% leads",
    roi: "R$ 156.000",
    duration: "14 dias",
    participants: "8.2K",
    date: "Janeiro 2024",
    category: "Landing Page",
    tags: ["landing", "leads", "copywriting"]
  },
  {
    id: 3,
    title: "Email Subject Lines - 67% mais opens",
    description: "Testamos diferentes abordagens de subject lines focando em urgência e personalização.",
    impact: "+67% open rate",
    roi: "R$ 89.000",
    duration: "7 dias",
    participants: "25.3K",
    date: "Novembro 2023",
    category: "Email Marketing",
    tags: ["email", "subject-line", "engagement"]
  },
  {
    id: 4,
    title: "Pricing Page Redesign - 23% mais upgrades",
    description: "Reorganizamos a apresentação dos planos destacando o valor e benefícios de cada tier.",
    impact: "+23% upgrades",
    roi: "R$ 412.000",
    duration: "28 dias",
    participants: "6.8K",
    date: "Outubro 2023",
    category: "Pricing",
    tags: ["pricing", "upgrade", "revenue"]
  },
  {
    id: 5,
    title: "CTA Button Color - 19% mais cliques",
    description: "Mudamos a cor do botão principal de azul para laranja e aumentamos significativamente os cliques.",
    impact: "+19% cliques",
    roi: "R$ 67.000",
    duration: "10 dias",
    participants: "15.7K",
    date: "Setembro 2023",
    category: "A/B Test",
    tags: ["cta", "button", "design"]
  },
  {
    id: 6,
    title: "Homepage Hero - 31% mais engajamento",
    description: "Testamos um novo hero section com vídeo explicativo vs. imagem estática.",
    impact: "+31% engajamento",
    roi: "R$ 198.000",
    duration: "18 dias",
    participants: "11.4K",
    date: "Agosto 2023",
    category: "Homepage",
    tags: ["hero", "video", "engagement"]
  }
];

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    "UX/UI": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "Landing Page": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Email Marketing": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "Pricing": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "A/B Test": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    "Homepage": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
  };
  return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
};

export default function Gallery() {
  const totalROI = successStories.reduce((acc, story) => {
    return acc + parseInt(story.roi.replace(/[R$.,]/g, ''));
  }, 0);

  const avgImpact = successStories.reduce((acc, story) => {
    const impact = parseInt(story.impact.replace(/[+%]/g, ''));
    return acc + impact;
  }, 0) / successStories.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galeria de Sucessos</h1>
          <p className="text-muted-foreground">
            Celebre os experimentos que geraram os melhores resultados
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow">
          <Trophy className="w-4 h-4 mr-2" />
          Ver Relatório Completo
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Experimentos de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successStories.length}</div>
            <p className="text-xs text-muted-foreground">últimos 12 meses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              ROI Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(totalROI / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">retorno gerado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Impacto Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{avgImpact.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">melhoria média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">experimentos bem-sucedidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Success Stories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {successStories.map((story) => (
          <Card key={story.id} className="group hover:shadow-lg transition-all duration-300 border-border/40 bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge className={getCategoryColor(story.category)}>
                  {story.category}
                </Badge>
                <div className="text-xs text-muted-foreground">{story.date}</div>
              </div>
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                {story.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {story.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Impact Highlight */}
              <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 p-3 rounded-lg border border-primary/20">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">{story.impact}</div>
                  <div className="text-xs text-muted-foreground">melhoria alcançada</div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">ROI Gerado</p>
                  <p className="font-semibold">{story.roi}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duração</p>
                  <p className="font-semibold">{story.duration}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Participantes</p>
                  <p className="font-semibold">{story.participants}</p>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {story.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Button */}
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Ver Detalhes Completos
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
        <CardContent className="text-center py-8">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Pronto para o próximo sucesso?
          </h3>
          <p className="text-muted-foreground mb-4">
            Crie um novo experimento e junte-se à galeria dos melhores resultados
          </p>
          <Button className="bg-gradient-to-r from-primary to-primary-glow">
            Iniciar Novo Experimento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}