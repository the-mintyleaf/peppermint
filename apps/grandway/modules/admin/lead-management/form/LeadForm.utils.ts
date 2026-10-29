import {
  ACADEMIC_SCORE_RANGE,
  applyApiFieldErrors,
  getApiFieldErrors,
  nepalTodayIso,
  toLanguageTestFormRows,
  toLanguageTestPayloads,
} from "@/components/academic";
import type {
  AcademicScoreType,
  FieldErrorTarget,
  YearCalendar,
} from "@/components/academic";
import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";
import type {
  ContactNumberInput,
  LeadBoardRow,
  LeadCreatePayload,
  StudyInterest,
  StudyInterestInput,
} from "../leadManagement.types";
import type { LeadFormValues, StudyInterestFormValues } from "./LeadForm.types";

export const INITIAL_STUDY_INTEREST: StudyInterestFormValues = {
  interested_countries: [],
  study_level: "",
  field_of_study: "",
  preferred_intake: "",
  budget_amount: null,
  budget_currency: "",
  scholarship_interest: false,
  highest_qualification: "",
  highest_qualification_level: "",
  academic_score: null,
  academic_score_type: "",
  pass_year: null,
  pass_year_calendar: "",
  language_test_status: "",
  interest_notes: "",
};

export const INITIAL_LEAD_FORM: LeadFormValues = {
  full_name: "",
  email: "",
  address: "",
  source: "",
  source_detail: "",
  contact_numbers: [],
  study_interest: INITIAL_STUDY_INTEREST,
  language_certificates: [],
};

// ── Years ────────────────────────────────────────────────────────────────────

/**
 * The backend's pass-year windows: BS 2000 … this BS year + 1, AD 1950 …
 * this year + 1. The BS year is approximated from Nepal's AD date (the BS new
 * year falls on ~14 April) — the server stays authoritative, and its
 * `LEADS_STUDY_INTEREST_INVALID` lands on the field if the edge disagrees.
 */
export function passYearRange(calendar: YearCalendar): {
  min: number;
  max: number;
} {
  const today = nepalTodayIso();
  const adYear = Number(today.slice(0, 4));
  if (calendar === "ad") return { min: 1950, max: adYear + 1 };
  const bsYear = adYear + (today.slice(5) >= "04-14" ? 57 : 56);
  return { min: 2000, max: bsYear + 1 };
}

/**
 * Best guess for a blank calendar once a year is typed: a year past the AD
 * window can only be BS (2080 BS); anything inside it is read as AD. Only
 * ever fills a BLANK calendar — never overrides the user's pick.
 */
export function inferYearCalendar(year: number): YearCalendar {
  return year > passYearRange("ad").max ? "bs" : "ad";
}

/** A blank score type once a score is typed: ≤ 4 reads as a GPA, above as a percentage. */
export function inferScoreType(score: number): AcademicScoreType {
  return score <= ACADEMIC_SCORE_RANGE.gpa.max ? "gpa" : "percentage";
}

// ── Record → form ────────────────────────────────────────────────────────────

/**
 * Guarantees exactly one `is_primary: true` by the time the form is
 * interactive — nothing in the backend contract enforces that invariant on
 * the data it returns, so a pre-existing record with zero or multiple
 * primaries must be normalized on load rather than silently resubmitted
 * as-is (or compounded further by `ContactNumbersField`'s add/remove logic,
 * which assumes a clean starting state).
 */
function normalizeContactNumbers(
  rows: ContactNumberInput[],
): ContactNumberInput[] {
  if (rows.length === 0) return rows;
  const primaryIndex = rows.findIndex((r) => r.is_primary);
  const targetIndex = primaryIndex >= 0 ? primaryIndex : 0;
  return rows.map((r, i) => ({ ...r, is_primary: i === targetIndex }));
}

