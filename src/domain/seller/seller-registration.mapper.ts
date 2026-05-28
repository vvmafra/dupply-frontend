import { formatCurrencyBRL, formatTaxId } from "@/lib/formatters";
import {
  isBusinessRelationsComplete,
  isCompanyComplete,
  isLegalRepresentativeComplete,
} from "@/domain/seller/seller-profile.mapper";
import type {
  SellerRegistrationBusinessRelationsValues,
  SellerRegistrationCompanyValues,
  SellerRegistrationFormValues,
  SellerRegistrationRepresentativeValues,
} from "@/domain/seller/seller-registration.schema";
import {
  createEmptyCounterparties,
  createInitialSellerRegistrationValues,
} from "@/domain/seller/seller-registration.schema";
import type {
  BusinessRelationDTO,
  SellerPublicViewDTO,
  UpdateSellerMetadataRequestDTO,
} from "@/services/seller.dto";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function parseReais(formatted: string): number {
  const cleaned = formatted
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

export function formatReais(value: number): string {
  return formatCurrencyBRL(value);
}

function parseSharePercentage(value: string): number | undefined {
  const cleaned = value.replace(/%/g, "").replace(",", ".").trim();
  if (!cleaned) {
    return undefined;
  }

  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function mapCounterpartyToDto(counterparty: {
  legalName: string;
  taxId: string;
  averageShare?: string;
}): BusinessRelationDTO | null {
  const legalName = counterparty.legalName.trim();
  const cnpj = digitsOnly(counterparty.taxId);

  if (!legalName || !cnpj) {
    return null;
  }

  const relation: BusinessRelationDTO = { legalName, cnpj };
  const sharePercentage = counterparty.averageShare
    ? parseSharePercentage(counterparty.averageShare)
    : undefined;

  if (sharePercentage !== undefined) {
    relation.sharePercentage = sharePercentage;
  }

  return relation;
}

function padCounterparties(
  items: BusinessRelationDTO[] | undefined,
): SellerRegistrationFormValues["clients"] {
  const mapped = (items ?? []).map((item) => ({
    legalName: item.legalName ?? "",
    taxId: item.cnpj ? formatTaxId(item.cnpj) : "",
    averageShare:
      item.sharePercentage != null ? `${item.sharePercentage}%` : "",
  }));

  const padded = [...mapped];
  while (padded.length < 5) {
    padded.push(...createEmptyCounterparties().slice(0, 1));
  }

  return padded.slice(0, 5);
}

export function mapFormToCompanyPatch(
  values: SellerRegistrationCompanyValues,
): UpdateSellerMetadataRequestDTO {
  return {
    companyMetaData: {
      legalName: values.legalName.trim(),
      cnpj: digitsOnly(values.taxId),
      foundingDate: values.foundationDate,
      shareCapital: parseReais(values.shareCapital),
      annualRevenue: parseReais(values.revenueLast12Months),
      corporateEmail: values.corporateEmail.trim(),
      phone: digitsOnly(values.phone),
      businessDescription: values.businessDescription.trim(),
      address: {
        zipCode: digitsOnly(values.zipCode),
        state: values.state.trim().toUpperCase(),
        street: values.street.trim(),
        number: values.number.trim(),
        complement: values.complement?.trim() || undefined,
        neighborhood: values.neighborhood.trim(),
        city: values.city.trim(),
      },
    },
  };
}

export function mapFormToRepresentativePatch(
  values: SellerRegistrationRepresentativeValues,
): UpdateSellerMetadataRequestDTO {
  return {
    legalRepresentativeMetaData: {
      fullName: values.representativeName.trim(),
      cpf: digitsOnly(values.representativeCpf),
      email: values.representativeEmail.trim(),
      phone: digitsOnly(values.representativePhone),
      role: values.representativeRole.trim(),
    },
  };
}

export function mapFormToRelationsPatch(
  values: SellerRegistrationBusinessRelationsValues,
): UpdateSellerMetadataRequestDTO {
  const clients = values.clients
    .map(mapCounterpartyToDto)
    .filter((client): client is BusinessRelationDTO => client !== null);
  const suppliers = values.suppliers
    .map(mapCounterpartyToDto)
    .filter((supplier): supplier is BusinessRelationDTO => supplier !== null);

  return {
    businessRelationsMetaData: {
      clients,
      suppliers,
    },
  };
}

export function mapSellerDtoToRegistrationForm(
  dto: SellerPublicViewDTO,
): SellerRegistrationFormValues {
  const company = dto.companyMetaData;
  const legal = dto.legalRepresentativeMetaData;
  const address = company.address;
  const initialDocuments = createInitialSellerRegistrationValues().documents;

  return {
    responsibleName: dto.name ?? "",
    email: "",
    password: "",
    confirmPassword: "",
    legalName: company.legalName ?? "",
    taxId: company.cnpj ? formatTaxId(company.cnpj) : "",
    foundationDate: company.foundingDate ?? "",
    shareCapital:
      company.shareCapital != null && !Number.isNaN(company.shareCapital)
        ? formatReais(company.shareCapital)
        : "",
    revenueLast12Months:
      company.annualRevenue != null && !Number.isNaN(company.annualRevenue)
        ? formatReais(company.annualRevenue)
        : "",
    corporateEmail: company.corporateEmail ?? "",
    phone: company.phone ?? "",
    zipCode: address?.zipCode ?? "",
    street: address?.street ?? "",
    number: address?.number ?? "",
    complement: address?.complement ?? "",
    neighborhood: address?.neighborhood ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    businessDescription: company.businessDescription ?? "",
    representativeName: legal.fullName ?? "",
    representativeCpf: legal.cpf ? formatTaxId(legal.cpf) : "",
    representativeEmail: legal.email ?? "",
    representativePhone: legal.phone ?? "",
    representativeRole: legal.role ?? "",
    clients: padCounterparties(dto.businessRelationsMetaData?.clients),
    suppliers: padCounterparties(dto.businessRelationsMetaData?.suppliers),
    documents: initialDocuments,
  };
}

export function resolveRegistrationWizardStepIndex(dto: SellerPublicViewDTO): number {
  if (!isCompanyComplete(dto.companyMetaData)) return 1;
  if (!isLegalRepresentativeComplete(dto.legalRepresentativeMetaData)) return 2;
  if (!isBusinessRelationsComplete(dto)) return 3;
  return 4;
}
