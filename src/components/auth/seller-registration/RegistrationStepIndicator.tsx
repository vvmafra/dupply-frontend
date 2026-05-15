import { cn } from "@/lib/utils";
import type { SellerRegistrationStepId } from "@/domain/seller/seller-registration.schema";
import { SELLER_REGISTRATION_STEPS } from "@/domain/seller/seller-registration.schema";

interface RegistrationStepIndicatorProps {
  currentStep: SellerRegistrationStepId;
}

export function RegistrationStepIndicator({ currentStep }: RegistrationStepIndicatorProps) {
  const currentIndex = SELLER_REGISTRATION_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <ol className="grid gap-2 sm:grid-cols-5">
      {SELLER_REGISTRATION_STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <li
            key={step.id}
            className={cn(
              "rounded-lg border px-3 py-2 text-left transition-colors",
              isActive && "border-primary bg-primary/5",
              isCompleted && "border-success/30 bg-success/5",
              !isActive && !isCompleted && "border-border bg-muted/20"
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Etapa {index + 1}
            </p>
            <p className="text-sm font-semibold">{step.title}</p>
          </li>
        );
      })}
    </ol>
  );
}
