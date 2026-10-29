import type {
  AcademicOption,
  AcademicScoreType,
  LanguageTestScoreField,
  LanguageTestScoreRule,
  LanguageTestType,
  QualificationLevel,
  YearCalendar,
} from "./academic.types";

/** Ordered lowest → highest, the order a person reads their own record. */
export const QUALIFICATION_LEVEL_OPTIONS: AcademicOption<QualificationLevel>[] =
  [
    { value: "see", label: "SEE / SLC" },
    { value: "plus_two", label: "+2 / Intermediate" },
    { value: "diploma", label: "Diploma" },
    { value: "bachelor", label: "Bachelor's" },
    { value: "master", label: "Master's" },
    { value: "phd", label: "PhD" },
    { value: "other", label: "Other" },
  ];

export const ACADEMIC_SCORE_TYPE_OPTIONS: AcademicOption<AcademicScoreType>[] =
  [
    { value: "gpa", label: "GPA" },
    { value: "percentage", label: "Percentage" },
  ];

/** Range the backend applies per score type (`gpa` 0–4, `percentage` 0–100). */
export const ACADEMIC_SCORE_RANGE: Record<
  AcademicScoreType,
  { min: number; max: number; step: number; suffix?: string }
> = {
  gpa: { min: 0, max: 4, step: 0.01 },
  percentage: { min: 0, max: 100, step: 0.1, suffix: "%" },
};

export const YEAR_CALENDAR_OPTIONS: AcademicOption<YearCalendar>[] = [
  { value: "bs", label: "BS" },
  { value: "ad", label: "AD" },
];

export const LANGUAGE_TEST_TYPE_OPTIONS: AcademicOption<LanguageTestType>[] = [
  { value: "ielts", label: "IELTS" },
  { value: "pte", label: "PTE" },
  { value: "toefl", label: "TOEFL" },
  { value: "duolingo", label: "Duolingo" },
  { value: "other", label: "Other" },
];

/**
 * Mirrors the backend: IELTS 0–9 in 0.5 steps, PTE 10–90, TOEFL 0–120,
 * Duolingo 10–160, other ≥ 0. The same range applies to the overall score and
 * every section score.
 */
export const LANGUAGE_TEST_SCORE_RULES: Record<
  LanguageTestType,
  LanguageTestScoreRule
> = {
  ielts: { min: 0, max: 9, step: 0.5, stepEnforced: true, example: "7.5" },
  pte: { min: 10, max: 90, step: 1, stepEnforced: false, example: "65" },
  toefl: { min: 0, max: 120, step: 1, stepEnforced: false, example: "95" },
  duolingo: { min: 10, max: 160, step: 1, stepEnforced: false, example: "120" },
  other: { min: 0, max: null, step: 0.5, stepEnforced: false, example: "6.5" },
};

export const LANGUAGE_TEST_SCORE_FIELDS: {
  field: LanguageTestScoreField;
  label: string;
}[] = [
  { field: "overall_score", label: "Overall" },
  { field: "listening_score", label: "Listening" },
  { field: "reading_score", label: "Reading" },
  { field: "writing_score", label: "Writing" },
  { field: "speaking_score", label: "Speaking" },
];

/** Maximum language certificates a lead may hold (`LEADS_CERTIFICATE_LIMIT`). */
export const LEAD_CERTIFICATE_LIMIT = 10;

function labelFrom<TValue extends string>(
  options: AcademicOption<TValue>[],
  value: string | null | undefined,
): string {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

/** `""`/`null` → `""`; an unknown value renders as its raw string. */
export const qualificationLevelLabel = (value: string | null | undefined) =>
  labelFrom(QUALIFICATION_LEVEL_OPTIONS, value);

export const academicScoreTypeLabel = (value: string | null | undefined) =>
  labelFrom(ACADEMIC_SCORE_TYPE_OPTIONS, value);

export const yearCalendarLabel = (value: string | null | undefined) =>
  labelFrom(YEAR_CALENDAR_OPTIONS, value);

export const languageTestTypeLabel = (value: string | null | undefined) =>
  labelFrom(LANGUAGE_TEST_TYPE_OPTIONS, value);

/** "0–9, in steps of 0.5" / "10–90" / "0 or more" — the human range line. */
export function describeScoreRule(rule: LanguageTestScoreRule): string {
  const range =
    rule.max === null ? `${rule.min} or more` : `${rule.min}–${rule.max}`;
  return rule.stepEnforced ? `${range}, in steps of ${rule.step}` : range;
}
