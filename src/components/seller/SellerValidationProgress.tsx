import { CircleCheck as CheckCircle2, Circle, CircleAlert as AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getValidationStatusLabel, getValidationStatusColor } from "@/domain/seller/seller.validation";
import { cn } from "@/lib/utils";
import type { SellerCompany } from "@/domain/seller/seller.types";

interface SellerValidationProgressProps {
  seller: SellerCompany;
}

const steps = [
  { id: 1, label: "Cadastro básico" },
  { id: 2, label: "Documentos enviados" },
  { id: 3, label: "KYC aprovado" },
  { id: 4, label: "Pronto para recebíveis" },
];

export function SellerValidationProgress({ seller }: SellerValidationProgressProps) {
  const { onboardingStep, validationStatus } = seller;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base">Progresso de validação</CardTitle>
          <Badge
            variant="outline"
            className={cn(getValidationStatusColor(validationStatus), "border text-xs")}
          >
            {getValidationStatusLabel(validationStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={(onboardingStep / 4) * 100} className="h-2" />
        <div className="space-y-2">
          {steps.map((step) => {
            const done = onboardingStep > step.id;
            const current = onboardingStep === step.id;
            const Icon = done ? CheckCircle2 : current ? AlertCircle : Circle;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    done && "text-success",
                    current && "text-warning",
                    !done && !current && "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    done && "text-foreground",
                    current && "text-foreground font-medium",
                    !done && !current && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
