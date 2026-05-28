export type SellerStatusDTO = "created" | "in_review" | "active" | "inactive";

export type CompanyAddressDTO = {
  zipCode: string;
  state: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
};

export type CompanyMetaDataDTO = {
  legalName: string;
  cnpj: string;
  foundingDate: string;
  shareCapital: number;
  annualRevenue: number;
  corporateEmail: string;
  phone: string;
  businessDescription: string;
  address: CompanyAddressDTO;
};

export type LegalRepresentativeMetaDataDTO = {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  role: string;
};

export type BusinessRelationDTO = {
  legalName: string;
  cnpj: string;
  sharePercentage?: number;
};

export type BusinessRelationsMetaDataDTO = {
  clients: BusinessRelationDTO[];
  suppliers: BusinessRelationDTO[];
};

export type SellerPublicViewDTO = {
  id: string;
  status: SellerStatusDTO;
  name: string;
  companyMetaData: CompanyMetaDataDTO;
  legalRepresentativeMetaData: LegalRepresentativeMetaDataDTO;
  businessRelationsMetaData: BusinessRelationsMetaDataDTO;
  accountId: string;
  walletId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateSellerMetadataRequestDTO = {
  name?: string;
  companyMetaData?: Partial<CompanyMetaDataDTO>;
  legalRepresentativeMetaData?: Partial<LegalRepresentativeMetaDataDTO>;
  businessRelationsMetaData?: Partial<BusinessRelationsMetaDataDTO>;
};

export type SellerErrorBodyDTO = {
  error:
    | "seller_not_found"
    | "forbidden"
    | "metadata_locked"
    | "validation_error"
    | "incomplete_metadata"
    | "invalid_status_transition"
    | "invalid_status_for_submit"
    | "seller_not_active"
    | "unauthorized";
  message?: string;
};
