import { documentTypeList } from "../documentTypeConfig";
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

/**
 * A bank certificate and statement live and die as a pair, so the menu offers one entry
 * per bank and only while the *whole* pair can be added — i.e. neither half exists yet.
 * (An orphaned single half, from legacy data, is intentionally not re-pairable here.)
 */
export function getBankMenuInstitutions(
  applicantId: string | null,
  documents: Document[],
) {
  const available = new Set(
    getAvailableDocumentTypes(applicantId, documents).map((c) => c.type),
  );
  return BANK_INSTITUTIONS.map((bank) => ({
    slugKey: bank.slugKey,
    label: bank.label,
    certificateType: `bank-${bank.slugKey}-certificate` as DocumentType,
    statementType: `bank-${bank.slugKey}-statement` as DocumentType,
  })).filter(
    (b) => available.has(b.certificateType) && available.has(b.statementType),
  );
}

/**
 * The other half of a bank pair: certificate ⇄ statement for the same bank. Returns null
 * for any non-bank type. Used to create and delete the two documents together.
 */
export function getBankPartnerType(type: DocumentType): DocumentType | null {
  const match = type.match(/^bank-(.+)-(certificate|statement)$/);
  if (!match) return null;
  const [, slugKey, variant] = match;
  const partner = variant === "certificate" ? "statement" : "certificate";
  return `bank-${slugKey}-${partner}` as DocumentType;
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
