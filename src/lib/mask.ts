/** Mask CPF (11 digits) or CNPJ (14 digits) for display */
export function maskDocument(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11) {
    return `${d.slice(0, 3)}.***.***-${d.slice(9)}`;
  }
  if (d.length === 14) {
    return `${d.slice(0, 2)}.***.***/****-${d.slice(12)}`;
  }
  if (d.length <= 4) return "****";
  return `${"*".repeat(Math.max(0, d.length - 4))}${d.slice(-4)}`;
}

export function maskPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) *****-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ****-${d.slice(6)}`;
  }
  return "****";
}
