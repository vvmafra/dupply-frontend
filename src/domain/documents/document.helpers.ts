import type { DocumentItem } from "./document.types";

export function calculateDocumentProgress(documents: DocumentItem[]): number {
  if (documents.length === 0) return 0;
  const done = documents.filter((d) => d.status !== "PENDING").length;
  return Math.round((done / documents.length) * 100);
}

export function hasPendingRequired(documents: DocumentItem[]): boolean {
  return documents.some((d) => d.required && d.status === "PENDING");
}
