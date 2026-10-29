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

export const CLIPBOARD_FIELD_KEYS: readonly ClipboardFieldKeyOption[] = [
  { value: "applicant.name", label: "Applicant's name" },
  { value: "applicant.address", label: "Applicant's address" },
  { value: "father.name", label: "Father's name" },
  { value: "mother.name", label: "Mother's name" },
  { value: "guardian.name", label: "Guardian's name" },
  { value: "ward.office.name", label: "Ward office name" },
  { value: "ward.office.address", label: "Ward office address" },
  { value: "ward.spokesperson.name", label: "Ward spokesperson's name" },
  { value: "bank.name", label: "Bank name" },
  { value: "bank.address", label: "Bank address" },
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
