import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/forms/FormSection";
import type { SellerRegistrationFormValues } from "@/domain/seller/seller-registration.schema";

function CounterpartyFields({
  baseName,
  index,
}: {
  baseName: "clients" | "suppliers";
  index: number;
}) {
  const form = useFormContext<SellerRegistrationFormValues>();

  return (
    <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
      <FormField
        control={form.control}
        name={`${baseName}.${index}.legalName`}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Razão social</FormLabel>
            <FormControl>
              <Input placeholder="Razão social" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${baseName}.${index}.taxId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>CNPJ</FormLabel>
            <FormControl>
              <Input placeholder="00.000.000/0000-00" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${baseName}.${index}.averageShare`}
        render={({ field }) => (
          <FormItem className="sm:col-span-3">
            <FormLabel>Participação média (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 30%" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function BusinessRelationsStepFields() {
  return (
    <div className="space-y-6">
      <FormSection
        title="Principais clientes"
        description="Informe os 5 principais clientes da empresa."
      >
        {Array.from({ length: 5 }, (_, index) => (
          <CounterpartyFields key={`client-${index}`} baseName="clients" index={index} />
        ))}
      </FormSection>

      <FormSection
        title="Principais fornecedores"
        description="Informe os 5 principais fornecedores da empresa."
      >
        {Array.from({ length: 5 }, (_, index) => (
          <CounterpartyFields key={`supplier-${index}`} baseName="suppliers" index={index} />
        ))}
      </FormSection>
    </div>
  );
}
