import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { SellerDuplicataOperacaoWizardDialog } from "@/components/seller/SellerDuplicataOperacaoWizardDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DuplicataAnaliseBadge } from "@/components/duplicata/DuplicataAnaliseBadge";
import { Badge } from "@/components/ui/badge";
import {
  fetchDuplicataById,
  setDuplicataDecisaoCedente,
} from "@/services/duplicata.service";
import { ROUTES } from "@/lib/routes";
import { formatCurrencyBRL } from "@/lib/formatters";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

const tipoLabel: Record<DuplicataTitulo["tipo"], string> = {
  mercantil: "Mercantil",
  servico: "Serviço",
};

const fiscalLabel: Record<DuplicataTitulo["documentoFiscalTipo"], string> = {
  nfe: "NF-e",
  nfce: "NFC-e",
  nfse: "NFS-e",
  outro: "Outro",
};

const comprovanteLabel: Record<DuplicataTitulo["comprovanteTipo"], string> = {
  entrega: "Entrega",
  aceite: "Aceite",
  prestacao_servico: "Prestação de serviço",
};

const aceiteLabel: Record<DuplicataTitulo["statusAceiteSacado"], string> = {
  aceito: "Aceito pelo Sacado",
  pendente: "Pendente de Aceite",
  recusado: "Recusado pelo Sacado",
};

