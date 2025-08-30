import { useState, FormEvent } from "react";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";

interface Fonte {
  id: string;
  nome: string;
}

export default function Oraculo() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [fontes, setFontes] = useState<Fonte[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pergunta.trim()) return;

    setLoading(true);
    setBuscaFeita(true);

    try {
      const response = await fetch("https://n8n.useblessy.com.br/webhook/oraculo-agentes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pergunta }),
      });

      const data = await response.json();
      setResposta(data.resposta || "Resposta não disponível");
      setFontes(data.fontes || []);
    } catch (error) {
      console.error("Erro na consulta:", error);
      setResposta("Erro ao consultar o Oráculo. Tente novamente.");
      setFontes([]);
    } finally {
      setLoading(false);
    }
  };

  const resetBusca = () => {
    setBuscaFeita(false);
    setPergunta("");
    setResposta("");
    setFontes([]);
  };

  if (!buscaFeita) {
    // Layout centralizado para primeira consulta
    return (
      <div className="flex justify-center items-center h-full">
        <div className="max-w-2xl w-full space-y-6 p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg">
                <Brain className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Oráculo</h1>
              <p className="text-muted-foreground text-lg">
                Inteligência artificial para estratégias de marketing
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Digite sua pergunta sobre marketing..."
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                className="text-lg p-4 h-14"
                disabled={loading}
                required
              />
            </div>
            
            <Button 
              type="submit"
              disabled={!pergunta.trim() || loading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Consultar Oráculo
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Layout normal no topo da página após primeira consulta
  return (
    <div className="space-y-6">
      {/* Header com nova consulta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Oráculo</h1>
            <p className="text-muted-foreground">
              Inteligência artificial para estratégias de marketing
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={resetBusca}>
          Nova Consulta
        </Button>
      </div>

      {/* Nova pergunta */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Digite sua pergunta sobre marketing..."
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          className="flex-1"
          disabled={loading}
          required
        />
        <Button 
          type="submit"
          disabled={!pergunta.trim() || loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </Button>
      </form>

      {/* Área de resposta */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processando sua consulta...</span>
          </div>
        </div>
      )}

      {!loading && resposta && (
        <div className="space-y-6">
          {/* Resposta da IA */}
          <div className="bg-background border rounded-lg p-6">
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {resposta}
              </ReactMarkdown>
            </div>
          </div>

          {/* Fontes consultadas */}
          {fontes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fontes Consultadas</h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <ul className="space-y-2">
                  {fontes.map((fonte) => (
                    <li key={fonte.id}>
                      <Link
                        to={`/experimentos/${fonte.id}`}
                        className="text-primary hover:underline"
                      >
                        • {fonte.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}