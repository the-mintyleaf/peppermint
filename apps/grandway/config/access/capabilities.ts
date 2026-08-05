import type { AuthorityType } from "@/modules/admin/authenticate/_shared/authenticate.types";
import type { Capabilities } from "./capabilities.types";

/**
 * Whether a `lead_manager` may read generated documents.
 *
 * **Currently `false`, deliberately.** `documents/INTEGRATION.md` §1: "`lead_manager`
 * and `superadmin` are both refused 403 on every route, `GET` included… A documents
 * panel must be hidden entirely for a Lead Manager — never rendered read-only, never
 * shown empty."
 *
 * The read-only document surfaces are built and wired behind this one flag so that
 * activation is a single-line change, and so the nav entry, the applicant Documents
 * tab, `ApplicantDocumentsPanel` and `OpenDocumentButton` all flip together — a Lead
 * Manager never sees an affordance that 403s.
 *
 * **Do not flip it early.** Until the bank-family exclusion and the read-only editor
 * seam land, this flag alone would grant a Lead Manager unfiltered, fully writable
 * document access. Both of those consume `documentBankFamilies` / `documentWrite`,
 * which are already `false` for the tier — but the surfaces that honour them do not
 * exist yet.
 *
 * Flip to `true` only once **all** of these hold: the backend grants that tier read
 * access scoped to exclude the `bank_statement` and `bank_certificate` families,
 * `docs/backend/documents/` is re-synced, and the frontend family filtering and
 * read-only editor are in place.
 */
const LEAD_MANAGER_DOCUMENT_READ_ENABLED = false;

/** Nothing is permitted until `/me` has answered. */
const NONE: Capabilities = {
  leads: false,
  applicants: false,
  journeys: false,
  offers: false,
  notifications: false,
  applicantCreate: false,
  applicantEdit: false,
  applicantStatusChange: false,
  dashboard: false,
  dashboardOperations: false,
  catalogue: false,
  checklists: false,
  checklistDetail: false,
  clients: false,
  users: false,
  audit: false,
  fileReview: false,
  documents: false,
  documentWorkspaces: false,
  documentBankFamilies: false,
  documentWrite: false,
};

/**
 * The platform-recovery credential. It administers accounts and reads the audit log,
 * and every business backend 403s it — so it gets those two things and nothing else.
 */
const SUPERADMIN: Capabilities = {
  ...NONE,
  users: true,
  audit: true,
};

/** Full operational rights. The only tier that writes documents or applicant records. */
const ADMIN: Capabilities = {
  leads: true,
  applicants: true,
  journeys: true,
  offers: true,
  notifications: true,
  applicantCreate: true,
  applicantEdit: true,
  applicantStatusChange: true,
  dashboard: true,
  dashboardOperations: true,
  catalogue: true,
  checklists: true,
  checklistDetail: true,
  clients: true,
  users: true,
  audit: true,
  fileReview: true,
  documents: true,
  documentWorkspaces: true,
  documentBankFamilies: true,
  documentWrite: true,
};

/**
 * Staff. Works the funnel — leads through offers — and reads everything attached to
 * it, but does not open or alter applicant records, does not administer the
 * catalogue, and sees documents read-only and bank-free.
 */
const LEAD_MANAGER: Capabilities = {
  ...NONE,
  leads: true,
  applicants: true,
  journeys: true,
  offers: true,
  notifications: true,
  dashboard: true,
  checklistDetail: true,
  documents: LEAD_MANAGER_DOCUMENT_READ_ENABLED,
};

/**
 * The single source of truth for "what may this account reach".
 *
 * Pure and total: an unknown or absent `authority_type` yields no capabilities, which
 * is the safe direction and also the correct one while `/me` is in flight.
 *
 * **This function and `useCapabilities` are the only places in the app that read
 * `authority_type`.** Everywhere else consumes capabilities — that is what keeps the
 * `isAdmin` trap (it is `true` for `superadmin` too) from reappearing, and what makes
 * a rule change one edit instead of six.
 */
export function getCapabilities(
  authorityType: AuthorityType | null,
): Capabilities {
  switch (authorityType) {
    case "superadmin":
      return SUPERADMIN;
    case "admin":
      return ADMIN;
    case "lead_manager":
      return LEAD_MANAGER;
    default:
      return NONE;
  }
}
