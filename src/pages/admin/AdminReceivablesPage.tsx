import { useEffect, useState } from "react";
import { AdminReceivablesTable } from "@/components/admin/AdminReceivablesTable";
import { AdminReceivablesTableSkeleton } from "@/components/admin/AdminPagesSkeleton";
import { fetchAllReceivables, adminUpdateReceivableStatus } from "@/services/admin.service";
import type { Receivable, ReceivableStatus } from "@/domain/receivables/receivable.types";

export function AdminReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReceivables().then((data) => {
      setReceivables(data);
      setLoading(false);
    });
  }, []);

  async function handleStatusChange(id: string, status: ReceivableStatus) {
    await adminUpdateReceivableStatus(id, status);
    setReceivables((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Recebíveis</h1>
        <p className="text-sm text-muted-foreground">Gerencie e altere o status de todos os recebíveis</p>
      </div>
      {loading ? (
        <AdminReceivablesTableSkeleton />
      ) : (
        <AdminReceivablesTable receivables={receivables} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
