import { useFormContext } from "react-hook-form";
import { FormSection } from "@/components/forms/FormSection";
import { RequiredMark } from "@/components/forms/new-duplicata/fields";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DUPLICATA_TIPO_LABELS } from "@/domain/duplicata/duplicata-labels.constants";
import type { NovaDuplicataFormValues } from "@/domain/duplicata/duplicata.schema";
import type { DuplicataTipo } from "@/domain/duplicata/duplicata.types";

const TIPOS = Object.keys(DUPLICATA_TIPO_LABELS) as DuplicataTipo[];

export function TituloFields() {
  const form = useFormContext<NovaDuplicataFormValues>();

  return (
    <FormSection title="Título" description="Identificação da duplicata (versão hackathon).">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                Tipo
                <RequiredMark />
              </FormLabel>
              <div className="flex flex-wrap gap-4 text-sm">
                {TIPOS.map((tipo) => (
                  <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value={tipo}
                      checked={field.value === tipo}
                      onChange={() => field.onChange(tipo)}
                      onBlur={field.onBlur}
                    />
                    {DUPLICATA_TIPO_LABELS[tipo]}
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numeroDuplicata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Número da duplicata
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numeroFatura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Número da fatura
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Valor (R$)
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input type="number" step="any" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataEmissao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Data de emissão
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataVencimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Data de vencimento
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}
