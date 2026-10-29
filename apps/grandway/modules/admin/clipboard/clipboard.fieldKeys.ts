// The `field_key` vocabulary is a FRONTEND convention — the backend checks only the
// shape (`FIELD_KEY_PATTERN`) and never the meaning. This registry is where the
// convention lives: add a row when a document form field gains a clipboard
// attachment, so the Save form can name it in human terms ("Father's name") instead
// of exposing `father.name`.

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

/** Human name for a stored key; an unregistered key falls back to the raw key. */
export function fieldKeyLabel(fieldKey: string): string {
  return LABEL_BY_KEY.get(fieldKey) ?? fieldKey;
}

/**
 * Select options for the Save form. A key the registry doesn't know (saved by an
 * earlier build, or another surface) is appended so an edit never silently drops it.
 */
export function fieldKeyOptions(currentKey: string): ClipboardFieldKeyOption[] {
  const options = [...CLIPBOARD_FIELD_KEYS];
  if (currentKey && !LABEL_BY_KEY.has(currentKey)) {
    options.push({ value: currentKey, label: currentKey });
  }
  return options;
}
