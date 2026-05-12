import { useState } from "react";
import { Upload, CircleCheck as CheckCircle2, Clock, Circle as XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDocumentStatusLabel, getDocumentStatusColor } from "@/domain/documents/document.constants";
import { cn, sleep } from "@/lib/utils";
import type { DocumentItem } from "@/domain/documents/document.types";

interface SellerDocumentChecklistProps {
  documents: DocumentItem[];
  onDocumentsChange: (documents: DocumentItem[]) => void;
}

export function SellerDocumentChecklist({ documents, onDocumentsChange }: SellerDocumentChecklistProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [simulatingAll, setSimulatingAll] = useState(false);

  const progress = Math.round(
    (documents.filter((d) => d.status !== "PENDING").length / documents.length) * 100
  );

  async function handleUpload(docId: string) {
    setUploading(docId);
    await sleep(900);
    onDocumentsChange(
      documents.map((d) => (d.id === docId ? { ...d, status: "UPLOADED", uploadedAt: new Date().toISOString() } : d))
    );
    setUploading(null);
  }

  async function handleSimulateAll() {
    setSimulatingAll(true);
    await sleep(1200);
    onDocumentsChange(
      documents.map((d) => ({ ...d, status: "UPLOADED" as const, uploadedAt: new Date().toISOString() }))
    );
    setSimulatingAll(false);
  }

  const statusIcon = (status: DocumentItem["status"]) => {
    if (status === "APPROVED") return <CheckCircle2 className="size-4 text-success shrink-0" />;
    if (status === "REJECTED") return <XCircle className="size-4 text-destructive shrink-0" />;
    if (status !== "PENDING") return <Clock className="size-4 text-info shrink-0" />;
    return <Clock className="size-4 text-muted-foreground shrink-0" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso dos documentos</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSimulateAll}
          disabled={simulatingAll || progress === 100}
        >
          {simulatingAll ? <RefreshCw className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Simular envio de todos
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Documentos obrigatórios</h3>
        {documents.filter((d) => d.required).map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            uploading={uploading === doc.id}
            onUpload={() => handleUpload(doc.id)}
            statusIcon={statusIcon(doc.status)}
          />
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Documentos opcionais</h3>
        {documents.filter((d) => !d.required).map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            uploading={uploading === doc.id}
            onUpload={() => handleUpload(doc.id)}
            statusIcon={statusIcon(doc.status)}
          />
        ))}
      </div>
    </div>
  );
}

function DocumentRow({
  doc,
  uploading,
  onUpload,
  statusIcon,
}: {
  doc: DocumentItem;
  uploading: boolean;
  onUpload: () => void;
  statusIcon: React.ReactNode;
}) {
  return (
    <Card className="p-0">
      <CardContent className="flex items-center gap-3 p-3">
        {statusIcon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{doc.name}</p>
          <p className="text-xs text-muted-foreground">{doc.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className={cn(getDocumentStatusColor(doc.status), "text-xs border hidden sm:flex")}
          >
            {getDocumentStatusLabel(doc.status)}
          </Badge>
          {doc.status === "PENDING" && (
            <Button
              size="xs"
              variant="outline"
              onClick={onUpload}
              disabled={uploading}
            >
              {uploading ? <RefreshCw className="size-3 animate-spin" /> : <Upload className="size-3" />}
              Anexar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
