import type { ClipboardCategory, ClipboardEntry } from "../../clipboard.types";

/**
 * Form-side shape. `category` / `field_key` are plain ids/keys (never the read-side
 * `{ id, name }` object — the API rejects that on write) and `null` while unset.
 */
export interface ClipboardEntryFormValues extends Record<string, unknown> {
  label: string;
  text: string;
  category: string | null;
  field_key: string | null;
}

/** Values to seed a NEW snippet with (e.g. "Save this value" from a document field). */
export interface ClipboardEntryFormPrefill {
  label?: string;
  text?: string;
  field_key?: string;
}

export interface ClipboardEntryFormProps {
  /** Present → edit that entry (there is no single-entry GET; this is the list row). */
  entry?: ClipboardEntry;
  /** Create-mode seed; ignored when `entry` is set. */
  prefill?: ClipboardEntryFormPrefill;
  categories: ClipboardCategory[];
  /** Called after a successful save. */
  onDone: () => void;
  onCancel: () => void;
}
