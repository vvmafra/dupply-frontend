import { Link } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceivableTable } from "@/components/receivables/ReceivableTable";
import { ROUTES } from "@/lib/routes";
import type { Receivable } from "@/domain/receivables/receivable.types";

interface SellerReceivablesTableProps {
  receivables: Receivable[];
}

export function SellerReceivablesTable({ receivables }: SellerReceivablesTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="size-4" />
            Meus recebíveis
          </CardTitle>
          <Button size="sm" asChild>
            <Link to={ROUTES.seller.receivables.new}>
              <Plus className="size-4" />
              Cadastrar
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ReceivableTable
          receivables={receivables}
          detailBasePath="/seller/receivables"
        />
      </CardContent>
    </Card>
  );
}
