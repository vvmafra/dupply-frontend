import type { DuplicataFiscalTipo, DuplicataTipo } from "./duplicata.types";

export interface NotaFiscalParsed {
  tipo: DuplicataTipo;
  numeroDuplicata: string;
  numeroFatura: string;
  valor: number;
  dataEmissao: string;
  dataVencimento: string;
  sacadoCnpj: string;
  sacadoRazaoSocial: string;
  sacadoEmailFinanceiro: string;
  documentoFiscalChave: string;
  documentoFiscalTipo: DuplicataFiscalTipo;
}

/** Default term when the XML carries no due date. */
const DEFAULT_VENCIMENTO_DIAS = 30;

function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

/**
 * Extracts the duplicata fields from an NF-e or NFS-e XML.
 * Throws when the document cannot be parsed as XML.
 */
export function parseNotaFiscalXml(xmlText: string): NotaFiscalParsed {
  const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("XML inválido");
  }

  const getTagVal = (tagName: string, parent: ParentNode = xmlDoc): string =>
    parent.querySelector(tagName)?.textContent?.trim() ?? "";

  const isNfse =
    xmlDoc.getElementsByTagName("NFSe").length > 0 ||
    xmlDoc.getElementsByTagName("infNFSe").length > 0;

  const parsed: NotaFiscalParsed = {
    tipo: isNfse ? "servico" : "mercantil",
    numeroDuplicata: "",
    numeroFatura: "",
    valor: 0,
    dataEmissao: "",
    dataVencimento: "",
    sacadoCnpj: "",
    sacadoRazaoSocial: "",
    sacadoEmailFinanceiro: "",
    documentoFiscalChave: "",
    documentoFiscalTipo: isNfse ? "nfse" : "nfe",
  };

  if (isNfse) {
    parsed.numeroDuplicata = getTagVal("nNFSe");
    parsed.numeroFatura = getTagVal("nDPS") || parsed.numeroDuplicata;
    parsed.valor = Number.parseFloat(getTagVal("vLiq") || getTagVal("vServ") || "0") || 0;

    const emissao = getTagVal("dhEmi") || getTagVal("dhProc") || getTagVal("dCompet");
    if (emissao) parsed.dataEmissao = emissao.split("T")[0];

    const tomador = xmlDoc.querySelector("toma");
    if (tomador) {
      parsed.sacadoCnpj = getTagVal("CNPJ", tomador);
      parsed.sacadoRazaoSocial = getTagVal("xNome", tomador);
      parsed.sacadoEmailFinanceiro = getTagVal("email", tomador);
    }

    const idAttr = xmlDoc.querySelector("infNFSe")?.getAttribute("Id") ?? "";
    parsed.documentoFiscalChave = idAttr.replace("NFS", "");
  } else {
    parsed.numeroDuplicata = getTagVal("nNF");
    parsed.numeroFatura = getTagVal("nFat") || parsed.numeroDuplicata;
    parsed.valor = Number.parseFloat(getTagVal("vNF") || getTagVal("vProd") || "0") || 0;

    const emissao = getTagVal("dhEmi") || getTagVal("dEmi");
    if (emissao) parsed.dataEmissao = emissao.split("T")[0];

    const destinatario = xmlDoc.querySelector("dest");
    if (destinatario) {
      parsed.sacadoCnpj = getTagVal("CNPJ", destinatario);
      parsed.sacadoRazaoSocial = getTagVal("xNome", destinatario);
      parsed.sacadoEmailFinanceiro = getTagVal("email", destinatario);
    }

    const idAttr = xmlDoc.querySelector("infNFe")?.getAttribute("Id") ?? "";
    parsed.documentoFiscalChave = idAttr.replace("NFe", "");
  }

  if (parsed.dataEmissao) {
    parsed.dataVencimento = addDaysIso(parsed.dataEmissao, DEFAULT_VENCIMENTO_DIAS);
  }

  return parsed;
}
