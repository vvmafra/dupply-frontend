import { useEffect } from "react";
import { Clock, Loader as Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SellerUnderReviewOverlayProps {
  checkingStatus?: boolean;
}

export function SellerUnderReviewOverlay({ checkingStatus = false }: SellerUnderReviewOverlayProps) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[45] flex touch-none items-center justify-center overflow-hidden overscroll-none p-4 pt-20 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-under-review-title"
      aria-describedby="seller-under-review-description"
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" aria-hidden />

      <Card className="relative z-10 w-full max-w-lg border-amber-500/25 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/15">
            <Clock className="size-8 text-amber-600 dark:text-amber-400" aria-hidden />
          </div>
          <div className="space-y-2">
            <CardTitle id="seller-under-review-title" className="text-2xl font-bold">
              Cadastro em análise
            </CardTitle>
            <CardDescription
              id="seller-under-review-description"
              className="text-base leading-relaxed"
            >
              Seu cadastro foi enviado com sucesso e está{" "}
              <span className="font-medium text-foreground">em análise</span>. Responderemos em até{" "}
              <span className="font-medium text-foreground">24 horas</span>.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm leading-relaxed text-muted-foreground">
          <p>
            Enquanto a análise estiver em andamento, a plataforma permanece indisponível para
            ações operacionais.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {checkingStatus ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                <span>Verificando status do cadastro…</span>
              </>
            ) : (
              <span>Aguardando aprovação da equipe Dupply</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
