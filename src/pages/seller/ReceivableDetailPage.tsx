import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceivableSummary } from "@/components/receivables/ReceivableSummary";
import { DocumentsList } from "@/components/receivables/DocumentsList";
import { fetchReceivableById } from "@/services/receivables.service";
import { ROUTES } from "@/lib/routes";
import type { Receivable } from "@/domain/receivables/receivable.types";

export function ReceivableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [receivable, setReceivable] = useState<Receivable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchReceivableById(id).then((data) => {
      setReceivable(data ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!receivable) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">Recebível não encontrado.</p>
        <Button variant="outline" size="sm" asChild>
          <Link to={ROUTES.seller.receivables.list}>
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to={ROUTES.seller.receivables.list}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{receivable.invoiceNumber}</h1>
          <p className="text-sm text-muted-foreground">{receivable.debtorName}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReceivableSummary receivable={receivable} />
        </div>
        <div>
          <DocumentsList documents={receivable.documents} />
        </div>
      </div>
    </div>
  );
}
