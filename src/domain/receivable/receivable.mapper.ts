import type { ReceivableDraftValues } from "@/domain/receivable/receivable.schema";
import type {
  ReceivableDetail,
  ReceivableFormValues,
  ReceivableListItem,
} from "@/domain/receivable/receivable.types";
import type {
  CreateReceivableRequestDTO,
  ReceivableMetaDataDTO,
  ReceivableRowDTO,
  UpdateReceivableRequestDTO,
} from "@/services/receivable.dto";
import { digitsOnly } from "@/domain/seller/seller-registration.mapper";

type ParsedReceivableMetaData = ReceivableMetaDataDTO;

function parseReceivableMetaData(raw: string | null): ParsedReceivableMetaData {
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as ParsedReceivableMetaData;
  } catch {
    return {};
  }
}

function buildBaseFields(
  dto: ReceivableRowDTO,
  meta: ParsedReceivableMetaData,
): Omit<ReceivableDetail, "discountPercent"> {
  const submittedAt = dto.status === "created" ? "" : dto.createdAt;

  return {
    id: dto.id,
    status: dto.status,
    sellerId: dto.sellerId,
    payerId: dto.payerId,
    billNumber: meta.billNumber ?? "",
    invoiceNumber: meta.invoiceNumber ?? "",
    type: meta.type ?? "commercial",
    faceValue: dto.value,
    proposedValue: dto.proposedValue,
    dueDate: meta.dueDate ?? "",
    issuedAt: meta.issuedAt ?? "",
    payerCnpj: meta.payerCnpj ?? "",
    payerLegalName: meta.payerLegalName ?? "",
    payerFinancialEmail: meta.payerFinancialEmail ?? "",
    fiscalDocumentType: meta.fiscalDocumentType ?? "nfe",
    fiscalDocumentKey: meta.fiscalDocumentKey ?? "",
    proofType: meta.proofType ?? "delivery",
    payerAcceptanceStatus: meta.payerAcceptanceStatus ?? "pending",
    desiredAnticipationValue: meta.desiredAnticipationValue ?? 0,
    antifraudDeclarationsAccepted: meta.antifraudDeclarationsAccepted ?? false,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    submittedAt,
  };
}

export function mapReceivableRowToListItem(dto: ReceivableRowDTO): ReceivableListItem {
  const meta = parseReceivableMetaData(dto.receivableMetaData);

  return {
    id: dto.id,
    billNumber: meta.billNumber ?? "",
    payerLegalName: meta.payerLegalName ?? "",
    faceValue: dto.value,
    dueDate: meta.dueDate ?? "",
    status: dto.status,
  };
}

export function mapReceivableRowToDetail(dto: ReceivableRowDTO): ReceivableDetail {
  const base = buildBaseFields(dto, parseReceivableMetaData(dto.receivableMetaData));

  if (dto.proposedValue != null && dto.value > 0) {
    return {
      ...base,
      discountPercent: deriveDiscountPercent(dto.value, dto.proposedValue),
    };
  }

  return base;
}

type ReceivableFormInput = ReceivableFormValues | ReceivableDraftValues;

function mapFormToMetaData(values: ReceivableFormInput): ReceivableMetaDataDTO {
  return {
    type: values.type,
    billNumber: values.billNumber.trim(),
    invoiceNumber: values.invoiceNumber.trim(),
    issuedAt: values.issuedAt,
    dueDate: values.dueDate,
    payerCnpj: digitsOnly(values.payerCnpj),
    payerLegalName: values.payerLegalName.trim(),
    payerFinancialEmail: values.payerFinancialEmail.trim(),
    fiscalDocumentType: values.fiscalDocumentType,
    fiscalDocumentKey: values.fiscalDocumentKey.trim(),
    proofType: values.proofType,
    payerAcceptanceStatus: values.payerAcceptanceStatus,
    desiredAnticipationValue: values.desiredAnticipationValue,
    antifraudDeclarationsAccepted: values.antifraudDeclarationsAccepted ?? false,
  };
}

export function mapFormToCreateBody(values: ReceivableFormInput): CreateReceivableRequestDTO {
  const payerCnpj = digitsOnly(values.payerCnpj);

  return {
    payerCnpj,
    payerLegalName: values.payerLegalName.trim(),
    payerFinancialEmail: values.payerFinancialEmail.trim(),
    value: values.faceValue,
    receivableMetaData: mapFormToMetaData(values),
  };
}

export function mapFormToUpdateBody(values: ReceivableFormInput): UpdateReceivableRequestDTO {
  return {
    value: values.faceValue,
    receivableMetaData: mapFormToMetaData(values),
  };
}

export function deriveDiscountPercent(
  faceValueReais: number,
  proposedValueReais: number,
): number {
  if (faceValueReais <= 0) {
    return 0;
  }

  const discount = ((faceValueReais - proposedValueReais) / faceValueReais) * 100;
  return Math.round(discount * 100) / 100;
}
