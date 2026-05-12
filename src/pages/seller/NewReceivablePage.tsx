import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewReceivableForm } from "@/components/forms/NewReceivableForm";
import { FilePlus } from "lucide-react";

export function NewReceivablePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Cadastrar recebível</h1>
        <p className="text-sm text-muted-foreground">Informe os dados do título para antecipação</p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FilePlus className="size-4" />
            Novo recebível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NewReceivableForm />
        </CardContent>
      </Card>
    </div>
  );
}
