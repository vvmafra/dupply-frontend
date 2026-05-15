import { useState } from "react";
import { Upload, CircleCheck as CheckCircle2, Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sleep } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RegistrationUploadFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: boolean;
  onChange: (uploaded: boolean) => void;
  className?: string;
}

export function RegistrationUploadField({
  label,
  description,
  required,
  value,
  onChange,
  className,
}: RegistrationUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    setUploading(true);
    await sleep(800);
    onChange(true);
    setUploading(false);
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
          value ? "border-success/40 bg-success/5" : "border-input bg-muted/30"
        )}
      >
        {!value && !uploading && (
          <>
            <Upload className="size-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-muted-foreground text-xs truncate">
              Nenhum arquivo selecionado
            </span>
            <Button type="button" size="xs" variant="outline" onClick={handleUpload}>
              Anexar
            </Button>
          </>
        )}
        {uploading && (
          <>
            <Loader2 className="size-4 animate-spin text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Enviando...</span>
          </>
        )}
        {value && !uploading && (
          <>
            <CheckCircle2 className="size-4 text-success shrink-0" />
            <span className="flex-1 text-xs text-success">Arquivo anexado com sucesso</span>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={() => onChange(false)}
            >
              Remover
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
