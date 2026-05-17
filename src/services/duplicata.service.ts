import { sleep } from "@/lib/utils";
import { DUPLICATA_DEMO } from "@/data/duplicata-demo.mock";
import { INITIAL_DUPLICATAS } from "@/data/duplicatas.mock";
import { MOCK_SELLERS } from "@/data/users.mock";
import { calcValorLiquidoCedente } from "@/domain/duplicata/duplicata-antecipacao.helpers";
import type { DuplicataTitulo, DuplicataAnaliseAnalista, NovaDuplicataPayload } from "@/domain/duplicata/duplicata.types";

let duplicatas: DuplicataTitulo[] = INITIAL_DUPLICATAS.map((d) => ({ ...d }));

export async function fetchAllDuplicatas(): Promise<DuplicataTitulo[]> {
  await sleep(300);
  return duplicatas.map((d) => ({ ...d }));
}

export async function fetchDuplicatasBySeller(sellerId: string): Promise<DuplicataTitulo[]> {
  await sleep(280);
  return duplicatas.filter((d) => d.sellerId === sellerId).map((d) => ({ ...d }));
}

export async function fetchDuplicataById(id: string): Promise<DuplicataTitulo | null> {
  await sleep(200);
  const d = duplicatas.find((x) => x.id === id);
  return d ? { ...d } : null;
}

export async function createDuplicata(
  sellerId: string,
  payload: NovaDuplicataPayload
): Promise<DuplicataTitulo> {
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

/** Analista envia oferta de antecipação; cedente deve aprovar ou reprovar a operação. */
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

/** Cedente confirma ou recusa a operação de antecipação sugerida pelo analista. */
export async function setDuplicataDecisaoCedente(
  id: string,
  decision: Extract<DuplicataAnaliseAnalista, "aprovado" | "reprovado">
): Promise<void> {
  await sleep(400);
  duplicatas = duplicatas.map((d) => {
    if (d.id !== id) return d;
    const next: DuplicataTitulo = { ...d, analiseAnalista: decision };
    delete next.descontoAntecipacaoPercent;
    delete next.valorLiquidoAntecipacao;
    return next;
  });
}
