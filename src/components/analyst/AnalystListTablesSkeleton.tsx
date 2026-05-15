import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SELLER_SKEL_ROWS = ["as1", "as2", "as3", "as4", "as5", "as6"] as const;
const DUP_SKEL_ROWS = ["ad1", "ad2", "ad3", "ad4", "ad5", "ad6"] as const;

/** Mesma estrutura da tabela em `AnalystSellersPage`. */
export function AnalystSellersTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Razão social</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead className="text-right">Score (IA)</TableHead>
            <TableHead>Revisão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SELLER_SKEL_ROWS.map((id) => (
            <TableRow key={id}>
              <TableCell>
                <Skeleton className="h-4 w-48 max-w-[14rem]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-36" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Mesma estrutura da tabela em `AnalystDuplicatasPage`. */
export function AnalystDuplicatasTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cedente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Análise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DUP_SKEL_ROWS.map((id) => (
            <TableRow key={id}>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40 max-w-[12rem]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
