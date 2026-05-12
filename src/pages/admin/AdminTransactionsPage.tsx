import { useEffect, useState } from "react";
import { AdminTransactionTable } from "@/components/admin/AdminTransactionTable";
import { AdminBlockchainEventTimeline } from "@/components/admin/AdminBlockchainEventTimeline";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { fetchTransactions } from "@/services/blockchain.service";
import { Activity, CircleCheck as CheckCircle2, Circle as XCircle, Clock } from "lucide-react";
import type { BlockchainTransaction } from "@/domain/blockchain/blockchain.types";

export function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const success = transactions.filter((t) => t.status === "SUCCESS").length;
  const failed = transactions.filter((t) => t.status === "FAILED").length;
  const pending = transactions.filter((t) => t.status === "PENDING").length;

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Transações blockchain</h1>
        <p className="text-sm text-muted-foreground">
          Registro de eventos na rede Stellar Testnet
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard title="Total" value={transactions.length} icon={Activity} />
        <AdminMetricCard title="Confirmadas" value={success} icon={CheckCircle2} trend="up" />
        <AdminMetricCard title="Falhas" value={failed} icon={XCircle} trend="down" />
        <AdminMetricCard title="Pendentes" value={pending} icon={Clock} trend="neutral" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminTransactionTable transactions={transactions} />
        </div>
        <div>
          <AdminBlockchainEventTimeline transactions={transactions} limit={6} />
        </div>
      </div>
    </div>
  );
}
