/**
 * Presentation helpers for a revision's `changed_fields` — the field *names* a revision
 * touched (never their values, see `document-revision.md` §1). This is the module's diff
 * surface: a readable list of what moved, not a value-level diff viewer.
 */

/**
 * The certificate family is stored snake_case on the backend but authored camelCase in the
 * templates (see the `CERT_*` maps in `documents.api.ts`). `changed_fields` reports the
 * stored names, so both spellings have to humanise to the same label.
 */
const SPECIAL_CASE_LABELS: Record<string, string> = {
  study_type: "Study type",
  course_hours: "Course hours",
  instructor_id: "Instructor",
  director_id: "Director",
};

/**
 * `statement_account_no` → "Account no", `documentContent` → "Document content".
 * The `statement_`/`document_` prefixes are template-internal namespacing that means nothing
 * to an operator reading history, so they are dropped — unless dropping one would leave the
 * label empty.
 */
const NOISE_PREFIXES = ["statement_", "document_"];

export function humanizeFieldName(field: string): string {
  const special = SPECIAL_CASE_LABELS[field];
  if (special) return special;

  let name = field;
  for (const prefix of NOISE_PREFIXES) {
    if (name.startsWith(prefix) && name.length > prefix.length) {
      name = name.slice(prefix.length);
      break;
    }
  }

  const words = name
    // camelCase / PascalCase → spaced words, before the separator split below.
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[._\-\s]+/)
    .filter(Boolean);

  if (words.length === 0) return field;

  const [first, ...rest] = words;
  return [
    first.charAt(0).toUpperCase() + first.slice(1).toLowerCase(),
    ...rest.map((word) => word.toLowerCase()),
  ].join(" ");
}

/**
 * Humanised, de-duplicated, alphabetically stable labels for a revision's changed fields.
 * De-duplication matters because two raw names can collapse to one label (a camelCase and a
 * snake_case spelling of the same certificate field).
 */
export function humanizeChangedFields(fields: string[]): string[] {
  return Array.from(new Set(fields.map(humanizeFieldName))).sort((a, b) =>
    a.localeCompare(b),
  );
}
