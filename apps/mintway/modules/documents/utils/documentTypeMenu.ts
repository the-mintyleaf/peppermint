import { documentTypeList, getDocumentTypeConfig } from "../documentTypeConfig";
import {
  BANK_INSTITUTIONS,
  LOR_INSTITUTIONS,
  MOI_INSTITUTIONS,
  WODA_VARIANTS,
} from "../documentTypeDefinitions";
import type { Document, DocumentType } from "../documents.types";

export function getAvailableDocumentTypes(
  applicantId: string | null,
  documents: Document[],
) {
  return documentTypeList.filter((config) => {
    if (config.requiresStudent && !applicantId) return false;
    if (
      config.uniquePerStudent &&
      documents.some((d) => d.type === config.type)
    ) {
      return false;
    }
    return true;
  });
}

export function isTypeAvailable(
  type: DocumentType,
  applicantId: string | null,
  documents: Document[],
) {
  return getAvailableDocumentTypes(applicantId, documents).some(
    (c) => c.type === type,
  );
}

export function getStudentMenuTypes(
  applicantId: string | null,
  documents: Document[],
) {
  const available = new Set(
    getAvailableDocumentTypes(applicantId, documents).map((c) => c.type),
  );
  return (
    [
      "student-certificate",
      "student-cv",
      "student-cv-standard",
      "student-cv-extended",
    ] as const
  ).filter((type) => available.has(type));
}

export function getWodaMenuTypes(
  applicantId: string | null,
  documents: Document[],
) {
  const available = new Set(
    getAvailableDocumentTypes(applicantId, documents).map((c) => c.type),
  );
  return WODA_VARIANTS.filter((v) => available.has(v.slug));
}

export function getBankMenuInstitutions(
  applicantId: string | null,
  documents: Document[],
) {
  const available = new Set(
    getAvailableDocumentTypes(applicantId, documents).map((c) => c.type),
  );
  return BANK_INSTITUTIONS.map((bank) => ({
    ...bank,
    certificateType: `bank-${bank.slugKey}-certificate` as DocumentType,
    statementType: `bank-${bank.slugKey}-statement` as DocumentType,
    certificateAvailable: available.has(`bank-${bank.slugKey}-certificate`),
    statementAvailable: available.has(`bank-${bank.slugKey}-statement`),
  })).filter((b) => b.certificateAvailable || b.statementAvailable);
}

export function getLorMenuTypes(
  applicantId: string | null,
  documents: Document[],
) {
  const available = new Set(
    getAvailableDocumentTypes(applicantId, documents).map((c) => c.type),
  );
  return LOR_INSTITUTIONS.filter((l) => available.has(l.slug));
}

export function getMoiMenuTypes(
  applicantId: string | null,
  documents: Document[],
) {
  const available = new Set(
    getAvailableDocumentTypes(applicantId, documents).map((c) => c.type),
  );
  return MOI_INSTITUTIONS.filter((m) => available.has(m.slug));
}

export function getLorMenuLabel(label: string) {
  return label.replace(/^LOR — /, "");
}

export function getMoiMenuLabel(label: string) {
  return label.replace(/^MOI — /, "");
}

export function getWodaMenuLabel(label: string) {
  return label.replace(/^WODA — /, "");
}

export function getBankVariantLabel(type: DocumentType) {
  return getDocumentTypeConfig(type).label.replace(
    /^.+ (Certificate|Statement)$/,
    "$1",
  );
}
