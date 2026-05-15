import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ChevronRight, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { fetchSellerReviews } from "@/services/seller-review.service";
import { fetchAllDuplicatas } from "@/services/duplicata.service";
import { countCedentesEmRevisaoCadastral, countDuplicatasAnalisePendente } from "@/domain/risk-analyst/analyst-overview";
import type { SellerReviewSummary } from "@/domain/risk-analyst/seller-review.types";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

function OverviewCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
      {[0, 1].map((i) => (
        <div key={i} className="flex h-full min-h-0 w-full">
          <Card className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
            <CardHeader className="!flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-lg" />
                <Skeleton className="h-5 w-44" />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Skeleton className="h-9 w-10 rounded-md" />
                <Skeleton className="size-5 rounded" />
              </div>
            </CardHeader>
          </Card>
        </div>
      ))}
    </div>
  );
}

function AnalystOverviewCard({
  to,
  title,
  value,
  icon: Icon,
}: Readonly<{
  to: string;
  title: string;
  value: number;
  icon: LucideIcon;
}>) {
  return (
    <Link
      to={to}
      className="group flex h-full min-h-0 w-full flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="flex h-full min-h-0 w-full flex-1 flex-col transition-colors group-hover:bg-muted/40">
        <CardHeader className="!flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 sm:flex-nowrap sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-lg bg-muted p-2">
              <Icon className="size-6 text-primary" />
            </div>
            <CardTitle className="text-lg leading-snug">{title}</CardTitle>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "text-3xl font-bold tabular-nums tracking-tight sm:text-4xl",
                value > 0 && "text-warning"
              )}
            >
              {value}
            </span>
            <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

export function AnalystDashboardPage() {
  const [sellerRows, setSellerRows] = useState<SellerReviewSummary[]>([]);
  const [duplicatas, setDuplicatas] = useState<DuplicataTitulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [reviews, dups] = await Promise.all([fetchSellerReviews(), fetchAllDuplicatas()]);
      if (!cancelled) {
        setSellerRows(reviews);
        setDuplicatas(dups);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cedentesEmRevisao = countCedentesEmRevisaoCadastral(sellerRows);
  const duplicatasPendentes = countDuplicatasAnalisePendente(duplicatas);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Painel do analista</h1>
        <p className="text-sm text-muted-foreground">Cedentes e duplicatas na sua fila de análise.</p>
      </div>

      {loading ? (
        <OverviewCardsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
          <div className="flex h-full min-h-0 w-full">
            <AnalystOverviewCard
              to={ROUTES.analyst.sellers.list}
              title="Cedentes em revisão"
              value={cedentesEmRevisao}
              icon={Building2}
            />
          </div>
          <div className="flex h-full min-h-0 w-full">
            <AnalystOverviewCard
              to={ROUTES.analyst.duplicatas.list}
              title="Duplicatas em revisão"
              value={duplicatasPendentes}
              icon={FileText}
            />
          </div>
        </div>
      )}
    </div>
  );
}
