import { useFormContext } from "react-hook-form";
import { FormSection } from "@/components/forms/FormSection";
import { NativeSelectField, RequiredMark } from "@/components/forms/new-duplicata/fields";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DUPLICATA_ACEITE_LABELS } from "@/domain/duplicata/duplicata-labels.constants";
import type { NovaDuplicataFormValues } from "@/domain/duplicata/duplicata.schema";

export function AceiteAntecipacaoFields() {
  const form = useFormContext<NovaDuplicataFormValues>();

  return (
    <FormSection title="Aceite e antecipação" description="Status perante o sacado e valor pretendido.">
      <NativeSelectField
        name="statusAceiteSacado"
        label="Status do aceite (sacado)"
        options={DUPLICATA_ACEITE_LABELS}
        className="max-w-md"
      />
      <FormField
        control={form.control}
        name="valorDesejadoAntecipacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Valor desejado para antecipação (R$)
              <RequiredMark />
            </FormLabel>
            <FormControl>
              <Input type="number" step="any" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
