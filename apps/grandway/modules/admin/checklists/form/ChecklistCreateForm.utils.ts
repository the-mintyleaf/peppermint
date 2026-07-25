import type { CreateChecklistPayload } from "../checklists.types";
import type { ChecklistCreateValues } from "./ChecklistCreateForm.types";

export const CHECKLIST_CREATE_INITIAL: ChecklistCreateValues = {
  journey: "",
  mode: "template",
  template: null,
  title: "",
  description: "",
  assigned_to: "",
  due_at: null,
  notes: "",
};

/**
 * Maps form values to EITHER create shape (§7) — from-template sends only
 * `{ journey, template }` (every other field is ignored server-side, so none
 * are sent); blank sends the full descriptive set.
 */
export function toCreateChecklistPayload(
  values: ChecklistCreateValues,
): CreateChecklistPayload {
  if (values.mode === "template") {
    return { journey: values.journey, template: values.template as string };
  }
  return {
    journey: values.journey,
    title: values.title.trim(),
    ...(values.description.trim()
      ? { description: values.description.trim() }
      : {}),
    ...(values.assigned_to.trim()
      ? { assigned_to: values.assigned_to.trim() }
      : {}),
    ...(values.due_at ? { due_at: values.due_at } : {}),
    ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
  };
}
