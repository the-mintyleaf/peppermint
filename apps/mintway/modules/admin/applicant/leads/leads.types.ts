import type {
  BsDate,
  EducationLevel,
  LeadSource,
  PaymentStatus,
} from "../_shared";

/**
 * A first-contact enquiry, captured by staff before an applicant exists.
 *
 * Unlike the applicant, a lead is **not role-projected** — every reader gets the
 * same field set, so one interface serves both roles.
 *
 * Optional text/enum fields are `Nullable=No` → unset arrives as `""`, never
 * `null`. Only genuinely DB-nullable fields are `| null`.
 */
export interface Lead {
  id: string;
  lead_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  name_native: string;
  /** Server-derived ASCII search projection — never user-entered. */
  full_name_romanized: string;
  email: string;
  contact_number: string;
  address: string;
  passport_number: string;
  guardian_name: string;
  guardian_contact: string;
  date_of_birth: string | null;
  date_of_birth_bs: BsDate | null;
  /**
   * Enquiry snapshots with **no documented field contract** (gaps.md #10) — each
   * entry is an opaque flat object, max 50 per list. Do not build a typed
   * sub-form against these until the backend specifies a shape.
   */
  education_qualification: Record<string, unknown>[];
  work_experience: Record<string, unknown>[];
  education_level: EducationLevel | "";
  /** Tri-state: `null` means unknown, not false. */
  has_applied_visa_before: boolean | null;
  payment_status: PaymentStatus | "";
  lead_source: LeadSource | "";
  lead_source_detail: string;
  notes: string;
  record_version: number;
  /** Derived from `converted_applicant`. A converted lead is frozen. */
  is_converted: boolean;
  converted_applicant: string | null;
  converted_applicant_code: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Create body — `first_name` is the only required capture field. */
export interface LeadCreatePayload extends Record<string, unknown> {
  first_name: string;
}

/**
 * Update body. `record_version` is *optional* per the contract but we always send
 * it, so a concurrent edit surfaces as APPLICANT_LEAD_VERSION_CONFLICT instead of
 * silently winning.
 */
export interface LeadUpdatePayload extends Record<string, unknown> {
  record_version?: number;
}

export interface LeadConvertPayload {
  target_country: string;
  record_version?: number;
}
