import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReceivableTable } from "@/components/receivables/ReceivableTable";
import { ROUTES } from "@/lib/routes";
import type { Receivable, ReceivableStatus } from "@/domain/receivables/receivable.types";
import { RECEIVABLE_STATUS_LABELS } from "@/domain/receivables/receivable.constants";

interface AdminReceivablesTableProps {
  receivables: Receivable[];
  onStatusChange: (id: string, status: ReceivableStatus) => void;
}

const ALL_STATUSES = Object.entries(RECEIVABLE_STATUS_LABELS) as [ReceivableStatus, string][];

export function AdminReceivablesTable({ receivables, onStatusChange }: AdminReceivablesTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="size-4" />
          Todos os recebíveis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ReceivableTable
          receivables={receivables}
          detailBasePath={ROUTES.admin.receivables}
          extraColumn={{
            header: "Ação rápida",
            render: (r) => (
              <Select
                value={r.status}
                onValueChange={(val) => onStatusChange(r.id, val as ReceivableStatus)}
              >
                <SelectTrigger className="h-7 text-xs w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map(([status, label]) => (
                    <SelectItem key={status} value={status} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ),
          }}
        />
      </CardContent>
    </Card>
  );
}
