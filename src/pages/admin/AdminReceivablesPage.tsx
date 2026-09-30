import { toast } from "sonner";
import { AdminDuplicatasTable } from "@/components/admin/AdminDuplicatasTable";
import { AdminReceivablesTable } from "@/components/admin/AdminReceivablesTable";
import { TableSkeleton } from "@/components/shared/PageSkeleton";
import { useAsyncData } from "@/hooks/use-async-data";
import { resolveApiMode } from "@/lib/env";
import { fetchAllReceivables, adminUpdateReceivableStatus } from "@/services/admin.service";
import { fetchAllDuplicatas } from "@/services/duplicata.service";
import type { ReceivableStatus } from "@/domain/receivables/receivable.types";

const LEGACY_COLUMNS = [
  "Duplicata",
  "Sacado",
  { label: "Valor Bruto", align: "right" as const },
  "Vencimento",
  "Score",
  { label: "Risco", kind: "pill" as const },
  { label: "Status", kind: "pill" as const },
  { label: "Ação rápida", kind: "action" as const },
  { label: "", kind: "action" as const },
];

const HTTP_COLUMNS = [
  "Duplicata",
  "Cedente",
  "Sacado",
  { label: "Valor", align: "right" as const },
  { label: "Captação", align: "right" as const },
  { label: "Etapa", kind: "pill" as const },
  { label: "", kind: "action" as const },
];

/** Mock: the prototype's receivables dataset. HTTP: every duplicata at its backend stage. */
export function AdminReceivablesPage() {
  const isHttp = resolveApiMode() === "http";
  const legacy = useAsyncData(fetchAllReceivables, [], { enabled: !isHttp });
  const live = useAsyncData(fetchAllDuplicatas, [], { enabled: isHttp });

  async function handleStatusChange(id: string, status: ReceivableStatus) {
    try {
      await adminUpdateReceivableStatus(id, status);
      legacy.setData((prev) => prev?.map((r) => (r.id === id ? { ...r, status } : r)) ?? prev);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível alterar o status.");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Recebíveis</h1>
        <p className="text-sm text-muted-foreground">
          {isHttp
            ? "Todas as duplicatas da plataforma, em qualquer etapa do ciclo"
            : "Gerencie e altere o status de todos os recebíveis"}
        </p>
      </div>
      {isHttp ? (
        live.loading ? (
          <TableSkeleton card columns={HTTP_COLUMNS} />
        ) : (
          <AdminDuplicatasTable duplicatas={live.data ?? []} />
        )
      ) : legacy.loading ? (
        <TableSkeleton card columns={LEGACY_COLUMNS} />
      ) : (
        <AdminReceivablesTable receivables={legacy.data ?? []} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
