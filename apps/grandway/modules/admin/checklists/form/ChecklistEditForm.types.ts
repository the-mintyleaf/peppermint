/**
 * FormWrapper value shape for editing a checklist — the mutable subset ONLY
 * (`title`/`description`/`assigned_to`/`due_at`/`notes`, §7). `status` is never
 * accepted here and is deliberately absent.
 */
export interface ChecklistEditValues extends Record<string, unknown> {
  title: string;
  description: string;
  assigned_to: string;
  due_at: string | null;
  notes: string;
}
