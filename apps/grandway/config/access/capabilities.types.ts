/**
 * What a signed-in account may reach, as flat booleans.
 *
 * One field per rule, named for the thing being permitted rather than for the tier
 * that happens to have it today — a capability survives a backend tier change, a
 * `authorityType === "admin"` sprinkled through twenty components does not.
 *
 * Every field is documented with the backend rule it encodes, because these are the
 * only place in the app where that rule is written down once.
 */
export interface Capabilities {
  // ─── Recruitment ─── the applicant lifecycle funnel.

  /** Leads board — `admin`/`lead_manager`, never `superadmin` (`lead-management/INTEGRATION.md` §1). Full create/edit/lifecycle rights for both. */
  leads: boolean;
  /** Applicants module — read reach. Write rights are the three `applicant*` fields below. */
  applicants: boolean;
  /** Applicant journeys worklist + detail — same tier rule as leads. */
  journeys: boolean;
  /** Offers — full rights for `admin` and `lead_manager` alike, `superadmin` denied. */
  offers: boolean;
  /** Notifications bell + drawer — `superadmin` is 403'd on every endpoint. */
  notifications: boolean;
  /**
   * Reminders — the dated follow-up notes staff set on an applicant or client.
   * `admin`/`lead_manager`, never `superadmin` (`reminders/INTEGRATION.md` §1).
   *
   * **Full rights for both tiers, reads and writes alike — there is no read/write
   * split**, so a reminders panel needs no authority-based control hiding. Kept
   * separate from `notifications` deliberately: that rule is own-feed-only, this
   * one is not, and a Lead Manager who may write reminders never *receives* their
   * due alerts. That asymmetry is `notifications` routing, not an access rule
   * here, and it is why the dashboard's Follow-ups card is not Admin-only.
   */
  reminders: boolean;
  /**
   * The global search box (`/api/v1/search/`) — `admin`/`lead_manager`, never
   * `superadmin`, who is 403'd on both endpoints (`search/INTEGRATION.md` §1).
   *
   * The contract's instruction is to **hide the box entirely** for that authority
   * rather than render one that always fails. Results are additionally narrowed
   * per-bucket by the other capabilities — see the `searchAccess` map in
   * `layouts/admin/Admin.tsx` and `globalSearch.routes.ts`.
   */
  search: boolean;

  // ─── Applicant record ─── deliberately separate from `applicants` (read reach).

  /** May create an applicant. Admin only — a Lead Manager reads the book of work, it does not open new records in it. */
  applicantCreate: boolean;
  /** May edit an applicant's identity/contact/passport/family. Admin only. */
  applicantEdit: boolean;
  /** May move an applicant's status from the list cell or the detail header. Admin only. */
  applicantStatusChange: boolean;

  // ─── Dashboard ───

  /** The `/admin` placement dashboard at all. `superadmin` is 403'd on all eight sections and gets `SuperadminLanding` instead. */
  dashboard: boolean;
  /** The Operations band (the seven standing-measure panels). Admin only — a Lead Manager gets the Leads and Applicants bands, which are the work, not the reporting. */
  dashboardOperations: boolean;

  // ─── Catalogue & reference data ───

  /**
   * The Catalogue **routes and nav** (programs, institutions). Admin only.
   *
   * This does NOT gate institutions *data* reads — `useCountries` still feeds the
   * applicants country tabs, the journeys worklist tabs, `JourneyForm` and two
   * dashboard cards, and the backend still grants a Lead Manager those reads.
   * Gating the hook would silently strip the applicants list's tabs.
   */
  catalogue: boolean;
  /** The checklist worklist / awaiting-setup / templates routes and the Requirements nav group. Admin only. */
  checklists: boolean;
  /**
   * A single checklist's detail route (`/admin/checklists/[id]`). Shared with
   * `lead_manager` even though the lists above are not: the journey Worklist tab and
   * the notification drawer both deep-link here, and it is the only place item-level
   * history lives. Removing it would strand those links.
   */
  checklistDetail: boolean;
  /** Clients directory routes and nav. Admin only. */
  clients: boolean;

  // ─── Administration ───

  /** Account administration (`/admin/authenticate/users`) — `admin`/`superadmin`. */
  users: boolean;
  /** The central audit log — `admin`/`superadmin`. */
  audit: boolean;
  /** The Admin-only uploaded-file review queue (`/admin/files/review`). */
  fileReview: boolean;

  // ─── Documents ─── the generated-document stack, not uploaded files.

  /**
   * May read generated documents at all.
   *
   * For `lead_manager` this is additionally gated on
   * `LEAD_MANAGER_DOCUMENT_READ_ENABLED`, because the backend currently refuses that
   * tier 403 on every documents route, `GET` included
   * (`documents/INTEGRATION.md` §1). See that constant.
   */
  documents: boolean;
  /**
   * The per-applicant workspaces roll-up (`/admin/documents`). Admin only, even once
   * Lead Manager reads are enabled: its `document_count` is computed server-side
   * across all families, so a bank-excluded viewer would be shown a count that does
   * not match what opens — and the count itself discloses that bank documents exist.
   * Staff get `/admin/documents/all`, which filters per family correctly.
   */
  documentWorkspaces: boolean;
  /**
   * May see the two bank families (`bank_statement`, `bank_certificate`).
   *
   * **Frontend exclusion is ergonomics, not a security control** — nothing here stops
   * a hand-edited `/documents/standalone/<id>` URL. Only a backend family scope on
   * the `lead_manager` role enforces it.
   */
  documentBankFamilies: boolean;
  /** May create / edit / change status / archive a document, and recover a snapshot. Admin only. */
  documentWrite: boolean;
}

/** The capability names a route gate can be keyed on. */
export type CapabilityName = keyof Capabilities;
