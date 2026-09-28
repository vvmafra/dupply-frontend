import { AdminReceivablesTable } from "@/components/admin/AdminReceivablesTable";
import { TableSkeleton } from "@/components/shared/PageSkeleton";
import { useAsyncData } from "@/hooks/use-async-data";
import { fetchAllReceivables, adminUpdateReceivableStatus } from "@/services/admin.service";
import type { ReceivableStatus } from "@/domain/receivables/receivable.types";

const TABLE_COLUMNS = [
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

export function AdminReceivablesPage() {
  const { data, loading, setData } = useAsyncData(fetchAllReceivables, []);
  const receivables = data ?? [];

  async function handleStatusChange(id: string, status: ReceivableStatus) {
    await adminUpdateReceivableStatus(id, status);
    setData((prev) => prev?.map((r) => (r.id === id ? { ...r, status } : r)) ?? prev);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Recebíveis</h1>
        <p className="text-sm text-muted-foreground">Gerencie e altere o status de todos os recebíveis</p>
      </div>
      {loading ? (
        <TableSkeleton card columns={TABLE_COLUMNS} />
      ) : (
        <AdminReceivablesTable receivables={receivables} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
