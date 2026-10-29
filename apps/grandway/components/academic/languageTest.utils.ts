import type { ReactNode } from "react";

import { LANGUAGE_TEST_SCORE_FIELDS } from "./academic.labels";
import type {
  LanguageTestApiRow,
  LanguageTestFormRow,
  LanguageTestPayload,
} from "./academic.types";

/** A blank editor row (test type unpicked). */
export function emptyLanguageTestRow(): LanguageTestFormRow {
  return {
    id: null,
    source_lead_id: null,
    test_type: null,
    overall_score: null,
    listening_score: null,
    reading_score: null,
    writing_score: null,
    speaking_score: null,
    test_date: null,
    certificate_number: "",
    expiry_date: null,
  };
}

/** `"7.0"` → `7`; `null`/blank/garbage → `null`. */
function parseScore(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** API row (decimal-string scores) → editor row. */
export function toLanguageTestFormRow(
  row: LanguageTestApiRow,
): LanguageTestFormRow {
  return {
    id: row.id ?? null,
    source_lead_id: row.source_lead_id ?? null,
    test_type: row.test_type,
    overall_score: parseScore(row.overall_score),
    listening_score: parseScore(row.listening_score),
    reading_score: parseScore(row.reading_score),
    writing_score: parseScore(row.writing_score),
    speaking_score: parseScore(row.speaking_score),
    test_date: row.test_date || null,
    certificate_number: row.certificate_number ?? "",
    expiry_date: row.expiry_date || null,
  };
}

export function toLanguageTestFormRows(
  rows: LanguageTestApiRow[] | null | undefined,
): LanguageTestFormRow[] {
  return (rows ?? []).map(toLanguageTestFormRow);
}

function scoreOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Editor row → one `language_certificates[]` / `language_tests[]` entry.
 * Blank → `null` (scores, dates); `certificate_number` is a string field on
 * the API, so blank stays `""`. `id` and `source_lead_id` are never sent —
 * the list replaces wholesale and `source_lead_id` is not writable.
 *
 * Throws if `test_type` is unset: the schema requires it, so reaching this
 * with `null` means the form skipped validation.
 */
export function toLanguageTestPayload(
  row: LanguageTestFormRow,
): LanguageTestPayload {
  if (!row.test_type) {
    throw new Error("A language test is missing its test type.");
  }
  const payload: LanguageTestPayload = {
    test_type: row.test_type,
    overall_score: null,
    listening_score: null,
    reading_score: null,
    writing_score: null,
    speaking_score: null,
    test_date: row.test_date || null,
    certificate_number: (row.certificate_number ?? "").trim(),
    expiry_date: row.expiry_date || null,
  };
  for (const { field } of LANGUAGE_TEST_SCORE_FIELDS) {
    payload[field] = scoreOrNull(row[field]);
  }
  return payload;
}

export function toLanguageTestPayloads(
  rows: LanguageTestFormRow[],
): LanguageTestPayload[] {
  return rows.map(toLanguageTestPayload);
}

// ── Server field errors ──────────────────────────────────────────────────────

/**
 * `error.details.fields` from an Axios error (or the bare `fields` map), or
 * `null` when the body carries none. The map is `path → one message string`.
 */
export function getApiFieldErrors(
  error: unknown,
): Record<string, string> | null {
  const body = (
    error as {
      response?: { data?: { error?: { details?: { fields?: unknown } } } };
    }
  )?.response?.data?.error?.details?.fields;
  if (!body || typeof body !== "object") return null;
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    const message = Array.isArray(value) ? value[0] : value;
    if (typeof message === "string") fields[key] = message;
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

/** `language_tests[1].overall_score` → `language_tests.1.overall_score`. */
export function toFormErrorPath(apiPath: string): string {
  return apiPath.replace(/\[(\d+)\]/g, ".$1");
}

/** Minimal FormWrapper form surface this helper writes to. */
export interface FieldErrorTarget {
  setErrors: (
    updater: (current: Record<string, ReactNode>) => Record<string, ReactNode>,
  ) => void;
}

export interface ApplyFieldErrorsOptions {
  /** The collection name the API reports, e.g. `"language_tests"`. */
  apiPath: string;
  /** Where that list lives in the form, when it differs. Defaults to `apiPath`. */
  formPath?: string;
}

/**
 * Maps an API `error.details.fields` map onto FormWrapper errors
 * (`form.setErrors`), for the entries under `apiPath` only. Indexes count from
 * 0 in the list that was sent — keep the form's row order equal to the
 * payload's (the mappers above do). Returns how many fields were mapped, so
 * the caller can fall back to a toast when nothing landed on a field.
 */
export function applyApiFieldErrors(
  form: FieldErrorTarget,
  error: unknown,
  { apiPath, formPath = apiPath }: ApplyFieldErrorsOptions,
): number {
  const fields = getApiFieldErrors(error);
  if (!fields) return 0;
  const mapped: Record<string, string> = {};
  for (const [key, message] of Object.entries(fields)) {
    if (key !== apiPath && !key.startsWith(`${apiPath}[`)) continue;
    mapped[toFormErrorPath(formPath + key.slice(apiPath.length))] = message;
  }
  const count = Object.keys(mapped).length;
  if (count > 0) form.setErrors((current) => ({ ...current, ...mapped }));
  return count;
}
