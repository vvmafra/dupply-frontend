import { Link } from "react-router-dom";
import {
  CircleCheck as CheckCircle2,
  Circle,
  CircleAlert as AlertCircle,
  CircleX,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  canSellerRegisterDuplicatas,
} from "@/domain/seller/seller-duplicata-access";
import { getValidationStatusLabel, getValidationStatusColor } from "@/domain/seller/seller.validation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import type { SellerCompany } from "@/domain/seller/seller.types";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

interface SellerValidationProgressProps {
  seller: SellerCompany;
  duplicatas: DuplicataTitulo[];
}

type StepState = "done" | "current" | "pending" | "failed";

function stepCadastroEnviado(s: SellerCompany): boolean {
  return s.validationStatus !== "NOT_STARTED";
}

function stepKyc(s: SellerCompany): boolean {
  return s.kycStatus === "APPROVED";
}

function stepCadastroDuplicatas(s: SellerCompany): boolean {
  return canSellerRegisterDuplicatas(s);
}

function failedCadastroDuplicatas(s: SellerCompany): boolean {
  return s.validationStatus === "REJECTED" || s.analystDuplicatasAccess === "REJECTED";
}

function StepIcon({ visual }: { visual: StepState }) {
  if (visual === "done") return <CheckCircle2 className="size-4 shrink-0 text-success" />;
  if (visual === "failed") return <CircleX className="size-4 shrink-0 text-destructive" />;
  if (visual === "current") return <AlertCircle className="size-4 shrink-0 text-warning" />;
  return <Circle className="size-4 shrink-0 text-muted-foreground" />;
}

/** Mesmo alinhamento e tipografia dos steps acima (`text-sm`, ícone `size-4`). */
function DuplicatasStatusRow({
  seller,
  duplicatas,
}: {
  seller: SellerCompany;
  duplicatas: DuplicataTitulo[];
}) {
  const canRegister = canSellerRegisterDuplicatas(seller);
  const emAnalise = duplicatas.filter((d) => d.analiseAnalista === "pendente").length;

  const rowClass = "flex flex-wrap items-center gap-2";

  if (!canRegister) {
    return (
      <div className={rowClass}>
        <Circle className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Duplicatas: aguardando aprovação do cadastro para registro.
        </span>
      </div>
    );
  }

  if (duplicatas.length === 0) {
    return (
      <div className={cn(rowClass, "justify-between gap-3")}>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Clock className="size-4 shrink-0 text-warning" />
          <span className="text-sm text-foreground">Nenhuma duplicata cadastrada ainda.</span>
        </div>
        <Button size="sm" variant="outline" asChild className="shrink-0">
          <Link to={ROUTES.seller.duplicatas.new}>Nova duplicata</Link>
        </Button>
      </div>
    );
  }

  if (emAnalise > 0) {
    return (
      <div className={cn(rowClass)}>
        <AlertCircle className="size-4 shrink-0 text-warning" />
        <span className="text-sm text-foreground">
          {emAnalise === 1
            ? "1 duplicata em análise pelo analista"
            : `${emAnalise} duplicatas em análise pelo analista`}
        </span>
        <Link
          to={ROUTES.seller.duplicatas.list}
          className="text-sm text-primary underline underline-offset-2"
        >
          Ver duplicatas
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(rowClass)}>
      <CheckCircle2 className="size-4 shrink-0 text-success" />
      <span className="text-sm text-foreground">Nenhuma duplicata pendente de análise.</span>
      <Link
        to={ROUTES.seller.duplicatas.list}
        className="text-sm text-primary underline underline-offset-2"
      >
        Ver duplicatas
      </Link>
    </div>
  );
}

export function SellerValidationProgress({ seller, duplicatas }: SellerValidationProgressProps) {
  const { validationStatus } = seller;

  const stepDefs = [
    { id: 1, label: "Cadastro enviado", completed: stepCadastroEnviado(seller) },
    { id: 2, label: "KYC aprovado", completed: stepKyc(seller) },
    {
      id: 3,
      label: "Cadastro aprovado para registro de duplicatas",
      completed: stepCadastroDuplicatas(seller),
    },
  ] as const;

  function stepVisualState(index: number): StepState {
    const def = stepDefs[index];
    if (def.id === 3 && failedCadastroDuplicatas(seller)) return "failed";
    if (def.completed) return "done";
    const prevAllDone = stepDefs.slice(0, index).every((d) => d.completed);
    if (prevAllDone) return "current";
    return "pending";
  }

  const completedCount = stepDefs.filter((d) => d.completed).length;
  const progressPct = (completedCount / stepDefs.length) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base">Progresso de validação</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn(getValidationStatusColor(validationStatus), "border text-xs")}
            >
              {getValidationStatusLabel(validationStatus)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressPct} className="h-2" />
        <div className="space-y-3">
          {stepDefs.map((step, index) => {
            const visual = stepVisualState(index);
            return (
              <div key={step.id} className="flex items-center gap-2">
                <StepIcon visual={visual} />
                <span
                  className={cn(
                    "text-sm",
                    visual === "done" && "text-foreground",
                    visual === "current" && "text-foreground font-medium",
                    visual === "failed" && "text-destructive font-medium",
                    visual === "pending" && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
          <DuplicatasStatusRow seller={seller} duplicatas={duplicatas} />
        </div>
      </CardContent>
    </Card>
  );
}
