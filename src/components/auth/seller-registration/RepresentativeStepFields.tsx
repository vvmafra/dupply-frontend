import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/forms/FormSection";
import type { SellerRegistrationFormValues } from "@/domain/seller/seller-registration.schema";

export function RepresentativeStepFields() {
  const form = useFormContext<SellerRegistrationFormValues>();

  return (
    <FormSection
      title="Representante legal"
      description="Informe os dados pessoais do representante com poderes de assinatura."
    >
      <FormField
        control={form.control}
        name="representativeName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome completo</FormLabel>
            <FormControl>
              <Input placeholder="Nome do representante legal" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="representativeCpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input placeholder="000.000.000-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="representativePhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone pessoal</FormLabel>
              <FormControl>
                <Input placeholder="(11) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="representativeEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail pessoal</FormLabel>
            <FormControl>
              <Input type="email" placeholder="representante@email.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
