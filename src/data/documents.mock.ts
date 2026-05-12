import type { DocumentItem } from "@/domain/documents/document.types";
import { REQUIRED_DOCUMENTS } from "@/domain/seller/seller.validation";

export function createInitialDocumentList(): DocumentItem[] {
  return REQUIRED_DOCUMENTS.map((doc) => ({
    id: doc.id,
    name: doc.name,
    description: doc.description,
    required: doc.required,
    status: "PENDING" as const,
  }));
}
