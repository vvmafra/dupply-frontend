/** Taxa média de mercado usada só para a prévia do simulador (a.m.). */
export const SIMULACAO_TAXA_MENSAL_PERCENT = 2.2;
/** Tarifa de serviço flat aplicada na prévia. */
export const SIMULACAO_TARIFA_PERCENT = 0.5;

export interface SimulacaoAntecipacaoInput {
  /** Valor de face (string vinda do formulário ou número). */
  valor: string | number;
  /** ISO date (yyyy-mm-dd). */
  dataEmissao: string;
  /** ISO date (yyyy-mm-dd). */
  dataVencimento: string;
}

export interface SimulacaoAntecipacao {
  valor: number;
  dias: number;
  desconto: number;
  tarifa: number;
  liquido: number;
  /** Custo efetivo (%) sobre o valor de face. */
  custoPercent: number;
  /** True when both value and term are valid and the preview can be shown. */
  disponivel: boolean;
}

export function calcDiasEntreDatas(dataEmissao: string, dataVencimento: string): number {
  if (!dataEmissao || !dataVencimento) return 0;
  const diff = new Date(dataVencimento).getTime() - new Date(dataEmissao).getTime();
  if (!Number.isFinite(diff) || diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Prévia de deságio + tarifa para o cedente, antes da precificação oficial do analista. */
export function simularAntecipacao(input: SimulacaoAntecipacaoInput): SimulacaoAntecipacao {
  const valor =
    typeof input.valor === "number" ? input.valor : Number.parseFloat(input.valor) || 0;
  const dias = calcDiasEntreDatas(input.dataEmissao, input.dataVencimento);

  const taxaDiaria = SIMULACAO_TAXA_MENSAL_PERCENT / 100 / 30;
  const desconto = valor * taxaDiaria * dias;
  const tarifa = valor * (SIMULACAO_TARIFA_PERCENT / 100);
  const liquido = Math.max(0, valor - desconto - tarifa);
  const custoPercent = valor > 0 ? ((valor - liquido) / valor) * 100 : 0;

  return {
    valor,
    dias,
    desconto,
    tarifa,
    liquido,
    custoPercent,
    disponivel: valor > 0 && dias > 0,
  };
}
