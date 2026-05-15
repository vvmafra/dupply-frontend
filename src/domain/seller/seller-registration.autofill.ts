import { REQUIRED_DOCUMENTS } from "@/domain/seller/seller.validation";
import type {
  SellerRegistrationFormValues,
  SellerRegistrationStepId,
} from "@/domain/seller/seller-registration.schema";

const DEMO_CLIENTS: SellerRegistrationFormValues["clients"] = [
  {
    legalName: "Universidade de São Paulo - Campus USP",
    taxId: "63.025.530/0001-04",
    averageShare: "30%",
  },
  {
    legalName: "Faculdade São Leopoldo Mandic",
    taxId: "04.600.555/0001-25",
    averageShare: "30%",
  },
  {
    legalName: "Faculdade IOA",
    taxId: "58.059.142/0001-04",
    averageShare: "20%",
  },
  {
    legalName: "Faculdade de Ciências Médicas de Belo Horizonte",
    taxId: "17.178.203/0001-75",
    averageShare: "10%",
  },
  {
    legalName: "Feluma",
    taxId: "17.178.203/0002-56",
    averageShare: "10%",
  },
];

const DEMO_SUPPLIERS: SellerRegistrationFormValues["suppliers"] = [
  {
    legalName: "SOCO System Brasil Ltda",
    taxId: "11.613.516/0001-28",
    averageShare: "30%",
  },
  {
    legalName: "TPC Logística Inteligente",
    taxId: "01.544.197/0001-92",
    averageShare: "20%",
  },
  {
    legalName: "WAK Soluções Odontológicas Ltda",
    taxId: "52.692.691/0001-35",
    averageShare: "30%",
  },
  {
    legalName: "COXO Medical Instrument Co.",
    taxId: "00.000.000/0001-00",
    averageShare: "10%",
  },
  {
    legalName: "Woodpecker SP Comercial Importadora Ltda",
    taxId: "17.610.036/0001-90",
    averageShare: "10%",
  },
];

export function getSellerRegistrationStepAutofill(
  stepId: SellerRegistrationStepId
): Partial<SellerRegistrationFormValues> {
  switch (stepId) {
    case "access":
      return {
        responsibleName: "Maria Santos Silva",
        email: "maria.santos@wakcomercio.com.br",
        password: "demo12345",
        confirmPassword: "demo12345",
      };
    case "company":
      return {
        legalName: "WAK COMERCIO EXTERIOR LTDA",
        taxId: "22.306.299/0001-40",
        foundationDate: "2015-04-23",
        shareCapital: "500000",
        revenueLast12Months: "3715374.60",
        corporateEmail: "contato@wakcomercio.com.br",
        phone: "(11) 5116-3976",
        zipCode: "04552-040",
        street: "Avenida Brigadeiro Faria Lima",
        number: "4300",
        complement: "6º andar",
        neighborhood: "Itaim Bibi",
        city: "São Paulo",
        state: "SP",
        businessDescription:
          "Comércio atacadista e importação de equipamentos e insumos odontológicos, com vendas a distribuidores e clientes institucionais em todo o Brasil.",
      };
    case "representative":
      return {
        representativeName: "Lin Chai",
        representativeCpf: "123.456.789-00",
        representativeEmail: "lin.chai@email.com",
        representativePhone: "(11) 98888-7766",
      };
    case "relations":
      return {
        clients: DEMO_CLIENTS,
        suppliers: DEMO_SUPPLIERS,
      };
    case "documents":
      return {
        documents: Object.fromEntries(
          REQUIRED_DOCUMENTS.filter((document) => document.required).map((document) => [
            document.id,
            true,
          ])
        ),
      };
  }
}
