import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/forms/FormSection";
import type { SellerRegistrationFormValues } from "@/domain/seller/seller-registration.schema";

export function AccessStepFields() {
  const form = useFormContext<SellerRegistrationFormValues>();

  return (
    <FormSection
      title="Credenciais de acesso"
      description="Esses dados serão usados para entrar na plataforma após a análise cadastral."
    >
      <FormField
        control={form.control}
        name="responsibleName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do responsável</FormLabel>
            <FormControl>
              <Input placeholder="Nome completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail de acesso</FormLabel>
            <FormControl>
              <Input type="email" placeholder="seu@empresa.com.br" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Mínimo de 8 caracteres" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Repita a senha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}
