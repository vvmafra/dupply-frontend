import { FileText, CircleCheck as CheckCircle2, Clock, CircleAlert as AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDocumentStatusLabel, getDocumentStatusColor } from "@/domain/documents/document.constants";
import { cn } from "@/lib/utils";
import type { ReceivableDocument } from "@/domain/receivables/receivable.types";

interface DocumentsListProps {
  documents: ReceivableDocument[];
}

const statusIcons: Record<string, React.ElementType> = {
  APPROVED: CheckCircle2,
  PENDING: Clock,
  UPLOADED: Clock,
  UNDER_REVIEW: Clock,
  REJECTED: AlertCircle,
};

export function DocumentsList({ documents }: DocumentsListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="size-4" />
          Documentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const Icon = statusIcons[doc.status] ?? Clock;
              return (
                <div key={doc.id} className="flex items-center justify-between gap-2 py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{doc.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(getDocumentStatusColor(doc.status), "text-xs border")}
                  >
                    {getDocumentStatusLabel(doc.status)}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
