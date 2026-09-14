import type { TemplateStatus } from "../checklists.types";

/**
 * The shared create/edit template form's own value shape — a fully-populated
 * object (empty strings, not omitted keys). `extends Record<string, unknown>`
 * is the sanctioned `*Values` exemption (`FormWrapper<T>`'s generic bound is
 * stricter than a shell's `T extends object`). `key` is always present but the
 * form never asks for it: create derives it from the label, and edit renders it
 * disabled — it is immutable once a template is created.
 */
export interface TemplateFormValues extends Record<string, unknown> {
  key: string;
  label: string;
  description: string;
  /** Catalogue country id, or `null` for a general (manually-applied-only) template. */
  country: string | null;
  is_default: boolean;
  status: TemplateStatus;
  status_note: string;
  display_order: number | "";
  notes: string;
}

/** `ModalTableShell<ChecklistTemplate, CreateTemplateValues, UpdateTemplateValues>` — same underlying shape on both sides. */
export type CreateTemplateValues = TemplateFormValues;
export type UpdateTemplateValues = TemplateFormValues;
