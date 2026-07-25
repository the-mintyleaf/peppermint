// DTOs for the study-opportunity catalogue (`/api/v1/catalogue/`). Field-for-field
// from `docs/backend/institutions/INTEGRATION.md` §4 (reconciled from DATA_CONTRACT —
// English-only names, a single bare `name` per record). Read entities and briefs are
// plain interfaces (the shells constrain `T extends object`); only the `*Values`
// form-value types extend `Record<string, unknown>` for `FormWrapper<T>`.

// ── Enums (§5) ──────────────────────────────────────────────────────────────

export type AvailabilityStatus = "active" | "paused" | "seasonal" | "inactive";

export type InstitutionType =
  | "university"
  | "college"
  | "polytechnic"
  | "language_school"
  | "other";

export type QualificationLevel =
  | "school"
  | "certificate"
  | "diploma"
  | "bachelors"
  | "postgraduate_diploma"
  | "masters"
  | "phd"
  | "other";

/** `""` when no tuition is recorded. */
export type TuitionFeePeriod =
  | "per_year"
  | "per_semester"
  | "total_program"
  | "";

// ── Brief shapes (nested on read; none carries a derived boolean) ─────────────

export interface CountryBrief {
  id: string;
  code: string;
  name: string;
  availability_status: AvailabilityStatus;
}

export interface InstitutionBrief {
  id: string;
  name: string;
  common_name: string;
  availability_status: AvailabilityStatus;
}

export interface CampusBrief {
  id: string;
  name: string;
  city: string;
  availability_status: AvailabilityStatus;
}

export interface FieldBrief {
  id: string;
  code: string;
  name: string;
}

// ── Read entities ─────────────────────────────────────────────────────────────

/** Study-area classification — carries `is_active`, never `availability_status`. */
export interface Field {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  code: string;
  name: string;
  availability_status: AvailabilityStatus;
  availability_note: string;
  /** Read-only derived: true when own status is `active`/`seasonal`. */
  is_usable: boolean;
  notes: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  /** Nested on read; a bare UUID string on write. */
  country: CountryBrief;
  name: string;
  common_name: string;
  institution_type: InstitutionType;
  availability_status: AvailabilityStatus;
  availability_note: string;
  is_usable: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Campus {
  id: string;
  /** Nested on read; comes from the URL on write, never the body. */
  institution: InstitutionBrief;
  name: string;
  city: string;
  availability_status: AvailabilityStatus;
  availability_note: string;
  is_usable: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

/** `GET /programs/` list-row shape — no entry-expectation fields. */
export interface Program {
  id: string;
  title: string;
  institution: InstitutionBrief;
  campus: CampusBrief | null;
  /** Derived from the institution and read-only — no country on a program write. */
  country: CountryBrief;
  qualification_level: QualificationLevel;
  field: FieldBrief;
  duration_months: number | null;
  intake_pattern: string;
  tuition_amount: string | null;
  tuition_currency: string;
  tuition_fee_period: TuitionFeePeriod;
  tuition_is_indicative: boolean;
  scholarship_available: boolean;
  availability_status: AvailabilityStatus;
  availability_note: string;
  is_usable: boolean;
  created_at: string;
  updated_at: string;
}

/** Retrieve/create/update shape — the only source of the entry-expectation fields. */
export interface ProgramDetail extends Program {
  tuition_notes: string;
  academic_requirement: string;
  english_requirement: string;
  backlog_tolerance: string;
  document_expectation: string;
  selection_notes: string;
  scholarship_notes: string;
  notes: string;
}

// ── Write payloads (nested refs are bare UUIDs; immutable fields omitted) ──────

export interface FieldCreatePayload {
  code: string;
  name: string;
  is_active?: boolean;
  display_order?: number;
}
/** `code` immutable — omitted, not merely optional. */
export type FieldUpdatePayload = Partial<Omit<FieldCreatePayload, "code">>;

export interface CountryCreatePayload {
  code: string;
  name: string;
  availability_status?: AvailabilityStatus;
  availability_note?: string;
  notes?: string;
  display_order?: number;
}
export type CountryUpdatePayload = Partial<Omit<CountryCreatePayload, "code">>;

export interface InstitutionCreatePayload {
  country: string;
  name: string;
  common_name?: string;
  institution_type?: InstitutionType;
  availability_status?: AvailabilityStatus;
  availability_note?: string;
  notes?: string;
}
/** `country` IS editable on update (cascades to every program under it). */
export type InstitutionUpdatePayload = Partial<InstitutionCreatePayload>;

export interface CampusCreatePayload {
  name: string;
  city?: string;
  availability_status?: AvailabilityStatus;
  availability_note?: string;
  notes?: string;
}
/** `institution` never sent — immutable, resolved from the URL. */
export type CampusUpdatePayload = Partial<CampusCreatePayload>;

export interface ProgramCreatePayload {
  institution: string;
  title: string;
  qualification_level: QualificationLevel;
  field: string;
  campus?: string | null;
  duration_months?: number | null;
  intake_pattern?: string;
  tuition_amount?: string | null;
  tuition_currency?: string;
  tuition_fee_period?: TuitionFeePeriod;
  tuition_is_indicative?: boolean;
  tuition_notes?: string;
  academic_requirement?: string;
  english_requirement?: string;
  backlog_tolerance?: string;
  document_expectation?: string;
  selection_notes?: string;
  scholarship_available?: boolean;
  scholarship_notes?: string;
  availability_status?: AvailabilityStatus;
  availability_note?: string;
  notes?: string;
}
/**
 * `institution` immutable — omitted. `campus: null` genuinely detaches (not
 * ignored), so it stays present and nullable rather than merely optional.
 */
export type ProgramUpdatePayload = Partial<
  Omit<ProgramCreatePayload, "institution">
>;

// ── Form-value shapes (`*Values` — extend `Record<string, unknown>` for FormWrapper) ─

export interface FieldFormValues extends Record<string, unknown> {
  code: string;
  name: string;
  is_active: boolean;
  display_order: number;
}

export interface CountryFormValues extends Record<string, unknown> {
  code: string;
  name: string;
  availability_status: AvailabilityStatus;
  availability_note: string;
  notes: string;
  display_order: number;
}

export interface InstitutionFormValues extends Record<string, unknown> {
  country: string;
  name: string;
  common_name: string;
  institution_type: InstitutionType;
  availability_status: AvailabilityStatus;
  availability_note: string;
  notes: string;
}

export interface CampusFormValues extends Record<string, unknown> {
  name: string;
  city: string;
  availability_status: AvailabilityStatus;
  availability_note: string;
  notes: string;
}

export interface ProgramFormValues extends Record<string, unknown> {
  institution: string;
  field: string;
  qualification_level: QualificationLevel | "";
  title: string;
  campus: string | null;
  tuition_amount: string;
  tuition_currency: string;
  tuition_fee_period: TuitionFeePeriod;
  tuition_is_indicative: boolean;
  tuition_notes: string;
  academic_requirement: string;
  english_requirement: string;
  backlog_tolerance: string;
  document_expectation: string;
  selection_notes: string;
  scholarship_available: boolean;
  scholarship_notes: string;
  duration_months: number | "";
  intake_pattern: string;
  availability_status: AvailabilityStatus;
  availability_note: string;
  notes: string;
}
