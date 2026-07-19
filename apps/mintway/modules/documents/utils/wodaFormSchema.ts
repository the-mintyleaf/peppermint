/**
 * Declarative field schema for the WODA document forms. A schema describes *what* a
 * WODA create/edit form is (sections, fields, the right control per field); the shared
 * `WodaForm` renderer turns it into an accessible, prefillable Mantine form. This replaces
 * the old `createWodaForm` factory, which rendered every field twice as a raw snake_case
 * `TextInput` and dropped `initialContent` on edit.
 */

/** Control used to render a field — chosen for the field's data shape, not defaulted to text. */
export type WodaControl =
  | "text"
  | "textarea"
  | "number"
  | "combobox" // Autocomplete: finite-but-open sets (honorific, relation) — never drops a custom value
  | "segmented" // SegmentedControl: small closed set (gender, guardian, pronoun)
  | "switch" // boolean toggle (e.g. PAN registration)
  | "date-ad" // DateInput → ISO string the templates parse with `new Date(...)`
  | "date-bs" // free-text Bikram Sambat date (e.g. 2081-04-15)
  | "occupations"; // repeatable table of income sources

/** A column in the repeatable `occupations` table. */
export interface OccupationColumn {
  key: string;
  label: string;
  type: "text" | "number";
  /** Rough width hint for the header cell. */
  width?: number;
}

export interface WodaSelectOption {
  value: string;
  label: string;
}

export interface WodaField {
  name: string;
  label: string;
  /** Defaults to `"text"`. */
  control?: WodaControl;
  /** Suggestions for `combobox`, or the choices for `segmented`. */
  options?: (string | WodaSelectOption)[];
  placeholder?: string;
  description?: string;
  /** Enforced non-empty on submit. */
  required?: boolean;
  /** Appends "(optional)" to the label — used to mark the minority in a mostly-required form. */
  optional?: boolean;
  /** Renders at half width so consecutive halves pair onto one row. */
  half?: boolean;
  /** Seed for the field when neither `initialContent` nor a control default applies. */
  defaultValue?: unknown;
  // number-only options
  min?: number;
  max?: number;
  decimalScale?: number;
  prefix?: string;
  suffix?: string;
  thousandSeparator?: boolean;
  // occupations-only options
  occupationColumns?: OccupationColumn[];
}

export interface WodaSection {
  title: string;
  description?: string;
  fields: WodaField[];
}

export interface WodaFormSchema {
  sections: WodaSection[];
  /** Submit-button label; defaults to "Create Document". */
  submitLabel?: string;
}
