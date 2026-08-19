import { sleep } from "@/lib/utils";
import { DUPLICATA_DEMO } from "@/data/duplicata-demo.mock";
import { INITIAL_DUPLICATAS } from "@/data/duplicatas.mock";
import { MOCK_SELLERS } from "@/data/users.mock";
import { calcValorLiquidoCedente } from "@/domain/duplicata/duplicata-antecipacao.helpers";
import { resolveApiMode } from "@/lib/env";
import { apiRequest } from "@/lib/api-client";
import type { DuplicataTitulo, DuplicataAnaliseAnalista, NovaDuplicataPayload } from "@/domain/duplicata/duplicata.types";

let duplicatas: DuplicataTitulo[] = INITIAL_DUPLICATAS.map((d) => ({ ...d }));

function mapBackendReceivableToDuplicata(r: any): DuplicataTitulo {
  let meta: any = {};
  if (r.receivableMetaData) {
    try {
      meta = typeof r.receivableMetaData === "string" 
        ? JSON.parse(r.receivableMetaData) 
        : r.receivableMetaData;
    } catch (e) {
      console.error("Failed to parse receivableMetaData", e);
    }
  }

  // Map status:
  // created, under_review -> pendente
  // offer -> for_approval
  // confirmed, funding, funded, processing, completed, payer_settled -> aprovado
  // reproved, rejected -> reprovado
  let analiseAnalista: DuplicataAnaliseAnalista = "pendente";
  if (r.status === "created" || r.status === "under_review") {
    analiseAnalista = "pendente";
  } else if (r.status === "offer") {
    analiseAnalista = "for_approval";
  } else if (
    r.status === "confirmed" || 
    r.status === "funding" || 
    r.status === "funded" || 
    r.status === "processing" || 
    r.status === "completed" || 
    r.status === "payer_settled"
  ) {
    analiseAnalista = "aprovado";
  } else if (r.status === "reproved" || r.status === "rejected") {
    analiseAnalista = "reprovado";
  }

  const value = r.value ?? 0;
  const proposedValue = r.proposedValue;
  let descontoPercent: number | undefined = undefined;
  if (proposedValue != null && value > 0) {
    descontoPercent = Math.round((1 - (proposedValue / value)) * 100);
  }

  return {
    id: r.id,
    sellerId: r.sellerId,
    sellerName: "Sua Empresa",
    tipo: meta.type === "service" ? "servico" : "mercantil",
    numeroDuplicata: meta.billNumber ?? "",
    numeroFatura: meta.invoiceNumber ?? "",
    valor: value,
    dataEmissao: meta.issuedAt ? meta.issuedAt.split("T")[0] : "",
    dataVencimento: meta.dueDate ? meta.dueDate.split("T")[0] : "",
    sacadoCnpj: meta.payerCnpj ?? "",
    sacadoRazaoSocial: meta.payerLegalName ?? "",
    sacadoEmailFinanceiro: meta.payerFinancialEmail ?? "",
    documentoFiscalTipo: meta.fiscalDocumentType ?? "nfe",
    documentoFiscalChave: meta.fiscalDocumentKey ?? "",
    documentoFiscalAnexado: meta.fiscalDocumentType ? true : false,
    comprovanteTipo: meta.proofType === "service_provision" 
      ? "prestacao_servico" 
      : meta.proofType === "acceptance" 
      ? "aceite" 
      : "entrega",
    comprovanteAnexado: meta.proofType ? true : false,
    statusAceiteSacado: meta.payerAcceptanceStatus ?? "pendente",
    valorDesejadoAntecipacao: meta.desiredAnticipationValue ?? value,
    declaracoesAntifraudeAceitas: meta.antifraudDeclarationsAccepted ?? false,
    enviadoEm: r.createdAt ?? new Date().toISOString(),
    analiseAnalista,
    descontoAntecipacaoPercent: descontoPercent,
    valorLiquidoAntecipacao: proposedValue ?? undefined,
    scoreUsuario: 85,
    scoreDuplicata: 90,
  };
}

