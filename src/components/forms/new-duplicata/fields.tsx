import { useFormContext, type FieldPath } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { NovaDuplicataFormValues } from "@/domain/duplicata/duplicata.schema";
import { cn } from "@/lib/utils";

export function RequiredMark() {
  return <span className="text-destructive"> *</span>;
}

type EnumFieldName = {
  [K in FieldPath<NovaDuplicataFormValues>]: NovaDuplicataFormValues[K] extends string ? K : never;
}[FieldPath<NovaDuplicataFormValues>];

/** Native `<select>` bound to a string-enum field, with labels from a Record. */
export function NativeSelectField<TName extends EnumFieldName>({
  name,
  label,
  options,
  className,
  required = true,
}: Readonly<{
  name: TName;
  label: string;
  options: Record<string, string>;
  className?: string;
  required?: boolean;
}>) {
  const form = useFormContext<NovaDuplicataFormValues>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <RequiredMark />}
          </FormLabel>
          <FormControl>
            <select
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
              )}
              name={field.name}
              value={String(field.value)}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
            >
              {Object.entries(options).map(([value, optionLabel]) => (
                <option key={value} value={value}>
                  {optionLabel}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
