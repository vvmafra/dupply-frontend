import { useFormContext } from "react-hook-form";
import { FormSection } from "@/components/forms/FormSection";
import { RegistrationUploadField } from "@/components/forms/RegistrationUploadField";
import { NativeSelectField } from "@/components/forms/new-duplicata/fields";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { DUPLICATA_COMPROVANTE_LABELS } from "@/domain/duplicata/duplicata-labels.constants";
import type { NovaDuplicataFormValues } from "@/domain/duplicata/duplicata.schema";

export function ComprovanteFields() {
  const form = useFormContext<NovaDuplicataFormValues>();

  return (
    <FormSection title="Comprovante" description="Entrega, aceite ou prestação de serviço.">
      <NativeSelectField
        name="comprovanteTipo"
        label="Tipo de comprovante"
        options={DUPLICATA_COMPROVANTE_LABELS}
        className="max-w-md"
      />
      <FormField
        control={form.control}
        name="comprovanteUploaded"
        render={({ field }) => (
          <FormItem>
            <RegistrationUploadField
              label="Comprovante (entrega, aceite ou prestação)"
              required
              value={field.value}
              filename={form.watch("comprovanteFilename")}
              onChange={(uploaded, name) => {
                field.onChange(uploaded);
                form.setValue("comprovanteFilename", name ?? "");
              }}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
