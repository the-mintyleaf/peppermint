import { dayjs } from "@peppermint/ui";
import {
  LANGUAGE_TEST_SCORE_FIELDS,
  qualificationLevelLabel,
  yearCalendarLabel,
} from "@/components/academic";
import type {
  ApplicantLanguageTest,
  Education,
} from "../../../../applicants.types";

/** Non-blank facts joined into one quiet line. */
export function joinFacts(facts: (string | null | undefined)[]): string {
  return facts
    .filter((fact): fact is string => Boolean(fact?.trim()))
    .join(" · ");
}

/** "Bachelor's · BBS" — the level always, the programme when there is one. */
export function educationTitle(education: Education): string {
  const level = qualificationLevelLabel(education.level);
  const qualification = education.qualification.trim();
  return qualification ? `${level} · ${qualification}` : level;
}

/** `"3.45"` + gpa → "GPA 3.45"; percentage → "78.5%"; blank → null. */
export function educationScore(education: Education): string | null {
  if (!education.score || !education.score_type) return null;
  const value = Number(education.score);
  const shown = Number.isFinite(value) ? String(value) : education.score;
  return education.score_type === "percentage" ? `${shown}%` : `GPA ${shown}`;
}

/**
 * "2076–2080 BS", "Since 2079 BS" (ongoing), "2080 BS", or null. The calendar
 * is part of the value — a BS year is not an AD year — so it is always shown.
 */
export function educationYears(education: Education): string | null {
  const calendar = yearCalendarLabel(education.year_calendar);
  const suffix = calendar ? ` ${calendar}` : "";
  const { start_year: start, completion_year: end } = education;
  if (education.completion_status === "ongoing") {
    return start ? `Since ${start}${suffix}` : null;
  }
  if (start && end) return `${start}–${end}${suffix}`;
  if (end) return `${end}${suffix}`;
  if (start) return `From ${start}${suffix}`;
  return null;
}

/** "Overall 7 · Listening 7.5 · …" — only the scores that were recorded. */
export function languageTestScores(test: ApplicantLanguageTest): string | null {
  const parts = LANGUAGE_TEST_SCORE_FIELDS.flatMap(({ field, label }) => {
    const raw = test[field];
    if (raw === null || raw === "") return [];
    const value = Number(raw);
    return [`${label} ${Number.isFinite(value) ? value : raw}`];
  });
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatTestDate(value: string | null): string | null {
  return value ? dayjs(value).format("MMM D, YYYY") : null;
}

/** True once a recorded expiry date has passed. */
export function isTestExpired(test: ApplicantLanguageTest): boolean {
  return Boolean(
    test.expiry_date && dayjs(test.expiry_date).isBefore(dayjs(), "day"),
  );
}
