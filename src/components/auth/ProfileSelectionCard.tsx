import { Link } from "react-router-dom";
import { Building2, TrendingUp, Shield, ArrowRight } from "lucide-react";
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
    description: "Antecipe seus recebíveis. Cadastre sua empresa, envie documentos e liste operações para análise.",
    icon: Building2,
    accent: "text-primary border-primary/20 bg-primary/5 hover:bg-primary/10",
  },
  {
    profile: "investor",
    label: "Investidor",
    description: "Acesse oportunidades validadas no marketplace. Simule aportes em operações aprovadas.",
    icon: TrendingUp,
    accent: "text-chart-2 border-chart-2/20 bg-chart-2/5 hover:bg-chart-2/10",
  },
  {
    profile: "admin",
    label: "Administrador",
    description: "Monitore validações, gerencie recebíveis, acompanhe métricas da plataforma e registros internos.",
    icon: Shield,
    accent: "text-chart-4 border-chart-4/20 bg-chart-4/5 hover:bg-chart-4/10",
  },
];

export function ProfileSelectionCard() {
  const { setProfile } = useAuth();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {profileOptions.map((opt) => (
        <Card
          key={opt.profile}
          className={`border-2 transition-colors cursor-pointer ${opt.accent}`}
        >
          <CardHeader className="pb-3">
            <opt.icon className="size-8 mb-2" />
            <CardTitle className="text-lg">{opt.label}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {opt.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="default"
              asChild
              onClick={() => setProfile(opt.profile)}
            >
              <Link to={getProfileRedirect(opt.profile)}>
                Acessar como {opt.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
