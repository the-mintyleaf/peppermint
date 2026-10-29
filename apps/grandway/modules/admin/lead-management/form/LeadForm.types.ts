import type {
  AcademicScoreType,
  LanguageTestFormRow,
  QualificationLevel,
  YearCalendar,
} from "@/components/academic";
import type {
  ContactNumberInput,
  LanguageTestStatus,
  StudyLevel,
} from "../leadManagement.types";

/**
 * Pairs travel together on the wire (`LEADS_STUDY_INTEREST_INVALID`
 * otherwise): `academic_score` + `academic_score_type`, `pass_year` +
 * `pass_year_calendar`. A `type` alias (not an interface) so it nests inside
 * `LeadFormValues`' `Record<string, unknown>` bound.
 */
export type StudyInterestFormValues = {
  interested_countries: string[];
  study_level: StudyLevel | "";
  field_of_study: string;
  preferred_intake: string;
  budget_amount: number | null;
  budget_currency: string;
  scholarship_interest: boolean;
  /** FREE-TEXT programme or stream ("BBS", "Science") — not the level. */
  highest_qualification: string;
  highest_qualification_level: QualificationLevel | "";
  academic_score: number | null;
  academic_score_type: AcademicScoreType | "";
  pass_year: number | null;
  pass_year_calendar: YearCalendar | "";
  language_test_status: LanguageTestStatus | "";
  interest_notes: string;
};

/**
 * `stage` is deliberately not a field here — it's never writable via create
 * or update (`docs/backend/lead-management/INTEGRATION.md` §7); stage moves
 * only through the dedicated lifecycle actions.
 *
 * The index signature below matches `CreateUserValues`/`UpdateUserValues`
 * (`../../authenticate/users/users.types.ts`) — required because
 * `FormWrapper<T>`'s generic bound is stricter than a shell's `T extends
 * object`; see the anti-pattern gate's own `*Values`-suffix exemption.
 */
export interface LeadFormValues extends Record<string, unknown> {
  full_name: string;
  email: string;
  address: string;
  source: string;
  source_detail: string;
  contact_numbers: ContactNumberInput[];
  study_interest: StudyInterestFormValues;
  /** Replaced wholesale on save; row order = payload order (error indexes). */
  language_certificates: LanguageTestFormRow[];
}

/**
 * The most recent failed create/edit request, handed from the board (which
 * owns the shell's `onCreateApi`/`onEditApi`) down to the open form so server
 * field errors land on their fields. `seq` increases per failure, so a form
 * only applies errors raised after it mounted.
 */
export interface LeadFormSubmitError {
  error: unknown;
  seq: number;
}
