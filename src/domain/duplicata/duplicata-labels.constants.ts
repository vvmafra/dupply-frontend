import type {
  DuplicataAceiteSacado,
  DuplicataComprovanteTipo,
  DuplicataFiscalTipo,
  DuplicataTipo,
} from "./duplicata.types";

export const DUPLICATA_TIPO_LABELS: Record<DuplicataTipo, string> = {
  mercantil: "Mercantil",
  servico: "Serviço",
};

export const DUPLICATA_FISCAL_LABELS: Record<DuplicataFiscalTipo, string> = {
  nfe: "NF-e",
  nfce: "NFC-e",
  nfse: "NFS-e",
  outro: "Outro",
};

export const DUPLICATA_COMPROVANTE_LABELS: Record<DuplicataComprovanteTipo, string> = {
  entrega: "Entrega",
  aceite: "Aceite",
  prestacao_servico: "Prestação de serviço",
};

export const DUPLICATA_ACEITE_LABELS: Record<DuplicataAceiteSacado, string> = {
  aceito: "Aceito",
  pendente: "Pendente",
  recusado: "Recusado",
};

/** Long form used in detail pages ("Aceito pelo sacado"). */
export const DUPLICATA_ACEITE_LABELS_LONG: Record<DuplicataAceiteSacado, string> = {
  aceito: "Aceito pelo sacado",
  pendente: "Pendente de aceite",
  recusado: "Recusado pelo sacado",
};
