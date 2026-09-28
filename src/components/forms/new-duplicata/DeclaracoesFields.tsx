import { useFormContext } from "react-hook-form";
import { FormSection } from "@/components/forms/FormSection";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { NovaDuplicataFormValues } from "@/domain/duplicata/duplicata.schema";

export function DeclaracoesFields() {
  const form = useFormContext<NovaDuplicataFormValues>();

  return (
    <FormSection title="Declarações antifraude" description="Confirmações para envio à análise.">
      <FormField
        control={form.control}
        name="declaracoes"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-start gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="mt-0.5"
                />
              </FormControl>
              <FormLabel className="text-sm font-normal leading-relaxed cursor-pointer">
                Declaro que as informações são verdadeiras, que os documentos são autênticos e que não há fraude ou
                duplicidade nesta operação, estando ciente das sanções legais em caso de declaração falsa.
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
