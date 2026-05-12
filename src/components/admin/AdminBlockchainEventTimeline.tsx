import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatShortHash, formatDateTime } from "@/lib/formatters";
import { getEventTypeLabel, getTransactionStatusColor, getTransactionStatusLabel } from "@/domain/blockchain/blockchain.helpers";
import { cn } from "@/lib/utils";
import type { BlockchainTransaction } from "@/domain/blockchain/blockchain.types";

interface AdminBlockchainEventTimelineProps {
  transactions: BlockchainTransaction[];
  limit?: number;
}

export function AdminBlockchainEventTimeline({ transactions, limit = 8 }: AdminBlockchainEventTimelineProps) {
  const items = transactions.slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Eventos recentes na rede</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative space-y-0">
          {items.map((tx, idx) => (
            <div key={tx.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "size-2.5 rounded-full mt-1.5 shrink-0",
                  tx.status === "SUCCESS" ? "bg-success" : tx.status === "FAILED" ? "bg-destructive" : "bg-warning"
                )} />
                {idx < items.length - 1 && (
                  <div className="w-px flex-1 bg-border my-1" />
                )}
              </div>
              <div className="pb-4 min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{getEventTypeLabel(tx.eventType)}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {formatShortHash(tx.transactionHash)} · {tx.relatedSellerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant="outline"
                      className={cn(getTransactionStatusColor(tx.status), "text-xs")}
                    >
                      {getTransactionStatusLabel(tx.status)}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(tx.createdAt)} · Ledger #{tx.ledger.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
