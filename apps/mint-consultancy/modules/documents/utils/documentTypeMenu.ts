import { documentTypeList, getDocumentTypeConfig } from "../documentTypeConfig";
import { BANK_INSTITUTIONS, WODA_VARIANTS } from "../documentTypeDefinitions";
import type { Document, DocumentType } from "../documents.types";

export function getAvailableDocumentTypes(studentId: string | null, documents: Document[]) {
  return documentTypeList.filter((config) => {
    if (config.requiresStudent && !studentId) return false;
    if (config.uniquePerStudent && documents.some((d) => d.type === config.type)) {
      return false;
    }
    return true;
  });
}

export function isTypeAvailable(
  type: DocumentType,
  studentId: string | null,
  documents: Document[],
) {
  return getAvailableDocumentTypes(studentId, documents).some((c) => c.type === type);
}

export function getStudentMenuTypes(studentId: string | null, documents: Document[]) {
  const available = new Set(getAvailableDocumentTypes(studentId, documents).map((c) => c.type));
  return (["student-certificate", "student-cv"] as const).filter((type) => available.has(type));
}

export function getWodaMenuTypes(studentId: string | null, documents: Document[]) {
  const available = new Set(getAvailableDocumentTypes(studentId, documents).map((c) => c.type));
  return WODA_VARIANTS.filter((v) => available.has(v.slug));
}

export function getBankMenuInstitutions(studentId: string | null, documents: Document[]) {
  const available = new Set(getAvailableDocumentTypes(studentId, documents).map((c) => c.type));
  return BANK_INSTITUTIONS.map((bank) => ({
    ...bank,
    certificateType: `bank-${bank.slugKey}-certificate` as DocumentType,
    statementType: `bank-${bank.slugKey}-statement` as DocumentType,
    certificateAvailable: available.has(`bank-${bank.slugKey}-certificate`),
    statementAvailable: available.has(`bank-${bank.slugKey}-statement`),
  })).filter((b) => b.certificateAvailable || b.statementAvailable);
}

export function getWodaMenuLabel(label: string) {
  return label.replace(/^WODA — /, "");
}

export function getBankVariantLabel(type: DocumentType) {
  return getDocumentTypeConfig(type).label.replace(/^.+ (Certificate|Statement)$/, "$1");
}