function formatTimestamp(isoString?: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function SellerDuplicataDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [d, setD] = useState<DuplicataTitulo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Counter-offer/wizard approval state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessView, setShowSuccessView] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchDuplicataById(id).then((data) => {
      setD(data);
      setLoading(false);
    });
  }, [id]);

  async function handleApprove() {
    if (!id || !d) return;
    setSubmitting(true);
    try {
      await setDuplicataDecisaoCedente(id, "aprovado");
      const updated = await fetchDuplicataById(id);
      setD(updated);
      setWizardOpen(false);
      setShowSuccessView(true);
    } catch (err) {
      toast.error("Erro ao aprovar operação");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!id || !d) return;
    setSubmitting(true);
    try {
      await setDuplicataDecisaoCedente(id, "reprovado");
      const updated = await fetchDuplicataById(id);
      setD(updated);
      setWizardOpen(false);
      toast.error("Operação recusada", {
        description: `Você recusou a antecipação da duplicata ${d.numeroDuplicata}.`,
      });
    } catch (err) {
      toast.error("Erro ao recusar operação");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !id) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando detalhes...</div>;
  }

  if (!d) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Duplicata não encontrada.</p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.seller.duplicatas.list}>Voltar para listagem</Link>
        </Button>
      </div>
    );
  }

  if (showSuccessView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-md mx-auto w-full animate-in fade-in zoom-in-95 duration-300 py-12 px-4">
        <div className="w-full bg-card/60 border border-border shadow-2xl backdrop-blur-md rounded-2xl p-8 space-y-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/15 text-success mx-auto shadow-[0_0_20px_rgba(34,197,94,0.15)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-card-foreground">Operação Confirmada!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você aceitou a proposta de antecipação da duplicata {d.numeroDuplicata}. A operação foi confirmada com sucesso e seguirá para liquidação financeira.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              onClick={() => navigate(ROUTES.seller.duplicatas.list)}
              className="w-full font-medium h-10"
            >
              Ir para Minhas Duplicatas
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.seller.dashboard)}
              className="w-full font-medium h-10"
            >
              Ir para o Painel Principal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isAguardandoContraAceite = d.analiseAnalista === "for_approval";

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent">
          <Link to={ROUTES.seller.duplicatas.list} className="flex items-center gap-1">
            ← Voltar para listagem
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-mono text-foreground">
              Título: {d.numeroDuplicata}
            </h1>
            <Badge variant="secondary" className="font-medium">
              {tipoLabel[d.tipo]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">ID do Título: {d.id}</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-sm text-muted-foreground">Status da Operação:</span>
          <DuplicataAnaliseBadge status={d.analiseAnalista} className="px-3 py-1 text-sm font-semibold" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lado Esquerdo: Cards de Informação */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Valores */}
          <Card className="shadow-xs border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Valores da Operação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <span className="text-xs text-muted-foreground block">Valor de Face</span>
                  <span className="font-bold font-mono text-base text-foreground mt-1 block">
                    {formatCurrencyBRL(d.valor)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <span className="text-xs text-muted-foreground block">Desconto Aplicado</span>
                  <span className="font-bold font-mono text-base text-foreground mt-1 block">
                    {d.descontoAntecipacaoPercent != null ? `${d.descontoAntecipacaoPercent}%` : "—"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-xs text-muted-foreground block">Líquido Estimado</span>
                  <span className="font-bold font-mono text-base text-primary mt-1 block">
                    {d.valorLiquidoAntecipacao != null ? formatCurrencyBRL(d.valorLiquidoAntecipacao) : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Sacado */}
          <Card className="shadow-xs border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Dados do Sacado (Pagador)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Razão Social</span>
                  <span className="font-medium text-foreground mt-1 block">{d.sacadoRazaoSocial}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">CNPJ do Sacado</span>
                  <span className="font-mono text-foreground mt-1 block">{d.sacadoCnpj}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">E-mail Financeiro</span>
                  <span className="text-foreground mt-1 block">{d.sacadoEmailFinanceiro}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Status de Aceite do Sacado</span>
                  <span className="font-medium text-foreground mt-1 block">
                    {aceiteLabel[d.statusAceiteSacado] || "Pendente"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Documentação */}
          <Card className="shadow-xs border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Documentos Anexados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Documento Fiscal</span>
                  <span className="text-foreground mt-1 block">
                    {fiscalLabel[d.documentoFiscalTipo]}
                  </span>
                  {d.documentoFiscalChave && (
                    <span className="font-mono text-[11px] block mt-1 text-muted-foreground break-all max-w-full">
                      Chave: {d.documentoFiscalChave}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Comprovante de Entrega</span>
                  <span className="text-foreground mt-1 block">
                    Tipo: {comprovanteLabel[d.comprovanteTipo]}
                  </span>
                  <span className="text-[11px] block mt-1 text-muted-foreground">
                    Status: {d.comprovanteAnexado ? "Verificado" : "Pendente"}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground block">Declarações Antifraude</span>
                  <span className="text-foreground mt-1 block font-medium">
                    {d.declaracoesAntifraudeAceitas
                      ? "✓ Declarações de conformidade e integridade aceitas pelo Cedente"
                      : "Pendente de confirmação"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Timeline de Acompanhamento e Ações de Proposta */}
        <div className="space-y-6">
          {/* Card de Ação se houver Proposta */}
          {isAguardandoContraAceite && (
            <Card className="border-primary/40 bg-primary/5 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-primary">Proposta Disponível!</CardTitle>
                <CardDescription>
                  A Dupply avaliou o título e gerou uma proposta de antecipação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Valor Bruto:</span>
                    <span className="font-mono font-medium">{formatCurrencyBRL(d.valor)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Taxa Proposta:</span>
                    <span className="font-mono font-medium">{d.descontoAntecipacaoPercent}%</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 font-semibold">
                    <span className="text-foreground">Valor Líquido:</span>
                    <span className="font-mono text-primary text-base">
                      {d.valorLiquidoAntecipacao != null ? formatCurrencyBRL(d.valorLiquidoAntecipacao) : "—"}
                    </span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setWizardOpen(true)}>
                  Analisar & Decidir
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Card da Timeline */}
          <Card className="shadow-xs border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Histórico de Análise</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="relative pl-6 space-y-5 border-l border-border/80 ml-2 text-xs">
                {/* Evento 1 */}
                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-success/20 border border-success flex items-center justify-center text-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Duplicata Registrada</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">
                      Enviada com sucesso no dia {formatTimestamp(d.statusHistory?.created) || d.dataEmissao || "de cadastro"}.
                    </p>
                  </div>
                </div>

                {/* Evento 2: Aguardando Análise */}
                <div className="relative">
                  {d.analiseAnalista === "pendente" ? (
                    <>
                      <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-warning/20 border border-warning flex items-center justify-center text-warning">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Aguardando Análise</p>
                        <p className="text-muted-foreground text-[10px] mt-0.5">
                          Aguardando validação do devedor pelo comitê de crédito.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-success/20 border border-success flex items-center justify-center text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Análise de Risco Concluída</p>
                        <p className="text-muted-foreground text-[10px] mt-0.5">
                          Validação dos documentos e risco do pagador finalizada{d.statusHistory?.under_review ? ` em ${formatTimestamp(d.statusHistory.under_review)}` : ""}.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Evento 3: Proposta Emitida */}
                {(d.analiseAnalista === "for_approval" ||
                  d.analiseAnalista === "aprovado" ||
                  d.analiseAnalista === "reprovado") && (
                  <div className="relative">
                    {d.analiseAnalista === "for_approval" ? (
                      <>
                        <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Proposta Emitida</p>
                          <p className="text-muted-foreground text-[10px] mt-0.5">
                            Taxa de deságio de {d.descontoAntecipacaoPercent}% oferecida para antecipação{d.statusHistory?.offer ? ` em ${formatTimestamp(d.statusHistory.offer)}` : ""}.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-success/20 border border-success flex items-center justify-center text-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Proposta Avaliada</p>
                          <p className="text-muted-foreground text-[10px] mt-0.5">
                            Condições comerciais analisadas pelo Cedente{d.statusHistory?.offer ? ` em ${formatTimestamp(d.statusHistory.offer)}` : ""}.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Evento 4: Operação Confirmada */}
                {d.analiseAnalista === "aprovado" && (
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-success/20 border border-success flex items-center justify-center text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Operação Confirmada</p>
                      <p className="text-muted-foreground text-[10px] mt-0.5">
                        Proposta aceita{d.statusHistory?.confirmed ? ` em ${formatTimestamp(d.statusHistory.confirmed)}` : ""}! O recurso seguiria para liquidação financeira.
                      </p>
                    </div>
                  </div>
                )}

                {/* Evento 5: Operação Recusada */}
                {d.analiseAnalista === "reprovado" && (
                  <div className="relative">
                    <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-destructive/20 border border-destructive flex items-center justify-center text-destructive">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Operação Recusada</p>
                      <p className="text-muted-foreground text-[10px] mt-0.5">
                        A contraproposta foi recusada pelo cedente ou cancelada{d.statusHistory?.rejected || d.statusHistory?.reproved ? ` em ${formatTimestamp(d.statusHistory.rejected || d.statusHistory.reproved)}` : ""}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SellerDuplicataOperacaoWizardDialog
        open={wizardOpen}
        onOpenChange={(open) => {
          if (!open && submitting) return;
          setWizardOpen(open);
        }}
        duplicata={d}
        submitting={submitting}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
