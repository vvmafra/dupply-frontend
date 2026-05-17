import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnalystCadastralReviewWizardDialog } from "@/components/analyst/AnalystCadastralReviewWizardDialog";
import { AnalystSellerRegistrationDocumentsPanel } from "@/components/analyst/AnalystSellerRegistrationDocumentsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_SELLERS } from "@/data/users.mock";
import { fetchSellerReviewById } from "@/services/seller-review.service";
import { approveAnalystDuplicatasAccess } from "@/services/seller.service";
import { getValidationStatusLabel } from "@/domain/seller/seller.validation";
import { getAnalystDuplicatasAccessLabel } from "@/domain/seller/seller-duplicata-access";
import { ROUTES } from "@/lib/routes";
import type { SellerReviewSummary } from "@/domain/risk-analyst/seller-review.types";

export function SellerReviewDetailPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin/sellers");
  const { user } = useAuth();
  const [row, setRow] = useState<SellerReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewWizardOpen, setReviewWizardOpen] = useState(false);

  useEffect(() => {
    if (!sellerId) return;
    fetchSellerReviewById(sellerId).then((data) => {
      setRow(data);
      setLoading(false);
    });
  }, [sellerId]);

  const refreshRow = useCallback(async () => {
    if (!sellerId) return;
    const updated = await fetchSellerReviewById(sellerId);
    setRow(updated);
  }, [sellerId]);

  async function handleLiberarDuplicatas() {
    if (!sellerId) return;
    await approveAnalystDuplicatasAccess(sellerId);
    await refreshRow();
  }

  if (loading || !sellerId) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!row) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Cedente não encontrado.</p>
        <Button variant="outline" asChild>
          <Link to={isAdmin ? ROUTES.admin.sellers.list : ROUTES.analyst.sellers.list}>Voltar</Link>
        </Button>
      </div>
    );
  }

  const backHref = isAdmin ? ROUTES.admin.sellers.list : ROUTES.analyst.sellers.list;
  const company = MOCK_SELLERS.find((s) => s.id === row.sellerId);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to={backHref}>← Voltar</Link>
          </Button>
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{row.legalName}</h1>
          <p className="font-mono text-sm text-muted-foreground">{row.taxId}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cadastro</CardTitle>
                <CardDescription>Dados centralizados (mock)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Representante:</span> {row.representativeName}
                </p>
                <p>
                  <span className="text-muted-foreground">E-mail:</span> {row.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Status validação:</span>{" "}
                  <Badge variant="outline">{getValidationStatusLabel(row.validationStatus)}</Badge>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Liberação para duplicatas</CardTitle>
                <CardDescription>
                  O cedente só consegue cadastrar duplicatas após esta liberação (além de KYC e cadastro aprovados na
                  plataforma).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Status:{" "}
                  <Badge variant="outline">{getAnalystDuplicatasAccessLabel(row.analystDuplicatasAccess)}</Badge>
                </p>
                {!isAdmin && row.validationStatus === "APPROVED" && row.analystDuplicatasAccess !== "APPROVED" && row.analystDuplicatasAccess !== "REJECTED" && (
                  <Button type="button" onClick={handleLiberarDuplicatas}>
                    Liberar envio de duplicatas para este cedente
                  </Button>
                )}
                {!isAdmin && row.validationStatus !== "APPROVED" && row.analystDuplicatasAccess !== "APPROVED" && (
                  <p className="text-xs text-muted-foreground">
                    A liberação de duplicatas fica disponível após o cadastro do cedente estar aprovado na plataforma.
                  </p>
                )}
                {!isAdmin && row.analystDuplicatasAccess === "REJECTED" && (
                  <p className="text-sm text-destructive">Envio de duplicatas não liberado para este cedente.</p>
                )}
                {isAdmin && (
                  <p className="text-xs text-muted-foreground">
                    Somente o analista de risco pode liberar o cadastro de duplicatas.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Score de risco (IA simulada)</CardTitle>
                <CardDescription>Gerado automaticamente para o hackathon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold tabular-nums">{row.riskScore}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Valor simulado pelo modelo de IA (hackathon) — referência qualitativa apenas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pontos de atenção (IA simulada)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {row.attentionPoints.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium">Revisão do analista</p>
              {row.reviewedByAnalystName ? (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Verificado por <strong>{row.reviewedByAnalystName}</strong>
                    {row.reviewedAt && (
                      <>
                        {" "}
                        em {new Date(row.reviewedAt).toLocaleString("pt-BR")}
                      </>
                    )}
                  </p>
                  {row.analystCadastralDecision ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">Decisão:</span>
                      {row.analystCadastralDecision === "APPROVED" ? (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">Cadastro aprovado</Badge>
                      ) : (
                        <Badge variant="destructive">Cadastro reprovado</Badge>
                      )}
                    </div>
                  ) : null}
                  {row.analystReviewJustification ? (
                    <div className="rounded-md border bg-muted/30 p-3 text-foreground">
                      <p className="text-xs font-medium text-muted-foreground">Justificativa</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{row.analystReviewJustification}</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Ainda sem revisão registrada.</p>
              )}
              {!isAdmin && !row.reviewedByAnalystId && user ? (
                <>
                  <Button type="button" onClick={() => setReviewWizardOpen(true)}>
                    Revisar cadastro do cedente
                  </Button>
                  <AnalystCadastralReviewWizardDialog
                    open={reviewWizardOpen}
                    onOpenChange={setReviewWizardOpen}
                    sellerId={row.sellerId}
                    sellerLegalName={row.legalName}
                    analystId={`analyst-${user.id}`}
                    analystName={user.name ?? "Analista"}
                    onCompleted={refreshRow}
                  />
                </>
              ) : null}
              {isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Administradores apenas visualizam. A revisão é feita pelo analista de risco.
                </p>
              )}
            </div>
          </div>

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
            {company ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Contato no cadastro</CardTitle>
                  <CardDescription className="text-xs">Campos adicionais enviados no registro (mock)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Telefone:</span> {company.phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">CPF do representante:</span>{" "}
                    <span className="font-mono">{company.representativeCpf}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Cadastro criado em:</span>{" "}
                    {new Date(company.createdAt).toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ) : null}
            <AnalystSellerRegistrationDocumentsPanel files={row.registrationDocumentFiles ?? []} />
          </aside>
        </div>
      </div>
    </div>
  );
}
