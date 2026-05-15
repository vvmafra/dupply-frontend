import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const METRIC_SKELETON_IDS = ["m1", "m2", "m3", "m4"] as const;
const STEP_SKELETON_IDS = ["s1", "s2", "s3"] as const;
const PREVIEW_ROW_IDS = ["r1", "r2", "r3", "r4", "r5"] as const;
const OVERVIEW_ROW_IDS = ["o1", "o2", "o3", "o4", "o5", "o6"] as const;
const DUPLICATAS_LIST_ROW_IDS = ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8"] as const;

/** Mesmo grid de `SellerDashboardSummary` (4 métricas). */
export function SellerDashboardSummarySkeleton() {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {METRIC_SKELETON_IDS.map((id) => (
        <Card key={id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 min-w-0 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-28 max-w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="size-9 shrink-0 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Espelha `SellerValidationProgress`: título + badge, barra, linhas de step + linha extra. */
export function SellerValidationProgressCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Skeleton className="h-5 w-48 max-w-[min(100%,12rem)]" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="space-y-3">
          {STEP_SKELETON_IDS.map((id) => (
            <div key={id} className="flex items-center gap-2">
              <Skeleton className="size-4 shrink-0 rounded-full" />
              <Skeleton className="h-4 flex-1 max-w-md" />
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
            <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
              <Skeleton className="size-4 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
            <Skeleton className="h-8 w-32 shrink-0 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Cabeçalho com dois botões + tabela (5 linhas), alinhado a `SellerDuplicatasPreview` com dados. */
export function SellerDuplicatasPreviewCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Skeleton className="size-4 shrink-0 rounded-md" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-lg border border-t-0 rounded-t-none overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Sacado</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Análise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PREVIEW_ROW_IDS.map((id) => (
                <TableRow key={id}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36 max-w-[12rem]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
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

/** Mesmo layout de `SellerKycCard`: título com ícone, parágrafo, botão full width. */
export function SellerKycCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Skeleton className="size-4 shrink-0 rounded-md" />
          <Skeleton className="h-5 w-40" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[85%] max-w-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

/** `lg:col-span-2`, ícone + título + descrição + botões + tabela (6 linhas). */
export function SellerValidationDuplicatasOverviewCardSkeleton() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2 min-w-0">
            <Skeleton className="size-5 shrink-0 rounded-md mt-0.5" />
            <div className="space-y-2 min-w-0 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full max-w-lg" />
              <Skeleton className="h-4 w-[66%] max-w-md" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Skeleton className="h-8 w-40 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Sacado</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Análise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {OVERVIEW_ROW_IDS.map((id) => (
                <TableRow key={id}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40 max-w-[14rem]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
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

/** Tabela da página `SellerDuplicatasPage` (cabeçalhos reais + 8 linhas). */
export function SellerDuplicatasListTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Sacado</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Análise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DUPLICATAS_LIST_ROW_IDS.map((id) => (
            <TableRow key={id}>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-44 max-w-[16rem]" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-28 ml-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
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

/** Espelha `NewDuplicataForm`: secções, grelhas, uploads e barra de ações. */
export function NewDuplicataFormSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-4">
        <div className="space-y-0.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-full max-w-xl" />
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-0.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-0.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-full max-w-lg" />
        </div>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-52" />
            <Skeleton className="h-24 w-full max-w-md rounded-md" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-0.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-9 w-full max-w-md" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-24 w-full max-w-md rounded-md" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-0.5">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-full max-w-lg" />
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-52" />
            <Skeleton className="h-9 w-full max-w-md" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-9 w-full max-w-sm" />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-0.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full max-w-xl" />
          <Skeleton className="h-3 w-[92%] max-w-lg" />
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Skeleton className="size-4 shrink-0 rounded-sm mt-0.5" />
            <div className="space-y-2 flex-1 min-w-0 pt-0.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[90%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Skeleton className="h-10 w-48 rounded-md" />
        <div className="flex flex-wrap justify-end gap-2 sm:ml-auto">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>
    </div>
  );
}
