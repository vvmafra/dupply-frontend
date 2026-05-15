import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Landmark, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ROUTES } from "@/lib/routes";

const FEATURES = [
  {
    icon: Zap,
    title: "Antecipação em horas",
    description: "Transforme seus recebíveis em capital de giro em tempo recorde, sem burocracia excessiva.",
  },
  {
    icon: Landmark,
    title: "Lastro em fundo estruturado",
    description: "Duplicatas tokenizadas com lastro em fundo FIDC/TIDC, com critérios de crédito e governança definidos.",
  },
  {
    icon: ShieldCheck,
    title: "Transparência total",
    description: "Cada operação é registrada e auditável, garantindo segurança para cedentes e para o fundo.",
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
              Versão protótipo — ambiente de demonstração
            </div>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              Antecipação de recebíveis simples e eficiente
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              A Dupply conecta empresas que precisam de capital de giro a um fundo estruturado (FIDC/TIDC)
              que lastreia duplicatas tokenizadas. Tudo de forma digital, rápida e transparente.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link to={ROUTES.login}>
                  Começar agora
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={ROUTES.selectProfile}>
                  Explorar protótipo
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardContent className="p-6 space-y-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4 text-center space-y-4">
            <h2 className="text-2xl font-bold">Pronto para começar?</h2>
            <p className="text-muted-foreground">Acesse o protótipo e explore todas as funcionalidades da plataforma.</p>
            <Button asChild>
              <Link to={ROUTES.login}>
                Acessar plataforma
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © 2024 Dupply · Plataforma de antecipação de recebíveis · Ambiente de demonstração
      </footer>
    </div>
  );
}
