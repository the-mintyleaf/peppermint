import type { UseFormReturnType } from "@peppermint/ui";

import type { NoteFormValues } from "../../NotesPanel.types";

export interface FormBinderProps {
  onBind: (form: UseFormReturnType<NoteFormValues>) => void;
}

export interface NoteFormProps {
  /** `create`: "When" may be left as Now (null). `edit`: "When" is required. */
  mode: "create" | "edit";
  /** Read once at mount — key the component to reset it. */
  initialValues: NoteFormValues;
  submitLabel: string;
  /** Accessible name of the body textarea, e.g. "Write a note about this lead". */
  bodyLabel: string;
  /** Shows the General/Visit control (edit only — the composer follows the tab). */
  showCategory: boolean;
  /**
   * Performs the write. Resolve on success; reject with the API error — the
   * form maps a future-date / validation error onto its fields and stays open.
   */
  onSubmit: (values: NoteFormValues) => Promise<void>;
  onCancel: () => void;
  popoverZIndex?: number;
}

export interface NoteFieldsProps {
  mode: NoteFormProps["mode"];
  bodyLabel: string;
  showCategory: boolean;
  onCancel: () => void;
  popoverZIndex?: number;
}

export interface NoteFormFooterProps {
  submitLabel: string;
  onCancel: () => void;
}
