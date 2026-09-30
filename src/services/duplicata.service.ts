import { sleep } from "@/lib/utils";
import { DUPLICATA_DEMO } from "@/data/duplicata-demo.mock";
import { INITIAL_DUPLICATAS } from "@/data/duplicatas.mock";
import { MOCK_SELLERS } from "@/data/users.mock";
import { calcValorLiquidoCedente } from "@/domain/duplicata/duplicata-antecipacao.helpers";
import { resolveApiMode } from "@/lib/env";
import { apiRequest } from "@/lib/api-client";
import { describeApiError } from "@/lib/api-errors";
import { createMockStore } from "@/lib/mock-store";
import {
  mapBackendReceivableToDuplicata,
  type BackendReceivable,
} from "@/services/mappers/backend-receivable.mapper";
import type {
  DuplicataTitulo,
  DuplicataAnaliseAnalista,
  NovaDuplicataPayload,
  OfertaAntecipacaoTerms,
} from "@/domain/duplicata/duplicata.types";

/** Mock store — persisted so demo data survives F5 and is shared across tabs. */
const duplicatasStore = createMockStore<DuplicataTitulo[]>("duplicatas", () =>
  INITIAL_DUPLICATAS.map((d) => ({ ...d })),
);

export async function fetchAllDuplicatas(): Promise<DuplicataTitulo[]> {
  if (resolveApiMode() === "http") {
    const [data, sellersList] = await Promise.all([
      apiRequest<{ receivables: BackendReceivable[] }>("/v1/receivables"),
      apiRequest<any[]>("/v1/sellers").catch(() => []),
    ]);
    return data.receivables.map((r) => {
      const dup = mapBackendReceivableToDuplicata(r);
      const seller = sellersList.find((s) => s.id === r.sellerId);
      if (seller) {
        dup.sellerName = seller.companyMetaData?.legalName || seller.name || "Sem Nome";
      } else {
        dup.sellerName = r.sellerId;
      }
      return dup;
    });
  }

  await sleep(300);
  return duplicatasStore.get().map((d) => ({ ...d }));
}

export async function fetchDuplicatasBySeller(sellerId: string): Promise<DuplicataTitulo[]> {
  if (resolveApiMode() === "http") {
    const [data, seller] = await Promise.all([
      apiRequest<{ receivables: BackendReceivable[] }>("/v1/receivables"),
      apiRequest<any>(`/v1/sellers/${sellerId}`).catch(() => null),
    ]);
    return data.receivables
      .filter((r) => r.sellerId === sellerId)
      .map((r) => {
        const dup = mapBackendReceivableToDuplicata(r);
        if (seller) {
          dup.sellerName = seller.companyMetaData?.legalName || seller.name || "Sem Nome";
        } else {
          dup.sellerName = r.sellerId;
        }
        return dup;
      });
  }

  await sleep(280);
  return duplicatasStore
    .get()
    .filter((d) => d.sellerId === sellerId)
    .map((d) => ({ ...d }));
}

export async function fetchDuplicataById(id: string): Promise<DuplicataTitulo | null> {
  if (resolveApiMode() === "http") {
    try {
      const data = await apiRequest<{ receivable: BackendReceivable }>(`/v1/receivables/${id}`);
      const dup = mapBackendReceivableToDuplicata(data.receivable);
      try {
        const seller = await apiRequest<any>(`/v1/sellers/${dup.sellerId}`);
        dup.sellerName = seller.companyMetaData?.legalName || seller.name || "Sem Nome";
      } catch {
        dup.sellerName = dup.sellerId;
      }
      return dup;
    } catch (e) {
      return null;
    }
  }

  await sleep(200);
  const d = duplicatasStore.get().find((x) => x.id === id);
  return d ? { ...d } : null;
}

