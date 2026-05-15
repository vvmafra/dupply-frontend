import { z } from "zod";
import { REQUIRED_DOCUMENTS } from "@/domain/seller/seller.validation";

const requiredDocumentIds = REQUIRED_DOCUMENTS.filter((document) => document.required).map(
  (document) => document.id
);

const counterpartySchema = z.object({
  legalName: z.string().trim().min(1, "Informe a razão social"),
  taxId: z.string().trim().min(14, "Informe um CNPJ válido"),
  averageShare: z.string().trim().optional(),
});

export const sellerRegistrationAccessSchema = z
  .object({
    responsibleName: z.string().trim().min(1, "Informe o nome do responsável"),
    email: z.string().trim().email("Informe um e-mail válido"),
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const sellerRegistrationCompanySchema = z.object({
  legalName: z.string().trim().min(1, "Informe a razão social"),
  taxId: z.string().trim().min(14, "Informe um CNPJ válido"),
  foundationDate: z.string().min(1, "Informe a data de fundação"),
  shareCapital: z.string().trim().min(1, "Informe o capital social"),
  revenueLast12Months: z.string().trim().min(1, "Informe o faturamento dos últimos 12 meses"),
  corporateEmail: z.string().trim().email("Informe um e-mail corporativo válido"),
  phone: z.string().trim().min(10, "Informe um telefone válido"),
  zipCode: z.string().trim().min(8, "Informe o CEP"),
  street: z.string().trim().min(1, "Informe o logradouro"),
  number: z.string().trim().min(1, "Informe o número"),
  complement: z.string().trim().optional(),
  neighborhood: z.string().trim().min(1, "Informe o bairro"),
  city: z.string().trim().min(1, "Informe a cidade"),
  state: z.string().trim().length(2, "Informe a UF"),
  businessDescription: z.string().trim().min(20, "Descreva a atividade da empresa"),
});

export const sellerRegistrationRepresentativeSchema = z.object({
  representativeName: z.string().trim().min(1, "Informe o nome do representante"),
  representativeCpf: z.string().trim().min(11, "Informe um CPF válido"),
  representativeEmail: z.string().trim().email("Informe um e-mail pessoal válido"),
  representativePhone: z.string().trim().min(10, "Informe um telefone pessoal válido"),
});

export const sellerRegistrationBusinessRelationsSchema = z.object({
  clients: z.array(counterpartySchema).length(5),
  suppliers: z.array(counterpartySchema).length(5),
});

export const sellerRegistrationDocumentsSchema = z.object({
  documents: z
    .record(z.string(), z.boolean())
    .superRefine((documents, context) => {
      for (const documentId of requiredDocumentIds) {
        if (!documents[documentId]) {
          context.addIssue({
            code: "custom",
            message: "Anexe todos os documentos obrigatórios",
            path: ["documents"],
          });
          break;
        }
      }
    }),
});

export const sellerRegistrationSchema = sellerRegistrationAccessSchema
  .and(sellerRegistrationCompanySchema)
  .and(sellerRegistrationRepresentativeSchema)
  .and(sellerRegistrationBusinessRelationsSchema)
  .and(sellerRegistrationDocumentsSchema);

export type SellerRegistrationAccessValues = z.infer<typeof sellerRegistrationAccessSchema>;
export type SellerRegistrationCompanyValues = z.infer<typeof sellerRegistrationCompanySchema>;
export type SellerRegistrationRepresentativeValues = z.infer<typeof sellerRegistrationRepresentativeSchema>;
export type SellerRegistrationBusinessRelationsValues = z.infer<typeof sellerRegistrationBusinessRelationsSchema>;
export type SellerRegistrationDocumentsValues = z.infer<typeof sellerRegistrationDocumentsSchema>;
export type SellerRegistrationFormValues = z.infer<typeof sellerRegistrationSchema>;

export const SELLER_REGISTRATION_STEPS = [
  {
    id: "access",
    title: "Acesso",
    description: "Crie as credenciais de acesso do responsável pelo cadastro.",
    schema: sellerRegistrationAccessSchema,
  },
  {
    id: "company",
    title: "Empresa",
    description: "Informe os dados cadastrais da empresa cedente.",
    schema: sellerRegistrationCompanySchema,
  },
  {
    id: "representative",
    title: "Representante",
    description: "Informe os dados do representante legal.",
    schema: sellerRegistrationRepresentativeSchema,
  },
  {
    id: "relations",
    title: "Clientes e fornecedores",
    description: "Liste os 5 principais clientes e fornecedores da empresa.",
    schema: sellerRegistrationBusinessRelationsSchema,
  },
  {
    id: "documents",
    title: "Documentos",
    description: "Anexe a documentação obrigatória para análise do fundo.",
    schema: sellerRegistrationDocumentsSchema,
  },
] as const;

export type SellerRegistrationStepId = (typeof SELLER_REGISTRATION_STEPS)[number]["id"];

export function createEmptyCounterparties() {
  return Array.from({ length: 5 }, () => ({
    legalName: "",
    taxId: "",
    averageShare: "",
  }));
}

export function createInitialSellerRegistrationValues(): SellerRegistrationFormValues {
  const documents = Object.fromEntries(
    REQUIRED_DOCUMENTS.map((document) => [document.id, false])
  ) as Record<string, boolean>;

  return {
    responsibleName: "",
    email: "",
    password: "",
    confirmPassword: "",
    legalName: "",
    taxId: "",
    foundationDate: "",
    shareCapital: "",
    revenueLast12Months: "",
    corporateEmail: "",
    phone: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    businessDescription: "",
    representativeName: "",
    representativeCpf: "",
    representativeEmail: "",
    representativePhone: "",
    clients: createEmptyCounterparties(),
    suppliers: createEmptyCounterparties(),
    documents,
  };
}
