import { useFormContext } from "react-hook-form";
import { FormSection } from "@/components/forms/FormSection";
import { RequiredMark } from "@/components/forms/new-duplicata/fields";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { NovaDuplicataFormValues } from "@/domain/duplicata/duplicata.schema";

export function SacadoFields() {
  const form = useFormContext<NovaDuplicataFormValues>();

  return (
    <FormSection title="Sacado" description="Dados do devedor para cobrança.">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="sacadoCnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                CNPJ
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input placeholder="00.000.000/0000-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sacadoRazaoSocial"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                Razão social
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
          name="sacadoEmailFinanceiro"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                E-mail financeiro
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="financeiro@sacado.com.br" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}
