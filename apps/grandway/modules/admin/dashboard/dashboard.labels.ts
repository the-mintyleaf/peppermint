// Labels/colors for badges and section headings this module renders directly.
// Per-row STATUS enums that another module already owns a label map for are
// imported concretely from that module (never redefined) — see the imports
// used inside each `components/*` section. This file only carries labels with
// no existing home: the two enums neither `applicants` nor `documents` export
// a reusable map for, plus the dashboard's own section/group headings.

import type { ApplicantStatusKey, DocumentRow } from "./dashboard.types";

// ── Enum labels with no existing reusable map elsewhere ───────────────────────

/** Mirrors the inline (non-exported) map in `applicants.columns.tsx`. */
export const APPLICANT_STATUS_LABELS: Record<ApplicantStatusKey, string> = {
  active: "Active",
  dormant: "Dormant",
  archived: "Archived",
};

export const APPLICANT_STATUS_COLORS: Record<ApplicantStatusKey, string> = {
  active: "green",
  dormant: "yellow",
  archived: "gray",
};

/** `documents.status.ts`'s `STATUS_META` already covers label+color for `DocumentStatusKey`. */
export const DOCUMENT_FAMILY_LABELS: Record<DocumentRow["family"], string> = {
  student: "Student",
  woda: "WODA",
  lor: "Letter of Recommendation",
  moi: "Medium of Instruction",
  bank_statement: "Bank Statement",
  bank_certificate: "Bank Certificate",
};

// ── Section headings ─────────────────────────────────────────────────────────

export const TODAY_WORKLIST_LABELS = {
  overdue_checklist_items: "Overdue checklist items",
  due_soon_checklist_items: "Due soon",
  offers_awaiting_response: "Offers awaiting a response",
  files_awaiting_verification: "Files awaiting verification",
  documents_in_progress: "Documents in progress",
  stale_leads: "Stale leads",
} as const;

/** Rendered SEPARATELY, by cause — never merged into one urgency-sorted list. */
export const BLOCKER_GROUP_LABELS = {
  blocked_checklist_items: "Blocked checklist items",
  journeys_without_a_checklist: "Journeys without a checklist",
  expiring_passports: "Expiring passports",
  overdue_offers: "Overdue offers",
  rejected_files: "Rejected files",
} as const;

/** Rendered as three SEPARATE tables — never joined or summed. */
export const WORKLOAD_LIST_LABELS = {
  leads: "Leads",
  checklist_items: "Checklist items",
  offers: "Offers",
} as const;
