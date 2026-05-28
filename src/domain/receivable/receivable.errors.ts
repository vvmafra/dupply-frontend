export type ReceivableErrorCode =
  | "seller_not_active"
  | "incomplete_metadata"
  | "metadata_locked"
  | "seller_and_payer_must_differ"
  | "proposed_value_required_for_offer"
  | "proposed_value_not_allowed_for_reprove"
  | "receivable_not_found"
  | "forbidden"
  | "not_owner"
  | "invalid_receivable_transition"
  | "receivable_deleted"
  | "network"
  | "unknown";

export class ReceivableError extends Error {
  readonly code: ReceivableErrorCode;

  constructor(code: ReceivableErrorCode, message: string) {
    super(message);
    this.name = "ReceivableError";
    this.code = code;
  }
}

export const RECEIVABLE_ERROR_MESSAGES: Record<string, string> = {
  seller_not_active: "Seu cadastro ainda não está ativo para cadastrar recebíveis.",
  incomplete_metadata: "Preencha todos os campos obrigatórios antes de enviar.",
  metadata_locked: "Este recebível não pode mais ser editado.",
  seller_and_payer_must_differ: "O CNPJ do sacado deve ser diferente do seu CNPJ.",
  proposed_value_required_for_offer: "Informe o valor da proposta.",
  proposed_value_not_allowed_for_reprove: "Valor proposto não permitido ao reprovar.",
  receivable_not_found: "Recebível não encontrado.",
  forbidden: "Você não tem permissão para esta operação.",
  not_owner: "Você não tem permissão para esta operação.",
  invalid_receivable_transition: "Esta ação não é permitida no status atual.",
  receivable_deleted: "Este recebível não está mais disponível.",
  network: "Não foi possível conectar. Tente novamente.",
};
