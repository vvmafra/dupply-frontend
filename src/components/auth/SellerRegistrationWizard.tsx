import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { AccessStepFields } from "@/components/auth/seller-registration/AccessStepFields";
import { BusinessRelationsStepFields } from "@/components/auth/seller-registration/BusinessRelationsStepFields";
import { CompanyStepFields } from "@/components/auth/seller-registration/CompanyStepFields";
import { DocumentsStepFields } from "@/components/auth/seller-registration/DocumentsStepFields";
import { RegistrationStepIndicator } from "@/components/auth/seller-registration/RegistrationStepIndicator";
import { RepresentativeStepFields } from "@/components/auth/seller-registration/RepresentativeStepFields";
import {
  createInitialSellerRegistrationValues,
  SELLER_REGISTRATION_STEPS,
  sellerRegistrationSchema,
  type SellerRegistrationFormValues,
  type SellerRegistrationStepId,
} from "@/domain/seller/seller-registration.schema";
import { getSellerRegistrationStepAutofill } from "@/domain/seller/seller-registration.autofill";
import { ROUTES } from "@/lib/routes";
import { registerSeller } from "@/services/seller-registration.service";

function StepFields({ stepId }: { stepId: SellerRegistrationStepId }) {
  switch (stepId) {
    case "access":
      return <AccessStepFields />;
    case "company":
      return <CompanyStepFields />;
    case "representative":
      return <RepresentativeStepFields />;
    case "relations":
      return <BusinessRelationsStepFields />;
    case "documents":
      return <DocumentsStepFields />;
  }
}

export function SellerRegistrationWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SellerRegistrationFormValues>({
    defaultValues: createInitialSellerRegistrationValues(),
    mode: "onTouched",
  });

  const currentStep = SELLER_REGISTRATION_STEPS[currentStepIndex];
  const progress = useMemo(
    () => ((currentStepIndex + 1) / SELLER_REGISTRATION_STEPS.length) * 100,
    [currentStepIndex]
  );

  async function validateCurrentStep() {
    const result = await currentStep.schema.safeParseAsync(form.getValues());
    if (result.success) {
      return true;
    }

    for (const issue of result.error.issues) {
      const fieldName = issue.path.join(".") as keyof SellerRegistrationFormValues | string;
      form.setError(fieldName as never, { message: issue.message });
    }

    return false;
  }

  async function handleNext() {
    form.clearErrors();
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    setCurrentStepIndex((index) => Math.min(index + 1, SELLER_REGISTRATION_STEPS.length - 1));
  }

  function handleBack() {
    form.clearErrors();
    setCurrentStepIndex((index) => Math.max(index - 1, 0));
  }

  function handleAutofill() {
    form.clearErrors();
    const values = getSellerRegistrationStepAutofill(currentStep.id);

    if (values.documents) {
      form.setValue("documents", {
        ...form.getValues("documents"),
        ...values.documents,
      });
    }

    for (const [field, value] of Object.entries(values)) {
      if (field === "documents") continue;
      form.setValue(field as keyof SellerRegistrationFormValues, value as never, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }

  async function handleSubmit(values: SellerRegistrationFormValues) {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    const result = await sellerRegistrationSchema.safeParseAsync(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const fieldName = issue.path.join(".") as keyof SellerRegistrationFormValues | string;
        form.setError(fieldName as never, { message: issue.message });
      }
      return;
    }

    setSubmitting(true);
    const response = await registerSeller(result.data);
    if (response.success) {
      navigate(ROUTES.sellerRegistrationComplete, {
        replace: true,
        state: { registrationComplete: true },
      });
    }
    setSubmitting(false);
  }

  const isLastStep = currentStepIndex === SELLER_REGISTRATION_STEPS.length - 1;

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Cadastro de cedente</CardTitle>
          <CardDescription>
            Preencha as etapas e anexe a documentação exigida para análise do fundo.
          </CardDescription>
        </div>
        <RegistrationStepIndicator currentStep={currentStep.id} />
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{currentStep.title}</span>
            <span className="text-muted-foreground">
              Etapa {currentStepIndex + 1} de {SELLER_REGISTRATION_STEPS.length}
            </span>
          </div>
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <StepFields stepId={currentStep.id} />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0 || submitting}
              >
                Voltar
              </Button>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAutofill}
                  disabled={submitting}
                >
                  Preencher automaticamente
                </Button>

                {isLastStep ? (
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Enviando cadastro...
                      </>
                    ) : (
                      "Finalizar cadastro"
                    )}
                  </Button>
                ) : (
                  <Button type="button" onClick={handleNext} disabled={submitting}>
                    Continuar
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
