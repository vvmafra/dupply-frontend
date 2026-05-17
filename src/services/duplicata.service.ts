import { sleep } from "@/lib/utils";
import { INITIAL_DUPLICATAS } from "@/data/duplicatas.mock";
import { MOCK_SELLERS } from "@/data/users.mock";
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
    scoreUsuario: 70,
    scoreDuplicata: 75,
  };
  duplicatas = [novo, ...duplicatas];
  return { ...novo };
}

export async function setDuplicataAnaliseAnalista(
  id: string,
  status: DuplicataAnaliseAnalista
): Promise<void> {
  await sleep(350);
  duplicatas = duplicatas.map((d) => (d.id === id ? { ...d, analiseAnalista: status } : d));
}
