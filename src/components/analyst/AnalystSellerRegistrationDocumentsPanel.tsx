import { FileText, FileWarning, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { REQUIRED_DOCUMENTS } from "@/domain/seller/seller.validation";
import type { SellerRegistrationDocumentFile } from "@/domain/risk-analyst/seller-review.types";
import { cn } from "@/lib/utils";

function formatUploadedAt(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function AnalystSellerRegistrationDocumentsPanel({
  files,
  className,
}: Readonly<{
  files: SellerRegistrationDocumentFile[];
  className?: string;
}>) {
  const byId = new Map(files.map((f) => [f.documentId, f]));

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <Paperclip className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base leading-tight">Documentos do cadastro</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Mesmos itens exigidos no formulário de registro do cedente. Arquivos fictícios para demonstração.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-0 px-0 pb-4 pt-0">
        <div className="max-h-[min(70vh,720px)] space-y-0 overflow-y-auto px-6">
          <DocumentSection
            title="Obrigatórios"
            documents={REQUIRED_DOCUMENTS.filter((d) => d.required)}
            byId={byId}
          />
          <Separator className="my-4" />
          <DocumentSection
            title="Opcionais"
            documents={REQUIRED_DOCUMENTS.filter((d) => !d.required)}
            byId={byId}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentSection({
  title,
  documents,
  byId,
}: Readonly<{
  title: string;
  documents: (typeof REQUIRED_DOCUMENTS)[number][];
  byId: Map<string, SellerRegistrationDocumentFile>;
}>) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="space-y-2">
        {documents.map((doc) => {
          const file = byId.get(doc.id);
          return (
            <li
              key={doc.id}
              className="rounded-lg border border-border/80 bg-card/40 px-3 py-2.5 transition-colors hover:bg-muted/30"
            >
              <div className="flex gap-3">
                <div className="mt-0.5 shrink-0">
                  {file ? (
                    <FileText className="size-4 text-primary" aria-hidden />
                  ) : (
                    <FileWarning className="size-4 text-amber-500/90" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-snug">{doc.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{doc.description}</p>
                  {file ? (
                    <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 space-y-0.5 text-xs">
                        <p className="truncate font-mono text-foreground/90">{file.fileName}</p>
                        <p className="text-muted-foreground">Enviado em {formatUploadedAt(file.uploadedAt)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled
                        title="Demonstração — arquivo não armazenado neste protótipo"
                      >
                        Preview
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        Não anexado
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
