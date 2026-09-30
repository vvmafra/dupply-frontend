import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "primary" | "destructive";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  tone: Tone;
  /** Animated dot for the step currently in progress. */
  active?: boolean;
}

const TONE_CLASSES: Record<Tone, { ring: string; dot: string }> = {
  success: { ring: "bg-success/20 border-success text-success", dot: "bg-success" },
  warning: { ring: "bg-warning/20 border-warning text-warning", dot: "bg-warning" },
  primary: { ring: "bg-primary/20 border-primary text-primary", dot: "bg-primary" },
  destructive: { ring: "bg-destructive/20 border-destructive text-destructive", dot: "bg-destructive" },
};

function formatTimestamp(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function when(iso?: string, prefix = " em "): string {
  const text = formatTimestamp(iso);
  return text ? `${prefix}${text}` : "";
}

/** Builds the seller-facing history from the duplicata status + backend timestamps. */
export function buildSellerDuplicataTimeline(d: DuplicataTitulo): TimelineEvent[] {
  const history = d.statusHistory ?? {};
  const events: TimelineEvent[] = [
    {
      id: "created",
      title: "Duplicata Registrada",
      description: `Enviada com sucesso no dia ${formatTimestamp(history.created) || d.dataEmissao || "de cadastro"}.`,
      tone: "success",
    },
  ];

  if (d.analiseAnalista === "pendente") {
    events.push({
      id: "review",
      title: "Aguardando Análise",
      description: "Aguardando validação do devedor pelo comitê de crédito.",
      tone: "warning",
      active: true,
    });
    return events;
  }

  events.push({
    id: "review",
    title: "Análise de Risco Concluída",
    description: `Validação dos documentos e risco do pagador finalizada${when(history.under_review)}.`,
    tone: "success",
  });

  if (d.analiseAnalista === "for_approval") {
    events.push({
      id: "offer",
      title: "Proposta Emitida",
      description: `Taxa de deságio de ${d.descontoAntecipacaoPercent}% oferecida para antecipação${when(history.offer)}.`,
      tone: "primary",
      active: true,
    });
    return events;
  }

  events.push({
    id: "offer",
    title: "Proposta Avaliada",
    description: `Condições comerciais analisadas pelo Cedente${when(history.offer)}.`,
    tone: "success",
  });

  if (d.analiseAnalista === "aprovado") {
    events.push({
      id: "confirmed",
      title: "Operação Confirmada",
      description: `Proposta aceita${when(history.confirmed)}! O recurso seguiria para liquidação financeira.`,
      tone: "success",
    });
  } else if (d.analiseAnalista === "reprovado") {
    events.push({
      id: "rejected",
      title: "Operação Recusada",
      description: `A contraproposta foi recusada pelo cedente ou cancelada${when(history.rejected || history.reproved)}.`,
      tone: "destructive",
    });
  }

  return events;
}

export function SellerDuplicataTimeline({ duplicata }: Readonly<{ duplicata: DuplicataTitulo }>) {
  const events = buildSellerDuplicataTimeline(duplicata);

  return (
    <Card className="shadow-xs border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Histórico de Análise</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative pl-6 space-y-5 border-l border-border/80 ml-2 text-xs">
          {events.map((event) => {
            const tone = TONE_CLASSES[event.tone];
            return (
              <div key={event.id} className="relative">
                <div
                  className={cn(
                    "absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center",
                    tone.ring,
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", tone.dot, event.active && "animate-pulse")} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{event.title}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
