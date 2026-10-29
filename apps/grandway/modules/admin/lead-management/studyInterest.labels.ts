import type { LanguageTestStatus, StudyLevel } from "./leadManagement.types";

/**
 * Lead-only study-interest enums (`INTEGRATION.md` §5). The academic enums
 * shared with applicants (qualification level, score type, year calendar,
 * test type) live in `@/components/academic`, not here.
 */
export const STUDY_LEVEL_OPTIONS: { value: StudyLevel; label: string }[] = [
  { value: "school", label: "School" },
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "postgraduate_diploma", label: "Postgraduate Diploma" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
  { value: "other", label: "Other" },
];

export const LANGUAGE_TEST_STATUS_OPTIONS: {
  value: LanguageTestStatus;
  label: string;
}[] = [
  { value: "not_taken", label: "Not taken" },
  { value: "preparing", label: "Preparing" },
  { value: "booked", label: "Booked" },
  { value: "taken", label: "Taken" },
  { value: "not_required", label: "Not required" },
];

function labelFrom(
  options: { value: string; label: string }[],
  value: string | null | undefined,
): string {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

/** `""` → `""`; an unknown value renders as its raw string. */
export const studyLevelLabel = (value: string | null | undefined) =>
  labelFrom(STUDY_LEVEL_OPTIONS, value);

export const languageTestStatusLabel = (value: string | null | undefined) =>
  labelFrom(LANGUAGE_TEST_STATUS_OPTIONS, value);
