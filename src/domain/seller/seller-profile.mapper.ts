import type {
  CompanyAddressDTO,
  CompanyMetaDataDTO,
  LegalRepresentativeMetaDataDTO,
  SellerPublicViewDTO,
  SellerStatusDTO,
} from "@/services/seller.dto";
import type { SellerCompany } from "./seller.types";

export type MetadataCompleteness = {
  percent: number;
  step: number;
  isComplete: boolean;
};

function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function isFilledNumber(value: unknown): boolean {
  return typeof value === "number" && !Number.isNaN(value);
}

function isAddressComplete(address: CompanyAddressDTO | undefined): boolean {
  if (!address) return false;
  return (
    isNonEmptyString(address.zipCode) &&
    isNonEmptyString(address.state) &&
    isNonEmptyString(address.street) &&
    isNonEmptyString(address.number) &&
    isNonEmptyString(address.neighborhood) &&
    isNonEmptyString(address.city)
  );
}

export function isCompanyComplete(company: CompanyMetaDataDTO | undefined): boolean {
  if (!company) return false;
  return (
    isNonEmptyString(company.legalName) &&
    isNonEmptyString(company.cnpj) &&
    isNonEmptyString(company.foundingDate) &&
    isFilledNumber(company.shareCapital) &&
    isFilledNumber(company.annualRevenue) &&
    isNonEmptyString(company.corporateEmail) &&
    isNonEmptyString(company.phone) &&
    isNonEmptyString(company.businessDescription) &&
    isAddressComplete(company.address)
  );
}

export function isLegalRepresentativeComplete(
  legal: LegalRepresentativeMetaDataDTO | undefined,
): boolean {
  if (!legal) return false;
  return (
    isNonEmptyString(legal.fullName) &&
    isNonEmptyString(legal.cpf) &&
    isNonEmptyString(legal.email) &&
    isNonEmptyString(legal.phone) &&
    isNonEmptyString(legal.role)
  );
}

function hasValidClient(dto: SellerPublicViewDTO): boolean {
  return dto.businessRelationsMetaData.clients.some(
    (c) => isNonEmptyString(c.legalName) && isNonEmptyString(c.cnpj),
  );
}

function hasValidSupplier(dto: SellerPublicViewDTO): boolean {
  return dto.businessRelationsMetaData.suppliers.some(
    (s) => isNonEmptyString(s.legalName) && isNonEmptyString(s.cnpj),
  );
}

export function isBusinessRelationsComplete(dto: SellerPublicViewDTO): boolean {
  return hasValidClient(dto) && hasValidSupplier(dto);
}

function countFilledRequiredFields(dto: SellerPublicViewDTO): number {
  const company = dto.companyMetaData;
  const legal = dto.legalRepresentativeMetaData;
  const address = company.address;

  const checks: boolean[] = [
    isNonEmptyString(company.legalName),
    isNonEmptyString(company.cnpj),
    isNonEmptyString(company.foundingDate),
    isFilledNumber(company.shareCapital),
    isFilledNumber(company.annualRevenue),
    isNonEmptyString(company.corporateEmail),
    isNonEmptyString(company.phone),
    isNonEmptyString(company.businessDescription),
    isNonEmptyString(address?.zipCode),
    isNonEmptyString(address?.state),
    isNonEmptyString(address?.street),
    isNonEmptyString(address?.number),
    isNonEmptyString(address?.neighborhood),
    isNonEmptyString(address?.city),
    isNonEmptyString(legal.fullName),
    isNonEmptyString(legal.cpf),
    isNonEmptyString(legal.email),
    isNonEmptyString(legal.phone),
    isNonEmptyString(legal.role),
    hasValidClient(dto),
    hasValidSupplier(dto),
  ];

  return checks.filter(Boolean).length;
}

const TOTAL_REQUIRED_FIELDS = 21;

export function computeMetadataCompleteness(dto: SellerPublicViewDTO): MetadataCompleteness {
  const filled = countFilledRequiredFields(dto);
  const percent = Math.round((filled / TOTAL_REQUIRED_FIELDS) * 100);
  const companyDone = isCompanyComplete(dto.companyMetaData);
  const legalDone = isLegalRepresentativeComplete(dto.legalRepresentativeMetaData);
  const relationsDone = isBusinessRelationsComplete(dto);

  let step = 1;
  if (companyDone && legalDone && relationsDone) {
    step = 4;
  } else if (companyDone && legalDone) {
    step = 3;
  } else if (companyDone) {
    step = 2;
  }

  return {
    percent,
    step,
    isComplete: companyDone && legalDone && relationsDone,
  };
}

export function deriveValidationFields(
  status: SellerStatusDTO,
  completeness: MetadataCompleteness,
): Pick<SellerCompany, "validationStatus" | "kycStatus" | "analystDuplicatasAccess"> {
  switch (status) {
    case "created":
      return {
        validationStatus:
          completeness.percent === 0
            ? "NOT_STARTED"
            : completeness.isComplete
              ? "KYC_PENDING"
              : "DOCUMENTS_PENDING",
        kycStatus: "PENDING",
        analystDuplicatasAccess: "PENDING",
      };
    case "in_review":
      return {
        validationStatus: "UNDER_REVIEW",
        kycStatus: "APPROVED",
        analystDuplicatasAccess: "UNDER_REVIEW",
      };
    case "active":
      return {
        validationStatus: "APPROVED",
        kycStatus: "APPROVED",
        analystDuplicatasAccess: "APPROVED",
      };
    case "inactive":
      return {
        validationStatus: "REJECTED",
        kycStatus: "REJECTED",
        analystDuplicatasAccess: "REJECTED",
      };
  }
}

export function mapSellerDtoToCompany(dto: SellerPublicViewDTO): SellerCompany {
  const completeness = computeMetadataCompleteness(dto);
  const derived = deriveValidationFields(dto.status, completeness);

  return {
    id: dto.id,
    legalName: dto.companyMetaData.legalName || dto.name,
    taxId: dto.companyMetaData.cnpj,
    email: dto.companyMetaData.corporateEmail,
    phone: dto.companyMetaData.phone,
    representativeName: dto.legalRepresentativeMetaData.fullName,
    representativeCpf: dto.legalRepresentativeMetaData.cpf,
    validationStatus: derived.validationStatus,
    kycStatus: derived.kycStatus,
    analystDuplicatasAccess: derived.analystDuplicatasAccess,
    documentsProgress: completeness.percent,
    onboardingStep: completeness.step,
    createdAt: dto.createdAt,
  };
}
