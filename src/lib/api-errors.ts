import { ApiError, getApiErrorCode } from "@/lib/api-client";

/** Backend error codes (`{ error: code }`) → mensagem para o usuário. */
export const API_ERROR_MESSAGES: Record<string, string> = {
  // investor
  investment_below_minimum: "Aporte abaixo do ticket mínimo desta oferta.",
  investment_exceeds_remaining_funding: "Aporte maior que o restante da captação.",
  receivable_not_open_for_funding: "Esta oferta não está aberta para investimentos.",
  insufficient_funds: "Saldo insuficiente para este aporte.",
  invalid_amount: "Informe um valor válido.",
  invest_idempotency_conflict: "Este aporte já foi registrado.",
  investor_not_found: "Perfil de investidor não encontrado.",
  // receivable / offer terms
  invalid_offer_terms: "Termos inválidos: taxa fora de 0 a 10% a.m. ou ticket mínimo maior que o valor proposto.",
  offer_terms_not_allowed_for_reprove: "Taxa e ticket mínimo só se aplicam a uma proposta, não a uma reprovação.",
  proposed_value_required_for_offer: "Informe o valor proposto para a oferta.",
  proposed_value_not_allowed_for_reprove: "Valor proposto não se aplica a uma reprovação.",
  invalid_admin_stage_advance: "Esta duplicata não pode avançar de etapa no status atual.",
  invalid_receivable_transition: "Transição de status não permitida.",
  invalid_system_transition: "Transição de status não permitida.",
  transition_not_allowed: "Transição de status não permitida.",
  receivable_not_found: "Duplicata não encontrada.",
  duplicate_bill_number: "Já existe uma duplicata com este número.",
  duplicate_fiscal_document_key: "Já existe uma duplicata com esta chave fiscal.",
  seller_not_active: "O cadastro do cedente ainda não está ativo.",
  // seller
  invalid_status_transition: "Transição de status do cedente não permitida.",
  // generic
  forbidden: "Você não tem permissão para esta ação.",
  unauthorized: "Sessão expirada. Entre novamente.",
};

/**
 * Human-readable message for a failed request. Prefers the mapped backend code,
 * then the error's own message, then `fallback`.
 */
export function describeApiError(error: unknown, fallback: string): string {
  const code = getApiErrorCode(error);
  if (code && API_ERROR_MESSAGES[code]) return API_ERROR_MESSAGES[code];
  if (error instanceof ApiError) {
    if (error.status === 0) return "Não foi possível conectar ao servidor.";
    return code ? `${fallback} (${code})` : error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
