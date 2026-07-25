import type { DocumentFamily, DocumentStatus } from "@/modules/documents";

/** Human labels for the six document families (`documents/INTEGRATION.md` §5). */
export const FAMILY_LABELS: Record<DocumentFamily, string> = {
  student: "Student",
  woda: "Ward office",
  lor: "Recommendation",
  moi: "Medium of instruction",
  bank_statement: "Bank statement",
  bank_certificate: "Bank certificate",
};

export const FAMILY_COLORS: Record<DocumentFamily, string> = {
  student: "blue",
  woda: "grape",
  lor: "teal",
  moi: "cyan",
  bank_statement: "orange",
  bank_certificate: "yellow",
};

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: "Draft",
  ready: "Ready",
  archived: "Archived",
};

export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: "gray",
  ready: "blue",
  archived: "dark",
};
