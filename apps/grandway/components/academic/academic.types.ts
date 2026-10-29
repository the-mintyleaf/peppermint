/**
 * Shared academic-record enums. One set serves both domains: the lead's
 * `StudyInterest.highest_qualification_level` and the applicant's
 * `Education.level` are the same enum, and lead `LanguageCertificate` /
 * applicant `LanguageTest` are the same shape ("field for field").
 */

/** `Education.level` / `StudyInterest.highest_qualification_level` (non-blank). */
export type QualificationLevel =
  | "see"
  | "plus_two"
  | "diploma"
  | "bachelor"
  | "master"
  | "phd"
  | "other";

/** `academic_score_type` / `Education.score_type` (non-blank). */
export type AcademicScoreType = "gpa" | "percentage";

/** `pass_year_calendar` / `Education.year_calendar` (non-blank). */
export type YearCalendar = "bs" | "ad";

/** `LanguageCertificate.test_type` / `LanguageTest.test_type`. */
export type LanguageTestType = "ielts" | "pte" | "toefl" | "duolingo" | "other";

/** The five optional score fields every test row carries. */
export type LanguageTestScoreField =
  | "overall_score"
  | "listening_score"
  | "reading_score"
  | "writing_score"
  | "speaking_score";

/** Range rules the backend enforces per test type (applied to every score). */
export interface LanguageTestScoreRule {
  min: number;
  /** `null` = no upper bound ("other"). */
  max: number | null;
  /** Spinner increment; enforced as a multiple only when `stepEnforced`. */
  step: number;
  /** True only for IELTS — the backend rejects anything not on a 0.5 step. */
  stepEnforced: boolean;
  /** A realistic example score, used as the input placeholder. */
  example: string;
}

/** Structural `BsDate` subset the editor reads. */
export interface AcademicBsDate {
  display: string;
}

/**
 * One test as the API returns it — a structural subset of both the lead
 * `LanguageCertificate` and the applicant `LanguageTest`. Scores are decimal
 * strings with one place (`"7.0"`) or `null`.
 */
export interface LanguageTestApiRow {
  id?: string;
  test_type: LanguageTestType;
  overall_score?: string | null;
  listening_score?: string | null;
  reading_score?: string | null;
  writing_score?: string | null;
  speaking_score?: string | null;
  test_date?: string | null;
  test_date_bs?: AcademicBsDate | null;
  certificate_number?: string;
  expiry_date?: string | null;
  expiry_date_bs?: AcademicBsDate | null;
  /** Applicant tests only — set on a test carried over from a converted lead. */
  source_lead_id?: string | null;
}

/**
 * One row of the editor, as held in a FormWrapper form. `test_type` is `null`
 * until picked (the schema requires it); scores are numbers or `null`; dates
 * are `YYYY-MM-DD` strings or `null`. `id` / `source_lead_id` ride along for
 * display only — neither is ever sent.
 *
 * A `type` alias (not an interface) so it satisfies FormWrapper's
 * `Record<string, unknown>` value constraint when nested.
 */
export type LanguageTestFormRow = {
  id: string | null;
  source_lead_id: string | null;
  test_type: LanguageTestType | null;
  overall_score: number | null;
  listening_score: number | null;
  reading_score: number | null;
  writing_score: number | null;
  speaking_score: number | null;
  test_date: string | null;
  certificate_number: string;
  expiry_date: string | null;
};

/**
 * One entry of `language_certificates[]` (lead create/update) or
 * `language_tests[]` (applicant create/update). Blank → `null`; scores are sent
 * as numbers (the API also accepts decimal strings).
 */
export interface LanguageTestPayload {
  test_type: LanguageTestType;
  overall_score: number | null;
  listening_score: number | null;
  reading_score: number | null;
  writing_score: number | null;
  speaking_score: number | null;
  test_date: string | null;
  certificate_number: string;
  expiry_date: string | null;
}

/** A Mantine `{ value, label }` option. */
export interface AcademicOption<TValue extends string> {
  value: TValue;
  label: string;
}
