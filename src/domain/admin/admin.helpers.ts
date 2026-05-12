export function generateMockTransactionHash(): string {
  const chars = "abcdef0123456789";
  let hash = "";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function generateMockLedger(): number {
  return Math.floor(Math.random() * 1000000) + 4000000;
}
