import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatShortHash, formatDateTime } from "@/lib/formatters";
import {
  getEventTypeLabel,
  getTransactionStatusColor,
  getTransactionStatusLabel,
} from "@/domain/blockchain/blockchain.helpers";
import { cn } from "@/lib/utils";
import type { BlockchainTransaction } from "@/domain/blockchain/blockchain.types";

interface AdminTransactionTableProps {
  transactions: BlockchainTransaction[];
}

export function AdminTransactionTable({ transactions }: AdminTransactionTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Transações na blockchain</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hash</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden sm:table-cell">Duplicata</TableHead>
              <TableHead className="hidden lg:table-cell">Ledger</TableHead>
              <TableHead className="hidden lg:table-cell">Data/Hora</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono text-xs">{formatShortHash(tx.transactionHash)}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {getEventTypeLabel(tx.eventType)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm">
                  {tx.relatedSellerName}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  #{tx.ledger.toLocaleString()}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {formatDateTime(tx.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(getTransactionStatusColor(tx.status), "text-xs")}
                  >
                    {getTransactionStatusLabel(tx.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    asChild
                  >
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver no explorador"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
