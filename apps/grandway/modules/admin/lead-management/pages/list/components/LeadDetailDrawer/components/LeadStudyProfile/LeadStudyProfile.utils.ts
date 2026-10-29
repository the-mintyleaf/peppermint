import { dayjs } from "@peppermint/ui";
import {
  LANGUAGE_TEST_SCORE_FIELDS,
  yearCalendarLabel,
} from "@/components/academic";
import type {
  LanguageCertificate,
  StudyInterest,
} from "../../../../../../leadManagement.types";

/** `"3.45"` + `gpa` → `"3.45 GPA"`; `"78.5"` + `percentage` → `"78.5%"`. */
export function formatAcademicScore(interest: StudyInterest): string | null {
  if (interest.academic_score === null || interest.academic_score === "") {
    return null;
  }
  const score = String(Number(interest.academic_score));
  if (interest.academic_score_type === "percentage") return `${score}%`;
  if (interest.academic_score_type === "gpa") return `${score} GPA`;
  return score;
}

/** `2080` + `bs` → `"2080 BS"`. */
export function formatPassYear(interest: StudyInterest): string | null {
  if (interest.pass_year === null) return null;
  const calendar = yearCalendarLabel(interest.pass_year_calendar);
  return calendar
    ? `${interest.pass_year} ${calendar}`
    : `${interest.pass_year}`;
}

function formatScore(value: string | null): string | null {
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : value;
}

/** "Listening 7.5 · Reading 7 · …" — only the sections on file. */
export function formatSectionScores(
  certificate: LanguageCertificate,
): string | null {
  const parts = LANGUAGE_TEST_SCORE_FIELDS.filter(
    ({ field }) => field !== "overall_score",
  ).flatMap(({ field, label }) => {
    const score = formatScore(certificate[field]);
    return score === null ? [] : [`${label} ${score}`];
  });
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatOverallScore(
  certificate: LanguageCertificate,
): string | null {
  return formatScore(certificate.overall_score);
}

/** `YYYY-MM-DD` → "May 1, 2026" (with its BS date when the server sent one). */
export function formatCertificateDate(
  iso: string | null,
  bs: { display: string } | null,
): string | null {
  if (!iso) return null;
  const ad = dayjs(iso).format("MMM D, YYYY");
  return bs?.display ? `${ad} (${bs.display})` : ad;
}
