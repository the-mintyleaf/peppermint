import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";

/** The one code whose `details.fields` names keys inside `content` (§3, §7). */
export const CONTENT_INVALID_CODE = "DOCUMENTS_CONTENT_INVALID";

/**
 * `error.details.fields` of a `DOCUMENTS_CONTENT_INVALID` response — a flat map
 * from a path inside `content` (`date_of_completion`, `marking[2].present`,
 * `grades.grammar`) to one message. `null` for any other error, including a
 * `DOCUMENTS_CONTENT_INVALID` that is about the body as a whole (no `fields`).
 */
export function getContentFieldErrors(
  error: unknown,
): Record<string, string> | null {
  const apiError = getApiError(error);
  if (apiError.code !== CONTENT_INVALID_CODE) return null;
  const fields = apiError.details?.fields;
  if (!fields || typeof fields !== "object") return null;
  const out: Record<string, string> = {};
  for (const [path, message] of Object.entries(
    fields as Record<string, unknown>,
  )) {
    out[path] = Array.isArray(message)
      ? message.map(String).join(" ")
      : String(message);
  }
  return Object.keys(out).length > 0 ? out : null;
}

const MAX_LISTED = 3;

/** Paths whose snake_case reads badly as a label. */
const PATH_LABELS: Record<string, string> = {
  marking: "Attendance",
  photo_media_id: "Photograph",
  study_type: "Study status",
  course_books: "Textbooks",
  course_total_days: "Course length in days",
  course_hours_per_day: "Class hours per day",
  issue: "Issue date",
  branch_name: "Branch address",
  branch_no: "Branch phone",
  instructor_id: "Instructor",
  director_id: "Managing director",
  class_hr: "class hours",
  total_days: "days held",
};

function words(key: string): string {
  return PATH_LABELS[key] ?? key.replace(/_/g, " ");
}

/**
 * `marking[2].present` → "Attendance, row 3, present"; `grades.grammar` →
 * "grades, grammar"; `date_of_completion` → "Date of completion".
 */
export function contentPathLabel(path: string): string {
  const parts = path.split(".").map((segment) => {
    const match = segment.match(/^([^[]+)\[(\d+)\]$/);
    if (!match) return words(segment);
    return `${words(match[1])}, row ${Number(match[2]) + 1}`;
  });
  const label = parts.join(", ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Toast copy for a failed content save. A field-level refusal names the first few
 * fields — the open form marks them too, but the Customizations panel has no form
 * to mark, so the toast is the only place it can be said there.
 */
export function describeContentSaveError(error: unknown): string {
  const fields = getContentFieldErrors(error);
  if (!fields) return getApiErrorMessage(error);
  const entries = Object.entries(fields);
  const listed = entries
    .slice(0, MAX_LISTED)
    .map(([path, message]) => `${contentPathLabel(path)}: ${message}`);
  const more =
    entries.length > MAX_LISTED
      ? ` (+${entries.length - MAX_LISTED} more)`
      : "";
  return `Some fields were refused — ${listed.join("; ")}${more}`;
}
