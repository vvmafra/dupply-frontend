import { useFormContext } from "react-hook-form";
import { FormSection } from "@/components/forms/FormSection";
import { RegistrationUploadField } from "@/components/forms/RegistrationUploadField";
import { NativeSelectField, RequiredMark } from "@/components/forms/new-duplicata/fields";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DUPLICATA_FISCAL_LABELS } from "@/domain/duplicata/duplicata-labels.constants";
import type { NovaDuplicataFormValues } from "@/domain/duplicata/duplicata.schema";

export function DocumentoFiscalFields() {
  const form = useFormContext<NovaDuplicataFormValues>();

  return (
    <FormSection title="Documento fiscal" description="Tipo, chave e anexo (PDF ou XML simulado).">
      <div className="grid gap-3 sm:grid-cols-2">
        <NativeSelectField
          name="documentoFiscalTipo"
          label="Tipo do documento"
          options={DUPLICATA_FISCAL_LABELS}
        />
        <FormField
          control={form.control}
          name="documentoFiscalChave"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>
                Número / chave de acesso
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="fiscalUploaded"
        render={({ field }) => (
          <FormItem>
            <RegistrationUploadField
              label="Arquivo fiscal (PDF ou XML)"
              required
              value={field.value}
              filename={form.watch("fiscalFilename")}
              onChange={(uploaded, name) => {
                field.onChange(uploaded);
                form.setValue("fiscalFilename", name ?? "");
              }}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
