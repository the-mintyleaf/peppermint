/** `docs/backend/applicants/INTEGRATION.md` §5. */
export type ApplicantStatus = "active" | "dormant" | "archived";

/** Immutable, server-set — never accepted from a client on any endpoint. */
export type CreationSource = "lead_conversion" | "direct_admin";

export type Gender = "male" | "female" | "other" | "undisclosed";

/** Shared enum shape with `leads` (same underlying validator). */
export type ContactNumberLabel =
  | "mobile"
  | "home"
  | "work"
  | "whatsapp"
  | "viber"
  | "other";

export type AddressType = "permanent" | "current";

export type FamilyRelationship =
  | "father"
  | "mother"
  | "spouse"
  | "sibling"
  | "child"
  | "guardian"
  | "other";

export type HistoryActorType =
  | "superadmin"
  | "admin"
  | "lead_manager"
  | "system"
  | "ai";

export type HistoryAction =
  | "applicant_created"
  | "applicant_updated"
  | "applicant_contact_changed"
  | "applicant_address_changed"
  | "applicant_passport_changed"
  | "applicant_family_changed"
  | "applicant_emergency_contact_changed"
  | "applicant_status_changed";

/** Never sent by a client. */
export interface BsDate {
  year: number;
  month: number;
  day: number;
  month_name: string;
  display: string;
}

export interface UserBrief {
  id: string;
  username: string;
  display_name: string;
}

/** `(applicant, number)` unique; `number` regex shared with `leads`. */
export interface ApplicantContactNumber {
  id?: string;
  number: string;
  label: ContactNumberLabel;
  is_primary: boolean;
}

/** Every component optional; at most one row per `address_type`. */
export interface ApplicantAddress {
  id?: string;
  address_type: AddressType;
  country?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  street_address?: string;
  postal_code?: string;
}

/** One per applicant — a renewal overwrites it (upsert, not a delta). */
export interface PassportDetail {
  id?: string;
  passport_number: string;
  issuing_country?: string;
  place_of_issue?: string;
  issued_date?: string;
  issued_date_bs?: BsDate;
  expiry_date?: string;
  expiry_date_bs?: BsDate;
}

/** `full_name` may be blank — only `relationship` is required (DATA_CONTRACT §5). */
export interface FamilyMember {
  id?: string;
  relationship: FamilyRelationship;
  full_name?: string;
  occupation?: string;
  contact_number?: string;
}

/** `relationship` here is free text — deliberately not the `FamilyRelationship` enum. */
export interface EmergencyContact {
  id?: string;
  full_name?: string;
  relationship: string;
  contact_number: string;
  email?: string;
  address?: string;
}

/**
 * Where a person is trying to go — a read model over `applicant_journeys`,
 * projected onto the list and detail responses (DATA_CONTRACT §8). An applicant
 * owns no country of its own: the destination belongs to the journey, and one
 * person may pursue several over the years, so this is an array and an empty one
 * simply means "no journey yet".
 *
 * A pre-catalogue journey has no `Country` row behind it — `country_id` is then
 * `null` and the three `country_*` fields are `""`, leaving the free-text
 * `target_country` as the only destination there is.
 */
export interface ApplicantDestination {
  journey_id: string;
  stage: string;
  country_id: string | null;
  country_code: string;
  country_name: string;
  target_country: string;
}

/**
 * `GET /applicants/` row shape — trimmed relative to detail: it carries
 * `contact_numbers`, but not the addresses/passport/family/emergency
 * collections.
 */
export interface Applicant {
  id: string;
  /**
   * The one name field. English-only since DATA_CONTRACT v1.3.0 dropped the
   * `_np`/`_romanized` columns and renamed `_en` to bare — "a Roman name, an
   * independent identity, not a translation".
   */
  full_name: string;
  date_of_birth: string | null;
  date_of_birth_bs: BsDate | null;
  gender: Gender;
  nationality: string;
  email: string;
  status: ApplicantStatus;
  creation_source: CreationSource;
  created_by: UserBrief;
  contact_numbers: ApplicantContactNumber[];
  /** Derived at read time from the person's journeys — never stored, never written. */
  destinations: ApplicantDestination[];
  created_at: string;
  updated_at: string;
}

/** Returned by retrieve, create, update, and the status-change action. */
export interface ApplicantDetail extends Applicant {
  addresses: ApplicantAddress[];
  passport: PassportDetail | null;
  family_members: FamilyMember[];
  emergency_contacts: EmergencyContact[];
  /** Read through the reverse accessor — `null` for a directly created applicant. */
  originating_lead_id: string | null;
}

/**
 * Sourced from the central `audit` log — nested-collection events carry only a
 * **count** in `metadata`, never the replaced values.
 */
export interface HistoryEntry {
  id: string;
  action: HistoryAction;
  actor_type: HistoryActorType;
  actor_id: string | null;
  actor_label: string;
  summary: string;
  reason: string;
  changes: Record<string, { from: unknown; to: unknown }>;
  metadata: Record<string, unknown>;
  created_at: string;
  created_at_bs: BsDate;
}

// ── Write payloads ──────────────────────────────────────────────────────────
//
// `status`/`creation_source`/`created_by` are never accepted from a client on
// any endpoint (INTEGRATION.md §3/§7) — deliberately absent from every payload
// type below, not just omitted by convention.

export interface ContactNumberInput {
  id?: string;
  number: string;
  label: ContactNumberLabel;
  is_primary: boolean;
}

export interface AddressInput {
  address_type: AddressType;
  country?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  street_address?: string;
  postal_code?: string;
}

export interface PassportInput {
  passport_number: string;
  issuing_country?: string;
  place_of_issue?: string;
  /** `null` explicitly clears the field — `undefined`/omitted leaves it untouched (PATCH semantics). */
  issued_date?: string | null;
  /** `null` explicitly clears the field — `undefined`/omitted leaves it untouched (PATCH semantics). */
  expiry_date?: string | null;
}

export interface FamilyMemberInput {
  relationship: FamilyRelationship;
  full_name?: string;
  occupation?: string;
  contact_number?: string;
}

export interface EmergencyContactInput {
  full_name?: string;
  relationship: string;
  contact_number: string;
  email?: string;
  address?: string;
}

/**
 * `contact_numbers`/`addresses`/`family_members`/`emergency_contacts` **replace
 * the whole set** on update (never a delta); `passport` **upserts** the single
 * record. `status` is deliberately absent — never writable here; it moves only
 * through the dedicated status-change action.
 */
export interface ApplicantCreatePayload {
  full_name: string;
  /** `null` explicitly clears the field — `undefined`/omitted leaves it untouched (PATCH semantics). */
  date_of_birth?: string | null;
  /** `""` explicitly clears to blank/undisclosed — matches the model's own blank-when-unknown state. */
  gender?: Gender | "";
  nationality?: string;
  email?: string;
  contact_numbers: ContactNumberInput[];
  addresses?: AddressInput[];
  passport?: PassportInput;
  family_members?: FamilyMemberInput[];
  emergency_contacts?: EmergencyContactInput[];
}

export type ApplicantUpdatePayload = Partial<ApplicantCreatePayload>;

export interface StatusChangePayload {
  status: ApplicantStatus;
}
