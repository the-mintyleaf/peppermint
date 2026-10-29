import type { CSSProperties, ReactNode } from "react";

export interface ClipboardFieldSuggestProps {
  /**
   * The document field's clipboard key — lowercase dotted words, e.g. `father.name`.
   * Either a key registered in `clipboard.fieldKeys.ts`, or one derived with
   * `deriveFieldKey(family, fieldPath)`.
   */
  fieldKey: string;
  /** The input's current text. Drives whether "Save this value" is offered. */
  value: string;
  /**
   * Receives the chosen snippet's text. The caller writes it into the input
   * through the form (`form.setFieldValue(...)`, or the bound input's `onChange`)
   * — this component never owns the field.
   */
  onInsert: (text: string) => void;
  /**
   * The field's own label ("Spokesperson name"). Names the button for screen
   * readers ("Saved snippets for Spokesperson name") and pre-fills the snippet name
   * when saving.
   */
  fieldLabel?: string;
  /**
   * Human name of the KEY, shown in "Save this value" ("Offered on: Ward office —
   * Spokesperson name"). Defaults to `fieldKeyLabel(fieldKey)` — pass it for a derived
   * key so the name comes from the field's label rather than its path.
   */
  fieldKeyLabel?: string;
  disabled?: boolean;
  /** Icon-button size; match the input it sits beside. Default `md`. */
  size?: "xs" | "sm" | "md" | "lg";
  /** Raise when the host surface is itself above the default popover layer (300). */
  popoverZIndex?: number;
}

export interface ClipboardSaveValueProps {
  fieldKey: string;
  value: string;
  fieldLabel?: string;
  /** Human name of the key, shown so the person knows where the snippet comes back. */
  fieldKeyLabel: string;
  /** Called after the snippet is saved. */
  onSaved: () => void;
}

/** `withClipboard` — `ClipboardFieldSuggest` props plus the host input's shape. */
export interface WithClipboardOptions extends Omit<
  ClipboardFieldSuggestProps,
  "size"
> {
  /** A `Textarea`: pins the button to the first line instead of centring it. */
  multiline?: boolean;
  /** Defaults to `sm`, which sits inside an `sm`/`md` input without crowding it. */
  size?: ClipboardFieldSuggestProps["size"];
}

/** Spread onto a Mantine `TextInput` / `Textarea`. */
export interface ClipboardInputSectionProps {
  rightSection: ReactNode;
  rightSectionPointerEvents: "all";
  rightSectionProps?: { style: CSSProperties };
}

/**
 * The slice of a Mantine form `bindClipboardFields` needs — satisfied by
 * `useForm(...)` and by `useFormInstance().form` (FormWrapper), in controlled mode.
 */
export interface ClipboardBindableForm {
  getInputProps: (path: string) => {
    value?: unknown;
    onChange: (value: string) => void;
  };
}

export interface BindClipboardFieldsOptions {
  /**
   * The form's family — the first segment of every derived key (`woda`, `lor`, `moi`,
   * `cv`, `bank`, `certificate`). Families named in `clipboard.fieldKeys.ts` get a
   * human name; share one family across forms whose fields mean the same thing.
   */
  family: string;
  disabled?: boolean;
  popoverZIndex?: number;
}

export interface ClipboardFieldOverrides {
  /** An explicit registered key, kept so snippets saved under it still match. */
  clipboardKey?: string;
  /** A `Textarea`. */
  multiline?: boolean;
  disabled?: boolean;
}

/** Returned by `bindClipboardFields`: one call per text field. */
export type ClipboardFieldBinder = (
  path: string,
  label: string,
  overrides?: ClipboardFieldOverrides,
) => ClipboardInputSectionProps;
