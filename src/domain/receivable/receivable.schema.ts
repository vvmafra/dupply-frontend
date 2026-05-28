import { z } from "zod";
import { digitsOnly } from "@/domain/seller/seller-registration.mapper";

const receivableCoreSchema = z.object({
  type: z.enum(["commercial", "service"]),
  billNumber: z.string().trim().min(1, "Obrigatório"),
  invoiceNumber: z.string().trim().min(1, "Obrigatório"),
  faceValue: z.number().positive("Informe um valor válido"),
  issuedAt: z.string().min(1, "Obrigatório"),
  dueDate: z.string().min(1, "Obrigatório"),
  payerCnpj: z
    .string()
    .refine((value) => digitsOnly(value).length === 14, "CNPJ inválido"),
  payerLegalName: z.string().trim().min(1, "Obrigatório"),
  payerFinancialEmail: z.string().email("E-mail inválido"),
  fiscalDocumentType: z.enum(["nfe", "nfce", "nfse", "other"]),
  fiscalDocumentKey: z.string().trim().min(1, "Obrigatório"),
  proofType: z.enum(["delivery", "acceptance", "service_provision"]),
  payerAcceptanceStatus: z.enum(["accepted", "pending", "refused"]),
  desiredAnticipationValue: z.number().positive("Informe o valor desejado"),
});

export const receivableDraftSchema = receivableCoreSchema.extend({
  antifraudDeclarationsAccepted: z.boolean().optional(),
  fiscalDocumentUploaded: z.boolean().optional(),
  proofDocumentUploaded: z.boolean().optional(),
});

export const receivableSubmitSchema = receivableCoreSchema.extend({
  antifraudDeclarationsAccepted: z.literal(true, {
    message: "Aceite as declarações para continuar",
  }),
});

export type ReceivableDraftValues = z.infer<typeof receivableDraftSchema>;
export type ReceivableSubmitValues = z.infer<typeof receivableSubmitSchema>;
