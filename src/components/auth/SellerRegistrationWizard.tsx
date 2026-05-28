import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { useAuth } from "@/contexts/AuthContext";
import {
  createInitialSellerRegistrationValues,
  SELLER_REGISTRATION_STEPS,
  sellerRegistrationDocumentsSchemaHttp,
  type SellerRegistrationFormValues,
  type SellerRegistrationStepId,
} from "@/domain/seller/seller-registration.schema";
import { getSellerRegistrationStepAutofill } from "@/domain/seller/seller-registration.autofill";
import { ROUTES } from "@/lib/routes";
import {
  finishSellerRegistration,
  loadSellerRegistrationState,
  mapRegistrationError,
  registerSellerAccess,
  saveSellerRegistrationStep,
} from "@/services/seller-registration.service";

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

function isMetadataStep(
  stepId: SellerRegistrationStepId,
): stepId is "company" | "representative" | "relations" {
  return stepId === "company" || stepId === "representative" || stepId === "relations";
}

export function SellerRegistrationWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [registeredSellerId, setRegisteredSellerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, loginWithSession } = useAuth();

  const form = useForm<SellerRegistrationFormValues>({
    defaultValues: createInitialSellerRegistrationValues(),
    mode: "onTouched",
  });

  const currentStep = SELLER_REGISTRATION_STEPS[currentStepIndex];
  const progress = useMemo(
    () => ((currentStepIndex + 1) / SELLER_REGISTRATION_STEPS.length) * 100,
    [currentStepIndex],
  );

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    let cancelled = false;
    setIsResuming(true);

    void (async () => {
      try {
        const state = await loadSellerRegistrationState();
        if (cancelled) return;

        if (state.status === "created") {
          setRegisteredSellerId(state.sellerId);
          form.reset(state.formValues);
          setCurrentStepIndex(state.stepIndex);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(mapRegistrationError(err));
        }
      } finally {
        if (!cancelled) {
          setIsResuming(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, form]);

  async function validateCurrentStep() {
    const schema =
      currentStep.id === "documents" ? sellerRegistrationDocumentsSchemaHttp : currentStep.schema;
    const result = await schema.safeParseAsync(form.getValues());
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

    setSubmitting(true);
    try {
      if (currentStep.id === "access") {
        const { sellerId, session } = await registerSellerAccess(form.getValues());
        loginWithSession(session);
        setRegisteredSellerId(sellerId);
      } else if (registeredSellerId && isMetadataStep(currentStep.id)) {
        await saveSellerRegistrationStep(currentStep.id, registeredSellerId, form.getValues());
      }
      setCurrentStepIndex((index) => Math.min(index + 1, SELLER_REGISTRATION_STEPS.length - 1));
    } catch (err) {
      toast.error(mapRegistrationError(err));
    } finally {
      setSubmitting(false);
    }
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

  async function handleSubmit() {
    if (currentStep.id !== "documents") return;
    if (!registeredSellerId) {
      toast.error("Não foi possível identificar seu cadastro. Faça login novamente.");
      return;
    }

    setSubmitting(true);
    try {
      await finishSellerRegistration(registeredSellerId);
      toast.success(
        "Cadastro concluído! Seu perfil está em análise. Responderemos em até 24 horas.",
      );
      navigate(ROUTES.sellerRegistrationComplete, {
        replace: true,
        state: { registrationComplete: true },
      });
    } catch (err) {
      toast.error(mapRegistrationError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const isLastStep = currentStepIndex === SELLER_REGISTRATION_STEPS.length - 1;
  const isBusy = submitting || isResuming;

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
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (isLastStep) {
                void handleSubmit();
              }
            }}
            className="space-y-6"
          >
            <StepFields stepId={currentStep.id} />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0 || isBusy}
              >
                Voltar
              </Button>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAutofill}
                  disabled={isBusy}
                >
                  Preencher automaticamente
                </Button>

                {isLastStep ? (
                  <Button type="submit" disabled={isBusy}>
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
                  <Button type="button" onClick={() => void handleNext()} disabled={isBusy}>
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Continuar"
                    )}
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
