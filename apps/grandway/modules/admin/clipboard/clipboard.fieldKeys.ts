// The `field_key` vocabulary is a FRONTEND convention — the backend checks only the
// shape (`FIELD_KEY_PATTERN`) and never the meaning. This file is where the
// convention lives. Every text field of a document form carries the clipboard
// button; its key is DERIVED (`deriveFieldKey` → `<family>.<field_path>`) unless the
// field names an explicit key registered below — kept for fields shared across
// families (a ward spokesperson on every Woda letter and the affidavit) and so
// snippets saved before derivation still match. Registered keys get a hand-written
// human name; derived ones are named from their family + field ("Ward office —
// Spokesperson name"), never shown as the dotted key.

import { FIELD_KEY_MAX } from "./clipboard.constants";

export interface ClipboardFieldKeyOption {
  /** The stored key, e.g. `father.name`. */
  value: string;
  /** What the person sees. */
  label: string;
}

// Keys attached to a document form field today (`clipboardKey` on a WodaForm
// schema field, or `ClipboardFieldSuggest` in a hand-built form) come first.
// The bank/applicant/parent keys at the end attach to no field.
export const CLIPBOARD_FIELD_KEYS: readonly ClipboardFieldKeyOption[] = [
  // Woda letters — spokesperson section; also the affidavit's ward chairman
  {
    value: "ward.spokesperson.name",
    label: "Ward chair / spokesperson's name",
  },
  { value: "ward.spokesperson.post", label: "Ward spokesperson's post" },
  {
    value: "ward.spokesperson.contact",
    label: "Ward spokesperson's contact number",
  },
  // Woda tax clearance — "contact us at Office of …"
  { value: "ward.office.name", label: "Ward / municipality office name" },
  { value: "ward.office.address", label: "Ward office address" },
  // Woda occupation letter — "is a farmer by occupation"
  { value: "guardian.occupation", label: "Guardian's occupation" },
  // Woda affidavit of financial support — where the applicant will study
  { value: "study.institution.name", label: "Study institution name" },
  {
    value: "study.institution.location",
    label: "Study institution location",
  },
  // LOR / MOI — the school's signing official
  {
    value: "institution.recommender.name",
    label: "Recommender's name (LOR)",
  },
  {
    value: "institution.recommender.title",
    label: "Recommender's title (LOR)",
  },
  { value: "institution.signatory.name", label: "Signatory's name (MOI)" },
  // Bank certificate — the bank's signing officer
  { value: "bank.spokesperson.name", label: "Bank spokesperson's name" },
  { value: "bank.spokesperson.post", label: "Bank spokesperson's post" },
  // Extended CV — both references share one key per column
  { value: "cv.reference.name", label: "CV referee's name" },
  { value: "cv.reference.title", label: "CV referee's title / position" },
  { value: "cv.reference.institution", label: "CV referee's institution" },
  { value: "cv.reference.address", label: "CV referee's address" },
  { value: "cv.reference.email", label: "CV referee's email" },
  { value: "cv.reference.contact", label: "CV referee's contact number" },
  // Not attached to a field — a bank's name and address come from its
  // template, and the prefill fills the applicant's own details. Kept so
  // snippets saved under them keep their name.
  { value: "bank.name", label: "Bank name" },
  { value: "bank.address", label: "Bank address" },
  { value: "applicant.name", label: "Applicant's name" },
  { value: "applicant.address", label: "Applicant's address" },
  { value: "father.name", label: "Father's name" },
  { value: "mother.name", label: "Mother's name" },
  { value: "guardian.name", label: "Guardian's name" },
];

const LABEL_BY_KEY = new Map(
  CLIPBOARD_FIELD_KEYS.map((option) => [option.value, option.label]),
);

/**
 * Derived keys — every other text field of a document form gets a key derived from
 * its form family and field path (`deriveFieldKey`), so no row is needed above. The
 * family is the key's first segment; this names it in human terms.
 */
const FAMILY_LABELS = new Map<string, string>([
  ["woda", "Ward office"],
  ["lor", "Recommendation letter"],
  ["moi", "Medium of instruction"],
  ["cv", "CV"],
  ["bank", "Bank"],
  ["certificate", "Student certificate"],
]);

/** One `field_key` segment: lowercase, `[a-z0-9_]` only, no edge underscores. */
function toKeySegment(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * The key for a document field with no registered `clipboardKey`:
 * `<family>.<field path>` — `woda.spokesperson_name`, `cv.experiences.role`.
 * List indexes are dropped (`experiences.2.role` → `experiences.role`), so every row
 * of a repeatable list shares one key. Deterministic, so a snippet saved on a field
 * comes back on the same field of every letter in that family. Always matches
 * `FIELD_KEY_PATTERN` and fits `FIELD_KEY_MAX`.
 */
export function deriveFieldKey(family: string, fieldPath: string): string {
  const key = [family, ...fieldPath.split(".")]
    .filter((segment) => !/^\d+$/.test(segment))
    .map(toKeySegment)
    .filter(Boolean)
    .join(".");
  return key.slice(0, FIELD_KEY_MAX).replace(/\.+$/, "");
}

/** `["experiences", "start_period"]` → "Experiences start period". */
function humanize(segments: string[]): string {
  const words = segments.join(" ").replace(/_+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function familyLabel(family: string): string {
  return FAMILY_LABELS.get(family) ?? humanize([family]);
}

/**
 * Human name for a derived key, from the field's own label:
 * ("woda", "Spokesperson name") → "Ward office — Spokesperson name".
 */
export function derivedFieldKeyLabel(
  family: string,
  fieldLabel: string,
): string {
  return `${familyLabel(family)} — ${fieldLabel}`;
}

/**
 * Human name for a stored key: the registered name; else, for a derived key of a
 * known family, the family plus the field path in words ("Ward office —
 * Spokesperson name"); else the raw key.
 */
export function fieldKeyLabel(fieldKey: string): string {
  const registered = LABEL_BY_KEY.get(fieldKey);
  if (registered) return registered;
  const [family, ...rest] = fieldKey.split(".");
  if (family && rest.length > 0 && FAMILY_LABELS.has(family)) {
    return derivedFieldKeyLabel(family, humanize(rest));
  }
  return fieldKey;
}

/**
 * Select options for the Save form. A key the registry doesn't know (a derived key,
 * one saved by an earlier build, or another surface) is appended under its human
 * name so an edit never silently drops it.
 */
export function fieldKeyOptions(currentKey: string): ClipboardFieldKeyOption[] {
  const options = [...CLIPBOARD_FIELD_KEYS];
  if (currentKey && !LABEL_BY_KEY.has(currentKey)) {
    options.push({ value: currentKey, label: fieldKeyLabel(currentKey) });
  }
  return options;
}
