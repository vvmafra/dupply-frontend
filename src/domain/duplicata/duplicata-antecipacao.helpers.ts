export function calcValorLiquidoCedente(valorNota: number, descontoPercent: number): number {
  return valorNota * (1 - descontoPercent / 100);
}
