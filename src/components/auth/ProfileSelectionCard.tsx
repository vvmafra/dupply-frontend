import { Building2, Shield, ArrowRight, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfileDescription, getProfileLabel } from "@/domain/auth/auth.helpers";
import type { UserProfile } from "@/domain/auth/auth.types";

const profileMeta: Record<
  UserProfile,
  {
    icon: React.ElementType;
    accent: string;
  }
> = {
  seller: {
    icon: Building2,
    accent: "text-primary border-primary/20 bg-primary/5 hover:bg-primary/10",
  },
  admin: {
    icon: Shield,
    accent: "text-chart-4 border-chart-4/20 bg-chart-4/5 hover:bg-chart-4/10",
  },
  riskAnalyst: {
    icon: ClipboardList,
    accent: "text-chart-3 border-chart-3/20 bg-chart-3/5 hover:bg-chart-3/10",
  },
};

type ProfileSelectionCardProps = {
  profiles: UserProfile[];
  onSelect: (profile: UserProfile) => void;
};

export function ProfileSelectionCard({ profiles, onSelect }: ProfileSelectionCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => {
        const meta = profileMeta[profile];
        const Icon = meta.icon;

        return (
          <Card
            key={profile}
            className={`h-full border-2 transition-colors cursor-pointer ${meta.accent}`}
          >
            <CardHeader className="pb-3">
              <Icon className="size-8 mb-2" />
              <CardTitle className="text-lg">{getProfileLabel(profile)}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {getProfileDescription(profile)}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button className="w-full" variant="default" onClick={() => onSelect(profile)}>
                Selecionar
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