export async function createDuplicata(
  sellerId: string,
  payload: NovaDuplicataPayload
): Promise<DuplicataTitulo> {
  if (resolveApiMode() === "http") {
    const body = {
      payerCnpj: payload.sacadoCnpj.replace(/\D/g, ""),
      payerLegalName: payload.sacadoRazaoSocial,
      payerFinancialEmail: payload.sacadoEmailFinanceiro,
      value: payload.valor,
      receivableMetaData: {
        type: payload.tipo === "servico" ? "service" : "commercial",
        billNumber: payload.numeroDuplicata,
        invoiceNumber: payload.numeroFatura,
        issuedAt: new Date(payload.dataEmissao).toISOString(),
        dueDate: new Date(payload.dataVencimento).toISOString(),
        payerCnpj: payload.sacadoCnpj.replace(/\D/g, ""),
        payerLegalName: payload.sacadoRazaoSocial,
        payerFinancialEmail: payload.sacadoEmailFinanceiro,
        fiscalDocumentType: payload.documentoFiscalTipo === "nfe" 
          ? "nfe" 
          : payload.documentoFiscalTipo === "nfce" 
          ? "nfce" 
          : payload.documentoFiscalTipo === "nfse" 
          ? "nfse" 
          : "other",
        fiscalDocumentKey: payload.documentoFiscalChave,
        proofType: payload.comprovanteTipo === "prestacao_servico" 
          ? "service_provision" 
          : payload.comprovanteTipo === "aceite" 
          ? "acceptance" 
          : "delivery",
        payerAcceptanceStatus: payload.statusAceiteSacado === "aceito" 
          ? "accepted" 
          : payload.statusAceiteSacado === "recusado" 
          ? "refused" 
          : "pending",
        desiredAnticipationValue: payload.valorDesejadoAntecipacao,
        antifraudDeclarationsAccepted: payload.declaracoesAntifraudeAceitas,
      }
    };
    try {
      const created = await apiRequest<BackendReceivable>("/v1/receivables/submit", {
        method: "POST",
        body,
      });
      return mapBackendReceivableToDuplicata(created);
    } catch (err) {
      throw new Error(describeApiError(err, "Não foi possível registrar a duplicata."));
    }
  }

  await sleep(600);
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId) ?? MOCK_SELLERS[0];
  const novo: DuplicataTitulo = {
    id: `dup-${Date.now()}`,
    sellerId: seller.id,
    sellerName: seller.legalName,
    tipo: payload.tipo,
    numeroDuplicata: payload.numeroDuplicata,
    numeroFatura: payload.numeroFatura,
    valor: payload.valor,
    dataEmissao: payload.dataEmissao,
    dataVencimento: payload.dataVencimento,
    sacadoCnpj: payload.sacadoCnpj,
    sacadoRazaoSocial: payload.sacadoRazaoSocial,
    sacadoEmailFinanceiro: payload.sacadoEmailFinanceiro,
    documentoFiscalTipo: payload.documentoFiscalTipo,
    documentoFiscalChave: payload.documentoFiscalChave,
    documentoFiscalAnexado: payload.documentoFiscalAnexado,
    comprovanteTipo: payload.comprovanteTipo,
    comprovanteAnexado: payload.comprovanteAnexado,
    statusAceiteSacado: payload.statusAceiteSacado,
    valorDesejadoAntecipacao: payload.valorDesejadoAntecipacao,
    declaracoesAntifraudeAceitas: payload.declaracoesAntifraudeAceitas,
    enviadoEm: new Date().toISOString(),
    analiseAnalista: "pendente",
    scoreUsuario: DUPLICATA_DEMO.scoreUsuario,
    scoreDuplicata: DUPLICATA_DEMO.scoreDuplicata,
  };
  duplicatasStore.update((current) => [novo, ...current]);
  return { ...novo };
}

export async function setDuplicataAnaliseAnalista(
  id: string,
  status: DuplicataAnaliseAnalista
): Promise<void> {
  if (resolveApiMode() === "http") {
    if (status === "reprovado") {
      try {
        await apiRequest(`/v1/receivables/${id}/risk-decision`, {
          method: "POST",
          body: { decision: "reprove" },
        });
      } catch (err) {
        throw new Error(describeApiError(err, "Não foi possível reprovar a duplicata."));
      }
      return;
    }
    // "pendente" has no backend counterpart (under_review is the resting state).
    throw new Error("Com o backend, uma duplicata em análise já está pendente; use Aprovar ou Reprovar.");
  }

  await sleep(350);
  duplicatasStore.update((current) =>
    current.map((d) => {
      if (d.id !== id) return d;
      const next: DuplicataTitulo = { ...d, analiseAnalista: status };
      if (status !== "for_approval") {
        delete next.descontoAntecipacaoPercent;
        delete next.valorLiquidoAntecipacao;
      }
      return next;
    }),
  );
}

/** Money in reais with 2 decimals (the backend requires `multipleOf(0.01)`). */
function toReais2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Analyst proposal: deságio → `proposedValue`, plus the optional funding terms
 * (`yieldRateMonthly`, `minInvestment`) the backend accepts only with `decision: "offer"`.
 */
export async function setDuplicataOfertaAntecipacao(
  id: string,
  terms: OfertaAntecipacaoTerms,
): Promise<void> {
  const { descontoPercent, yieldRateMonthly, minInvestment } = terms;

  if (resolveApiMode() === "http") {
    const d = await fetchDuplicataById(id);
    if (!d) throw new Error("Duplicata não encontrada");
    const proposedValue = toReais2(calcValorLiquidoCedente(d.valor, descontoPercent));
    const body: Record<string, unknown> = { decision: "offer", proposedValue };
    if (yieldRateMonthly !== undefined) body.yieldRateMonthly = yieldRateMonthly;
    if (minInvestment !== undefined && minInvestment > 0) body.minInvestment = toReais2(minInvestment);
    try {
      await apiRequest(`/v1/receivables/${id}/risk-decision`, { method: "POST", body });
    } catch (err) {
      throw new Error(describeApiError(err, "Não foi possível enviar a proposta."));
    }
    return;
  }

  await sleep(350);
  duplicatasStore.update((current) =>
    current.map((d) =>
      d.id === id
        ? {
            ...d,
            analiseAnalista: "for_approval",
            descontoAntecipacaoPercent: descontoPercent,
            valorLiquidoAntecipacao: calcValorLiquidoCedente(d.valor, descontoPercent),
            yieldRateMonthly,
            minInvestment: minInvestment && minInvestment > 0 ? minInvestment : undefined,
          }
        : d,
    ),
  );
}

export async function setDuplicataDecisaoCedente(
  id: string,
  decision: Extract<DuplicataAnaliseAnalista, "aprovado" | "reprovado">
): Promise<void> {
  if (resolveApiMode() === "http") {
    try {
      await apiRequest(`/v1/receivables/${id}/seller-decision`, {
        method: "POST",
        body: { decision: decision === "aprovado" ? "accept" : "reject" },
      });
    } catch (err) {
      throw new Error(describeApiError(err, "Não foi possível registrar a decisão."));
    }
    return;
  }

  await sleep(400);
  duplicatasStore.update((current) =>
    current.map((d) => {
      if (d.id !== id) return d;
      const next: DuplicataTitulo = { ...d, analiseAnalista: decision };
      if (decision === "reprovado") {
        delete next.descontoAntecipacaoPercent;
        delete next.valorLiquidoAntecipacao;
      }
      return next;
    }),
  );
}
