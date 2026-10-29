export interface ClipboardFieldSuggestProps {
  /**
   * The document field's clipboard key — lowercase dotted words, e.g. `father.name`.
   * The vocabulary lives in `clipboard.fieldKeys.ts`; use the same string you register
   * there so the Save form can name it in human terms.
   */
  fieldKey: string;
  /** The input's current text. Drives whether "Save this value" is offered. */
  value: string;
  /**
   * Receives the chosen snippet's text. The caller writes it into the input
   * (`form.setFieldValue(...)`) — this component never owns the field.
   */
  onInsert: (text: string) => void;
  /** Human name of the field, used to pre-fill the snippet name when saving ("Father's name"). */
  fieldLabel?: string;
  disabled?: boolean;
  /** Icon-button size; match the input it sits beside. Default `"input"`-height `md`. */
  size?: "sm" | "md" | "lg";
  /** Raise when the host surface is itself above the default popover layer. */
  popoverZIndex?: number;
}

export interface ClipboardSaveValueProps {
  fieldKey: string;
  value: string;
  fieldLabel?: string;
  /** Called after the snippet is saved. */
  onSaved: () => void;
}
