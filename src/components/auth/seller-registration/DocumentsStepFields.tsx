import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FormSection } from "@/components/forms/FormSection";
import { RegistrationUploadField } from "@/components/forms/RegistrationUploadField";
import { REQUIRED_DOCUMENTS } from "@/domain/seller/seller.validation";
import type { SellerRegistrationFormValues } from "@/domain/seller/seller-registration.schema";

export function DocumentsStepFields() {
  const form = useFormContext<SellerRegistrationFormValues>();
  const requiredDocuments = REQUIRED_DOCUMENTS.filter((document) => document.required);
  const optionalDocuments = REQUIRED_DOCUMENTS.filter((document) => !document.required);

  return (
    <div className="space-y-6">
      <FormSection
        title="Documentos obrigatórios"
        description="Anexe todos os documentos exigidos para abertura de cadastro no fundo."
      >
        {requiredDocuments.map((document) => (
          <FormField
            key={document.id}
            control={form.control}
            name={`documents.${document.id}`}
            render={({ field }) => (
              <FormItem>
                <RegistrationUploadField
                  label={document.name}
                  description={document.description}
                  required
                  value={Boolean(field.value)}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <FormField
          control={form.control}
          name="documents"
          render={() => (
            <FormItem>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection
        title="Documentos complementares"
        description="Anexe quando aplicável ao perfil da empresa."
      >
        {optionalDocuments.map((document) => (
          <FormField
            key={document.id}
            control={form.control}
            name={`documents.${document.id}`}
            render={({ field }) => (
              <FormItem>
                <RegistrationUploadField
                  label={document.name}
                  description={document.description}
                  value={Boolean(field.value)}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
        ))}
      </FormSection>
    </div>
  );
}
