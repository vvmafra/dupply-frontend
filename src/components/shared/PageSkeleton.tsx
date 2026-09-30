import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Composable loading placeholders. Pages assemble these instead of keeping a
 * hand-written skeleton per screen.
 */

function range(count: number, prefix: string): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index}`);
}

const TEXT_WIDTHS = ["w-28", "w-40", "w-20", "w-24", "w-32", "w-36"] as const;

export type SkeletonColumnKind = "text" | "pill" | "action";

export interface SkeletonColumn {
  label: string;
  align?: "left" | "right";
  kind?: SkeletonColumnKind;
  /** Responsive visibility classes, e.g. "hidden sm:table-cell". */
  className?: string;
}

function normalizeColumn(column: string | SkeletonColumn): SkeletonColumn {
  return typeof column === "string" ? { label: column } : column;
}

function CellSkeleton({ column, index }: { column: SkeletonColumn; index: number }) {
  const right = column.align === "right";
  if (column.kind === "pill") {
    return <Skeleton className={cn("h-5 w-20 rounded-full", right && "ml-auto")} />;
  }
  if (column.kind === "action") {
    return <Skeleton className={cn("h-7 w-24 rounded-md", right && "ml-auto")} />;
  }
  return <Skeleton className={cn("h-4", TEXT_WIDTHS[index % TEXT_WIDTHS.length], right && "ml-auto")} />;
}

export interface TableSkeletonProps {
  /** Header labels (rendered as real headers so the layout does not jump) or a column count. */
  columns: number | ReadonlyArray<string | SkeletonColumn>;
  rows?: number;
  /** Wrap the table in a Card with a title placeholder. */
  card?: boolean;
  className?: string;
}

export function TableSkeleton({ columns, rows = 6, card = false, className }: TableSkeletonProps) {
  const cols: SkeletonColumn[] =
    typeof columns === "number"
      ? range(columns, "col").map((label) => ({ label }))
      : columns.map(normalizeColumn);
  const headless = typeof columns === "number";

  const table = (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {cols.map((column, index) => (
              <TableHead
                key={`${column.label}-${index}`}
                className={cn(column.align === "right" && "text-right", column.className)}
              >
                {headless ? <Skeleton className="h-3 w-16" /> : column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {range(rows, "row").map((rowId) => (
            <TableRow key={rowId}>
              {cols.map((column, index) => (
                <TableCell
                  key={`${rowId}-${index}`}
                  className={cn(column.align === "right" && "text-right", column.className)}
                >
                  <CellSkeleton column={column} index={index} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (!card) {
    return <div className={cn("rounded-md border", className)}>{table}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Skeleton className="size-4 shrink-0 rounded-md" />
            <Skeleton className="h-5 w-44" />
          </div>
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-lg border border-t-0 rounded-t-none">{table}</div>
      </CardContent>
    </Card>
  );
}

export interface MetricCardsSkeletonProps {
  count?: number;
  /** Grid classes; defaults to the admin/seller 4-up layout. */
  className?: string;
}

export function MetricCardsSkeleton({
  count = 4,
  className = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
}: MetricCardsSkeletonProps) {
  return (
    <div className={className}>
      {range(count, "metric").map((id) => (
        <Card key={id}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-24 max-w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="size-10 shrink-0 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export interface CardSkeletonProps {
  /** Number of text lines in the body. */
  lines?: number;
  /** Show a progress bar under the title. */
  progress?: boolean;
  /** Show a full-width button placeholder at the end. */
  action?: boolean;
  /** Show a title row (with an optional badge on the right). */
  title?: boolean;
  className?: string;
}

export function CardSkeleton({
  lines = 2,
  progress = false,
  action = false,
  title = true,
  className,
}: CardSkeletonProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <Skeleton className="size-4 shrink-0 rounded-md" />
              <Skeleton className="h-5 w-44 max-w-[min(100%,12rem)]" />
            </div>
            {progress && <Skeleton className="h-5 w-24 rounded-full" />}
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {progress && <Skeleton className="h-2 w-full rounded-full" />}
        <div className="space-y-3">
          {range(lines, "line").map((id, index) => (
            <div key={id} className="flex items-center gap-2">
              {progress && <Skeleton className="size-4 shrink-0 rounded-full" />}
              <Skeleton className={cn("h-4 flex-1", index % 2 === 1 ? "max-w-md" : "max-w-lg")} />
            </div>
          ))}
        </div>
        {action && <Skeleton className="h-10 w-full rounded-md" />}
      </CardContent>
    </Card>
  );
}

export interface FormSkeletonProps {
  sections?: number;
  fieldsPerSection?: number;
  className?: string;
}

export function FormSkeleton({ sections = 4, fieldsPerSection = 4, className }: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6 max-w-3xl", className)}>
      {range(sections, "section").map((sectionId, sectionIndex) => (
        <div key={sectionId} className="space-y-6">
          {sectionIndex > 0 && <Separator />}
          <div className="space-y-4">
            <div className="space-y-0.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full max-w-lg" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {range(fieldsPerSection, `${sectionId}-field`).map((fieldId, fieldIndex) => (
                <div
                  key={fieldId}
                  className={cn("space-y-1.5", fieldIndex === fieldsPerSection - 1 && "sm:col-span-2")}
                >
                  <Skeleton className={cn("h-3", TEXT_WIDTHS[fieldIndex % TEXT_WIDTHS.length])} />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
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

export interface TimelineSkeletonProps {
  items?: number;
  className?: string;
}

export function TimelineSkeleton({ items = 6, className }: TimelineSkeletonProps) {
  const ids = range(items, "event");
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-52" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative space-y-0">
          {ids.map((id, index) => (
            <div key={id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <Skeleton className="mt-1.5 size-2.5 shrink-0 rounded-full" />
                {index < ids.length - 1 && <div className="my-1 w-px flex-1 min-h-[1.25rem] bg-border" />}
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

export interface ChartCardSkeletonProps {
  /** Tailwind height class for the plot area. */
  height?: string;
  className?: string;
}

export function ChartCardSkeleton({ height = "h-56", className }: ChartCardSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className={cn("w-full rounded-md", height)} />
      </CardContent>
    </Card>
  );
}
