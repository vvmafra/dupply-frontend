import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const M4 = ["m1", "m2", "m3", "m4"] as const;
const R6 = ["r1", "r2", "r3", "r4", "r5", "r6"] as const;
const T6 = ["t1", "t2", "t3", "t4", "t5", "t6"] as const;
const TL6 = ["tl1", "tl2", "tl3", "tl4", "tl5", "tl6"] as const;

/** Linha de atalhos do painel admin (ex.: link Cedentes). */
function AdminDashboardShortcutsSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-9 w-56 rounded-md" />
    </div>
  );
}

/** Quatro `AdminMetricCard` + gráficos + timeline (estrutura do `AdminDashboardPage`). */
export function AdminDashboardBodySkeleton() {
  return (
    <>
      <AdminDashboardShortcutsSkeleton />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {M4.map((id) => (
          <Card key={id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="size-10 shrink-0 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-56 w-full rounded-md" />
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-44" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full rounded-md" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>

      <AdminBlockchainTimelineSkeleton />
    </>
  );
}

/** Lista de cedentes admin (`AdminSellersPage`). */
export function AdminSellersTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cedente</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead className="text-right">Score (IA)</TableHead>
            <TableHead>Analista</TableHead>
            <TableHead>Data revisão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {R6.map((id) => (
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
                <Skeleton className="h-5 w-28 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** `AdminValidationTable`: Card + tabela com colunas alinhadas. */
export function AdminValidationTableSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-56" />
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead className="hidden sm:table-cell">CNPJ</TableHead>
              <TableHead className="hidden md:table-cell">Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {R6.map((id) => (
              <TableRow key={id}>
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-44 max-w-[12rem]" />
                    <Skeleton className="h-3 w-40 max-w-[11rem]" />
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-28 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Skeleton className="h-7 w-20 rounded-md" />
                    <Skeleton className="h-7 w-20 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/** `AdminReceivablesTable`: Card + tabela com coluna «Ação rápida». */
export function AdminReceivablesTableSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-md" />
          <Skeleton className="h-5 w-44" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Duplicata</TableHead>
                <TableHead>Sacado</TableHead>
                <TableHead className="text-right">Valor Bruto</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ação rápida</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {R6.map((id) => (
                <TableRow key={id}>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36 max-w-[10rem]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-7 w-36 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="size-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/** Timeline lateral (`AdminBlockchainEventTimeline`). */
export function AdminBlockchainTimelineSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-52" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative space-y-0">
          {TL6.map((id, idx) => (
            <div key={id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <Skeleton className="mt-1.5 size-2.5 shrink-0 rounded-full" />
                {idx < TL6.length - 1 && <div className="my-1 w-px flex-1 min-h-[1.25rem] bg-border" />}
              </div>
              <div className="min-w-0 flex-1 space-y-2 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-full max-w-xs" />
                  </div>
                  <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
                </div>
                <Skeleton className="h-3 w-56 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** `AdminTransactionTable` + métricas + coluna timeline (`AdminTransactionsPage`). */
export function AdminTransactionsBodySkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {M4.map((id) => (
          <Card key={id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="size-10 shrink-0 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-52" />
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
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {T6.map((id) => (
                    <TableRow key={id}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-4 w-32 max-w-[8rem]" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="size-8 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <AdminBlockchainTimelineSkeleton />
        </div>
      </div>
    </>
  );
}
