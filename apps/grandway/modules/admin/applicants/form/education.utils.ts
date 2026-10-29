import { nepalTodayIso } from "@/components/academic";
import type { YearCalendar } from "@/components/academic";
import type { Education, EducationInput } from "../applicants.types";
import type { EducationFormRow } from "./ApplicantForm.types";

/**
 * The year range the backend accepts per calendar, "current" judged in Nepal
 * time: BS 2000 … current BS + 1, AD 1950 … current AD + 1.
 *
 * The BS year turns over at Nepali New Year (Baisakh 1, mid-April — 13th to
 * 15th by year). Taking the 14th as the turnover is right to within a day
 * either side; on that edge the server's own check (mapped back onto the
 * field) is the authority.
 */
export function educationYearBounds(calendar: YearCalendar): {
  min: number;
  max: number;
} {
  const today = nepalTodayIso();
  const adYear = Number(today.slice(0, 4));
  if (calendar === "ad") return { min: 1950, max: adYear + 1 };
  const bsYear = today.slice(5) >= "04-14" ? adYear + 57 : adYear + 56;
  return { min: 2000, max: bsYear + 1 };
}

/** A blank editor row. BS is the default calendar — how Nepali marksheets read. */
export function emptyEducationRow(): EducationFormRow {
  return {
    id: null,
    source_lead_id: null,
    level: null,
    qualification: "",
    institution: "",
    country: "",
    completion_status: "completed",
    score: null,
    score_type: null,
    grading_system: "",
    start_year: null,
    completion_year: null,
    year_calendar: "bs",
  };
}

function parseScore(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** API record (decimal-string score, `""` blanks) → editor row. */
export function toEducationFormRow(education: Education): EducationFormRow {
  return {
    id: education.id,
    source_lead_id: education.source_lead_id ?? null,
    level: education.level,
    qualification: education.qualification ?? "",
    institution: education.institution ?? "",
    country: education.country ?? "",
    completion_status: education.completion_status ?? "completed",
    score: parseScore(education.score),
    score_type: education.score_type || null,
    grading_system: education.grading_system ?? "",
    start_year: education.start_year ?? null,
    completion_year: education.completion_year ?? null,
    // A record with no years carries `""`; the editor still offers BS as the
    // default so typing a year needs one fewer click. Harmless: the payload
    // sends no calendar when there is no year.
    year_calendar: education.year_calendar || "bs",
  };
}

export function toEducationFormRows(
  educations: Education[] | null | undefined,
): EducationFormRow[] {
  return (educations ?? []).map(toEducationFormRow);
}

/**
 * Editor row → one `educations[]` entry. Score and score type travel together
 * (half a pair is dropped, though the schema has already refused it); the
 * calendar is sent only alongside a year; an ongoing record sends no
 * completion year. `id`/`source_lead_id` are never sent.
 *
 * Throws if `level` is unset: the schema requires it, so reaching this with
 * `null` means the form skipped validation.
 */
export function toEducationPayload(row: EducationFormRow): EducationInput {
  if (!row.level) {
    throw new Error("An education record is missing its level.");
  }
  const ongoing = row.completion_status === "ongoing";
  const completionYear = ongoing ? null : row.completion_year;
  const hasYear = row.start_year !== null || completionYear !== null;
  const hasScore = row.score !== null && row.score_type !== null;
  return {
    level: row.level,
    qualification: row.qualification.trim(),
    institution: row.institution.trim(),
    country: row.country.trim(),
    completion_status: row.completion_status,
    score: hasScore ? row.score : null,
    score_type: hasScore && row.score_type ? row.score_type : "",
    grading_system: row.grading_system.trim(),
    start_year: row.start_year,
    completion_year: completionYear,
    year_calendar: hasYear && row.year_calendar ? row.year_calendar : "",
  };
}

export function toEducationPayloads(
  rows: EducationFormRow[],
): EducationInput[] {
  return rows.map(toEducationPayload);
}
