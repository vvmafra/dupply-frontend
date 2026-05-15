import { Link } from "react-router-dom";
import { Building2, Shield, ArrowRight, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileRedirect } from "@/domain/auth/auth.helpers";
import type { UserProfile } from "@/domain/auth/auth.types";

const profileOptions: {
  profile: UserProfile;
  label: string;
  description: string;
  icon: React.ElementType;
  accent: string;
}[] = [
  {
    profile: "seller",
    label: "Cedente",
    description: "Antecipe seus recebíveis. Cadastre sua empresa, envie documentos e liste operações para análise pelo fundo.",
    icon: Building2,
    accent: "text-primary border-primary/20 bg-primary/5 hover:bg-primary/10",
  },
  {
    profile: "admin",
    label: "Administrador",
    description: "Monitore cedentes, analistas de risco, validações e operações internas.",
    icon: Shield,
    accent: "text-chart-4 border-chart-4/20 bg-chart-4/5 hover:bg-chart-4/10",
  },
  {
    profile: "riskAnalyst",
    label: "Analista de risco",
    description: "Revise cadastros de cedentes e duplicatas com score e alertas gerados por IA (simulado).",
    icon: ClipboardList,
    accent: "text-chart-3 border-chart-3/20 bg-chart-3/5 hover:bg-chart-3/10",
  },
];

export function ProfileSelectionCard() {
  const { setProfile } = useAuth();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {profileOptions.map((opt) => (
        <Card
          key={opt.profile}
          className={`h-full border-2 transition-colors cursor-pointer ${opt.accent}`}
        >
          <CardHeader className="pb-3">
            <opt.icon className="size-8 mb-2" />
            <CardTitle className="text-lg">{opt.label}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {opt.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button
              className="w-full"
              variant="default"
              asChild
              onClick={() => setProfile(opt.profile)}
            >
              <Link to={getProfileRedirect(opt.profile)}>
                Selecionar
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
