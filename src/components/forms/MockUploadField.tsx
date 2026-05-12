import { useState } from "react";
import { Upload, CircleCheck as CheckCircle2, Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sleep } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MockUploadFieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function MockUploadField({ label, hint, required, className }: MockUploadFieldProps) {
  const [state, setState] = useState<"idle" | "uploading" | "done">("idle");

  async function handleUpload() {
    setState("uploading");
    await sleep(800);
    setState("done");
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className={cn(
        "flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
        state === "done" ? "border-success/40 bg-success/5" : "border-input bg-muted/30"
      )}>
        {state === "idle" && (
          <>
            <Upload className="size-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-muted-foreground text-xs truncate">
              {hint ?? "Nenhum arquivo selecionado"}
            </span>
            <Button type="button" size="xs" variant="outline" onClick={handleUpload}>
              Anexar
            </Button>
          </>
        )}
        {state === "uploading" && (
          <>
            <Loader2 className="size-4 animate-spin text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Enviando...</span>
          </>
        )}
        {state === "done" && (
          <>
            <CheckCircle2 className="size-4 text-success shrink-0" />
            <span className="flex-1 text-xs text-success">Arquivo anexado com sucesso</span>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={() => setState("idle")}
            >
              Remover
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
