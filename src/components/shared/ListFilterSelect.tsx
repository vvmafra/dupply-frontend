import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LIST_FILTER_ALL = "all";

export type ListFilterOption = {
  value: string;
  label: string;
};

type ListFilterSelectProps = Readonly<{
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly ListFilterOption[];
  /** Default: "Todos" */
  allLabel?: string;
}>;

/** Compact labeled select used on marketplace list pages (same pattern everywhere). */
export function ListFilterSelect({
  id,
  label,
  value,
  onValueChange,
  options,
  allLabel = "Todos",
}: ListFilterSelectProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label htmlFor={id} className="text-muted-foreground font-normal whitespace-nowrap">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} size="sm" className="min-w-[10.5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={LIST_FILTER_ALL}>{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
