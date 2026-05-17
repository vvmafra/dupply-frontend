import { REQUIRED_DOCUMENTS } from "@/domain/seller/seller.validation";
import type { SellerRegistrationDocumentFile } from "@/domain/risk-analyst/seller-review.types";

const SLUG_BY_SELLER_ID: Record<string, string> = {
  "sel-001": "alpha",
  "sel-002": "nortetech",
  "sel-003": "agrovale",
  "sel-004": "logmais",
  "sel-005": "solarpack",
};

function requiredTemplate(sellerSlug: string): SellerRegistrationDocumentFile[] {
  return REQUIRED_DOCUMENTS.filter((d) => d.required).map((d, i) => ({
    documentId: d.id,
    fileName: `${sellerSlug}_${d.id.replaceAll("-", "_")}.pdf`,
    uploadedAt: new Date(Date.UTC(2025, 4, 6 + (i % 4), 13, 15 + i * 3, 0)).toISOString(),
  }));
}

function withOptional(
  base: SellerRegistrationDocumentFile[],
  sellerSlug: string,
  optionalIds: string[]
): SellerRegistrationDocumentFile[] {
  const extra = optionalIds.map((id, i) => ({
    documentId: id,
    fileName: `${sellerSlug}_${id.replaceAll("-", "_")}.pdf`,
    uploadedAt: new Date(Date.UTC(2025, 4, 14, 9, 20 + i, 0)).toISOString(),
  }));
  return [...base, ...extra];
}

/**
 * Anexos simulados por cedente — alinhados aos IDs de `REQUIRED_DOCUMENTS` do cadastro.
 */
export function getRegistrationDocumentFilesForSeller(sellerId: string): SellerRegistrationDocumentFile[] {
  const slug = SLUG_BY_SELLER_ID[sellerId] ?? "cedente";
  const full = requiredTemplate(slug);

  if (sellerId === "sel-003") {
    return full.slice(0, 7);
  }
  if (sellerId === "sel-001" || sellerId === "sel-002") {
    return withOptional(full, slug, ["procuracao"]);
  }
  if (sellerId === "sel-005") {
    return withOptional(full, slug, ["procuracao", "extrato-endividamento"]);
  }
  return full;
}
