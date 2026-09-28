import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SuccessViewAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline";
}

export interface SuccessViewProps {
  title: string;
  description: React.ReactNode;
  actions: SuccessViewAction[];
  className?: string;
}

/** Full-page confirmation used after submitting a duplicata or accepting a proposal. */
export function SuccessView({ title, description, actions, className }: SuccessViewProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto w-full animate-in fade-in zoom-in-95 duration-300 py-12",
        className,
      )}
    >
      <div className="w-full bg-card/60 border border-border shadow-2xl backdrop-blur-md rounded-2xl p-8 space-y-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/15 text-success mx-auto shadow-[0_0_20px_rgba(34,197,94,0.15)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-card-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-col gap-2.5 pt-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant ?? "default"}
              onClick={action.onClick}
              className="w-full font-medium h-10"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
