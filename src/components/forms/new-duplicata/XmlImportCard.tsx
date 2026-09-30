import { FileUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { parseNotaFiscalXml, type NotaFiscalParsed } from "@/domain/duplicata/nfe-xml.parser";

export function XmlImportCard({
  onImported,
}: Readonly<{ onImported: (parsed: NotaFiscalParsed, fileName: string) => void }>) {
  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xml")) {
      toast.error("Arquivo inválido", { description: "Por favor, selecione um arquivo no formato XML." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseNotaFiscalXml(String(e.target?.result ?? ""));
        onImported(parsed, file.name);
        toast.success("XML Importado com sucesso!", {
          description: `Duplicata Nº ${parsed.numeroDuplicata} e dados do sacado importados.`,
        });
      } catch {
        toast.error("Falha ao processar XML", {
          description: "Não foi possível extrair os dados da nota fiscal a partir deste arquivo.",
        });
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="relative group overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
      <div className="flex flex-col items-center justify-center text-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/15 text-primary shrink-0">
          <FileUp className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-semibold text-sm text-card-foreground">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            Importação Rápida via XML
          </div>
          <p className="text-xs text-muted-foreground leading-normal max-w-md">
            Arraste o arquivo XML da NF-e / NFS-e ou clique para selecionar. O preenchimento do formulário é
            automático.
          </p>
        </div>
        <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4">
          <input type="file" accept=".xml" className="hidden" onChange={handleFile} />
          Selecionar XML
        </label>
      </div>
    </div>
  );
}
