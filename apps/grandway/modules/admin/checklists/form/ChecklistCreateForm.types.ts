/** How the checklist is built: copy an authored template, or start blank. */
export type ChecklistCreateMode = "template" | "blank";

/**
 * FormWrapper value shape for creating a checklist (the manual override — the
 * normal path is auto-inheritance and calls no endpoint). `extends
 * Record<string, unknown>` is the sanctioned `*Values` exemption. Maps to
 * EITHER of §7's two create shapes at submit time, never both
 * (`toCreateChecklistPayload`). `assigned_to` is a free-text user id — there is
 * no user-list endpoint here to source a picker from (INTEGRATION.md §9).
 */
export interface ChecklistCreateValues extends Record<string, unknown> {
  journey: string;
  mode: ChecklistCreateMode;
  /** Template mode only. */
  template: string | null;
  /** Blank mode only — required in that shape. */
  title: string;
  description: string;
  assigned_to: string;
  due_at: string | null;
  notes: string;
}