function toNumberOrNull(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStudyInterestFormValues(
  interest: StudyInterest,
): StudyInterestFormValues {
  return {
    interested_countries: interest.interested_countries,
    study_level: interest.study_level,
    field_of_study: interest.field_of_study,
    preferred_intake: interest.preferred_intake,
    budget_amount: toNumberOrNull(interest.budget_amount),
    budget_currency: interest.budget_currency,
    scholarship_interest: interest.scholarship_interest,
    highest_qualification: interest.highest_qualification,
    // `?? ""` — a record cached before the 2026-10-29 fields existed.
    highest_qualification_level: interest.highest_qualification_level ?? "",
    academic_score: toNumberOrNull(interest.academic_score),
    academic_score_type: interest.academic_score_type ?? "",
    pass_year: interest.pass_year ?? null,
    pass_year_calendar: interest.pass_year_calendar ?? "",
    language_test_status: interest.language_test_status,
    interest_notes: interest.interest_notes,
  };
}

export function toLeadFormValues(
  record?: Partial<LeadBoardRow>,
): LeadFormValues {
  if (!record) return INITIAL_LEAD_FORM;
  return {
    full_name: record.full_name ?? "",
    email: record.email ?? "",
    address: record.address ?? "",
    source: record.source?.id ?? "",
    source_detail: record.source_detail ?? "",
    contact_numbers: normalizeContactNumbers(record.contact_numbers ?? []),
    study_interest: record.study_interest
      ? toStudyInterestFormValues(record.study_interest)
      : INITIAL_STUDY_INTEREST,
    language_certificates: toLanguageTestFormRows(record.language_certificates),
  };
}

// ── Form → payload ───────────────────────────────────────────────────────────

function isBlankStudyInterest(v: StudyInterestFormValues): boolean {
  return (
    v.interested_countries.length === 0 &&
    v.study_level === "" &&
    v.field_of_study.trim() === "" &&
    v.preferred_intake.trim() === "" &&
    v.budget_amount === null &&
    v.budget_currency.trim() === "" &&
    !v.scholarship_interest &&
    v.highest_qualification.trim() === "" &&
    v.highest_qualification_level === "" &&
    v.academic_score === null &&
    v.pass_year === null &&
    v.language_test_status === "" &&
    v.interest_notes.trim() === ""
  );
}

/**
 * Both halves of a pair or neither: a type left behind after its score was
 * cleared is dropped rather than sent alone (the schema already blocks the
 * reverse — a score with no type).
 */
function toStudyInterestInput(v: StudyInterestFormValues): StudyInterestInput {
  const hasScore = v.academic_score !== null;
  const hasYear = v.pass_year !== null;
  return {
    interested_countries: v.interested_countries,
    study_level: v.study_level,
    field_of_study: v.field_of_study.trim(),
    preferred_intake: v.preferred_intake.trim(),
    budget_amount: v.budget_amount,
    budget_currency: v.budget_currency.trim().toUpperCase(),
    scholarship_interest: v.scholarship_interest,
    highest_qualification: v.highest_qualification.trim(),
    highest_qualification_level: v.highest_qualification_level,
    academic_score: hasScore ? v.academic_score : null,
    academic_score_type: hasScore ? v.academic_score_type : "",
    pass_year: hasYear ? v.pass_year : null,
    pass_year_calendar: hasYear ? v.pass_year_calendar : "",
    language_test_status: v.language_test_status,
    interest_notes: v.interest_notes.trim(),
  };
}

export interface LeadPayloadContext {
  /** The record already had a study interest (a cleared section must still be sent). */
  hadExistingStudyInterest: boolean;
  /** Editing — certificates are always sent, so removing the last one clears the set. */
  isEdit: boolean;
}

/**
 * `study_interest` is omitted entirely (not sent as an all-blank object)
 * when the section is blank *and* the record never had one — the backend
 * distinguishes "no study interest on file" (`study_interest: null`) from
 * "an explicitly blank record". If a record already carried study interest
 * and the user cleared every field, the blank object must still be sent —
 * omitting it would leave the old data untouched (PATCH semantics).
 *
 * `language_certificates` replaces the whole set, so an edit always sends the
 * full list (`[]` clears it); a create omits an empty list.
 *
 * Contact numbers never carry an `id` — the write contract's shape is
 * `{number, label, is_primary}` only.
 */
export function toLeadPayload(
  values: LeadFormValues,
  { hadExistingStudyInterest, isEdit }: LeadPayloadContext,
): LeadCreatePayload {
  const payload: LeadCreatePayload = {
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
    source: values.source,
    source_detail: values.source_detail.trim(),
    contact_numbers: values.contact_numbers.map((c) => ({
      number: c.number.trim(),
      label: c.label,
      is_primary: c.is_primary,
    })),
  };
  if (
    hadExistingStudyInterest ||
    !isBlankStudyInterest(values.study_interest)
  ) {
    payload.study_interest = toStudyInterestInput(values.study_interest);
  }
  if (isEdit || values.language_certificates.length > 0) {
    payload.language_certificates = toLanguageTestPayloads(
      values.language_certificates,
    );
  }
  return payload;
}

// ── Server errors → fields ───────────────────────────────────────────────────

const STUDY_INTEREST_PREFIX = "study_interest.";

/**
 * Lands a failed save's field details on the form:
 * `LEADS_STUDY_INTEREST_INVALID` keys `study_interest.<field>` (the form's own
 * path, unchanged), `LEADS_CERTIFICATE_INVALID` keys
 * `language_certificates[i].<field>` (→ `language_certificates.i.<field>`),
 * and `LEADS_CERTIFICATE_LIMIT` (no field details) goes on the list itself.
 * The shell's toast still names the error either way.
 */
export function applyLeadServerErrors(
  form: FieldErrorTarget,
  error: unknown,
): void {
  applyApiFieldErrors(form, error, { apiPath: "language_certificates" });

  const fields = getApiFieldErrors(error) ?? {};
  const interestErrors: Record<string, string> = {};
  for (const [key, message] of Object.entries(fields)) {
    if (key.startsWith(STUDY_INTEREST_PREFIX)) interestErrors[key] = message;
  }

  if (getApiError(error).code === "LEADS_CERTIFICATE_LIMIT") {
    interestErrors.language_certificates = getApiErrorMessage(error);
  }

  if (Object.keys(interestErrors).length > 0) {
    form.setErrors((current) => ({ ...current, ...interestErrors }));
  }
}
