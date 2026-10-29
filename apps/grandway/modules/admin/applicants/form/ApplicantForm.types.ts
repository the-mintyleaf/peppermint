import type {
  AcademicScoreType,
  LanguageTestFormRow,
  QualificationLevel,
  YearCalendar,
} from "@/components/academic";
import type { RefObject } from "react";
import type {
  ApplicantCreatePayload,
  ApplicantDetail,
  ContactNumberInput,
  EducationCompletionStatus,
  FamilyRelationship,
  Gender,
} from "../applicants.types";

export interface AddressSectionValues {
  country: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  street_address: string;
  postal_code: string;
}

export interface FamilyMemberFormRow {
  relationship: FamilyRelationship | "";
  full_name: string;
  occupation: string;
  contact_number: string;
  citizenship_no: string;
}

export interface EmergencyContactFormRow {
  full_name: string;
  relationship: string;
  contact_number: string;
  email: string;
  address: string;
}

/**
 * One education record in the editor. `level` is `null` until picked (the
 * schema requires it); scores and years are numbers or `null`. `id` /
 * `source_lead_id` ride along for display only — neither is ever sent.
 *
 * A `type` alias (not an interface) so it satisfies FormWrapper's
 * `Record<string, unknown>` value constraint when nested.
 */
export type EducationFormRow = {
  id: string | null;
  source_lead_id: string | null;
  level: QualificationLevel | null;
  qualification: string;
  institution: string;
  country: string;
  completion_status: EducationCompletionStatus;
  score: number | null;
  score_type: AcademicScoreType | null;
  grading_system: string;
  start_year: number | null;
  completion_year: number | null;
  year_calendar: YearCalendar | null;
};

/**
 * Flat, single-object shape shared by all 5 steps — `stepFields` (per-step
 * validation scoping) reads from and `FormWrapper`'s combined validate reads
 * against this whole object, same approach as `LeadFormValues`. The index
 * signature matches `LeadFormValues`/`CreateUserValues` — required because
 * `FormWrapper<T>`'s generic bound is stricter than a shell's `T extends
 * object`; see the anti-pattern gate's own `*Values`-suffix exemption.
 */
export interface ApplicantFormValues extends Record<string, unknown> {
  // Step 1 — Identity & Contact
  /**
   * A newly-picked photograph, staged for upload after the record itself is
   * saved. Not part of the applicant payload and never sent as JSON: the
   * backend has no photo field, and a file's owner must already exist before
   * `POST /files/` will accept it. `null` means "leave the current one alone" —
   * on create it is always `null`, since there is no id to own the file yet.
   */
  photograph: File | null;
  full_name: string;
  date_of_birth: string | null;
  gender: Gender | "";
  nationality: string;
  email: string;
  contact_numbers: ContactNumberInput[];

  // Step 2 — Addresses
  permanent_address: AddressSectionValues;
  current_address: AddressSectionValues;

  // Step 3 — Identity documents (citizenship, national ID, passport)
  citizenship_no: string;
  citizenship_issue_district: string;
  national_id_no: string;
  passport_number: string;
  issuing_country: string;
  place_of_issue: string;
  issued_date: string | null;
  expiry_date: string | null;

  // Step 4 — Education & tests
  educations: EducationFormRow[];
  language_tests: LanguageTestFormRow[];

  // Step 5 — Family & Emergency Contacts
  family_members: FamilyMemberFormRow[];
  emergency_contacts: EmergencyContactFormRow[];
}

export interface ApplicantFormProps {
  mode: "create" | "edit";
  /** Full detail to prefill from — required for `mode: "edit"`. */
  initialValues?: ApplicantDetail;
  onBack: () => void;
  /**
   * Receives the trimmed create/update payload; the page owns the mutation (a
   * `useAppMutation`-backed hook, which shows its own success/error toast).
   *
   * **Reject when the applicant save itself fails** — the form catches it and
   * lays the server's field errors onto the fields (it never re-toasts). A
   * failure *after* the record saved (the photograph upload) must resolve
   * instead: the record is already saved, there is nothing to map. Awaited so
   * the Submit button's loading state spans the whole request.
   */
  onSubmit: (
    payload: ApplicantCreatePayload,
    /**
     * A newly-picked photograph, or `null` when the photo was left alone.
     * Handed over separately from `payload` because it is not part of the
     * applicant resource at all — the page uploads it against the saved
     * record's id after the write lands (edit only; always `null` on create).
     */
    photograph: File | null,
  ) => Promise<void>;
}

/** Lets the submit handler (outside FormWrapper's context) reach the live form. */
export interface ServerErrorBridge {
  /** Map a refused save's field errors onto the form and go to their step. */
  show: (error: unknown) => void;
}

export interface ApplicantFormBodyProps {
  title: string;
  description: string;
  onBack: () => void;
  /** True when this applicant already had a passport on file at load time. */
  hadExistingPassport: boolean;
  /** True when an education/test on file came over from the converted lead. */
  hasCarriedOverRecords: boolean;
  /** `null` on create — hides the photo picker. */
  applicantId: string | null;
  bridgeRef: RefObject<ServerErrorBridge | null>;
}

export interface StepIdentityProps {
  applicantId: string | null;
}

export interface StepDocumentsProps {
  hadExistingPassport: boolean;
}

export interface StepEducationTestsProps {
  hasCarriedOverRecords: boolean;
}