export async function fetchAllDuplicatas(): Promise<DuplicataTitulo[]> {
  if (resolveApiMode() === "http") {
    const data = await apiRequest<{ receivables: any[] }>("/v1/receivables");
    return data.receivables.map(mapBackendReceivableToDuplicata);
  }

  await sleep(300);
  return duplicatas.map((d) => ({ ...d }));
}

export async function fetchDuplicatasBySeller(sellerId: string): Promise<DuplicataTitulo[]> {
  if (resolveApiMode() === "http") {
    const data = await apiRequest<{ receivables: any[] }>("/v1/receivables");
    return data.receivables.map(mapBackendReceivableToDuplicata);
  }

  await sleep(280);
  return duplicatas.filter((d) => d.sellerId === sellerId).map((d) => ({ ...d }));
}

export async function fetchDuplicataById(id: string): Promise<DuplicataTitulo | null> {
  if (resolveApiMode() === "http") {
    try {
      const data = await apiRequest<{ receivable: any }>(`/v1/receivables/${id}`);
      return mapBackendReceivableToDuplicata(data.receivable);
    } catch (e) {
      return null;
    }
  }

  await sleep(200);
  const d = duplicatas.find((x) => x.id === id);
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
        payerAcceptanceStatus: payload.statusAceiteSacado,
        desiredAnticipationValue: payload.valorDesejadoAntecipacao,
        antifraudDeclarationsAccepted: payload.declaracoesAntifraudeAceitas,
      }
    };
    const created = await apiRequest<any>("/v1/receivables/submit", {
      method: "POST",
      body,
    });
    return mapBackendReceivableToDuplicata(created);
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
  duplicatas = [novo, ...duplicatas];
  return { ...novo };
}

export async function setDuplicataAnaliseAnalista(
  id: string,
  status: DuplicataAnaliseAnalista
): Promise<void> {
  // Primarily used for analyst actions. If we need to connect to HTTP, we would do so here.
  // Currently, the analyst flow is not fully wired to endpoints or uses mock, but let's keep the mock fallback.
  await sleep(350);
  duplicatas = duplicatas.map((d) => {
    if (d.id !== id) return d;
    const next: DuplicataTitulo = { ...d, analiseAnalista: status };
    if (status !== "for_approval") {
      delete next.descontoAntecipacaoPercent;
      delete next.valorLiquidoAntecipacao;
    }
    return next;
  });
}

export async function setDuplicataOfertaAntecipacao(
  id: string,
  descontoPercent: number
): Promise<void> {
  await sleep(350);
  const valorLiquido = calcValorLiquidoCedente(
    duplicatas.find((d) => d.id === id)?.valor ?? 0,
    descontoPercent
  );
  duplicatas = duplicatas.map((d) =>
    d.id === id
      ? {
          ...d,
          analiseAnalista: "for_approval",
          descontoAntecipacaoPercent: descontoPercent,
          valorLiquidoAntecipacao: valorLiquido,
        }
      : d
  );
}

export async function setDuplicataDecisaoCedente(
  id: string,
  decision: Extract<DuplicataAnaliseAnalista, "aprovado" | "reprovado">
): Promise<void> {
  if (resolveApiMode() === "http") {
    await apiRequest<any>(`/v1/receivables/${id}/seller-decision`, {
      method: "POST",
      body: {
        decision: decision === "aprovado" ? "accept" : "reject",
      },
    });
    return;
  }

  await sleep(400);
  duplicatas = duplicatas.map((d) => {
    if (d.id !== id) return d;
    const next: DuplicataTitulo = { ...d, analiseAnalista: decision };
    if (decision === "reprovado") {
      delete next.descontoAntecipacaoPercent;
      delete next.valorLiquidoAntecipacao;
    }
    return next;
  });
}
