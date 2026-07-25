import type {
  ChecklistTemplate,
  CreateTemplatePayload,
  UpdateTemplatePayload,
} from "../checklists.types";
import type { TemplateFormValues } from "./TemplateForm.types";

export function toTemplateFormValues(
  template?: Partial<ChecklistTemplate>,
): TemplateFormValues {
  return {
    key: template?.key ?? "",
    label: template?.label ?? "",
    description: template?.description ?? "",
    country: template?.country?.id ?? null,
    is_default: template?.is_default ?? false,
    status: template?.status ?? "draft",
    status_note: template?.status_note ?? "",
    display_order: template?.display_order ?? 0,
    notes: template?.notes ?? "",
  };
}

/** `key` is only ever sent here — the create path. Edit strips it (immutable). */
export function toCreateTemplatePayload(
  values: TemplateFormValues,
): CreateTemplatePayload {
  return {
    key: values.key.trim(),
    label: values.label.trim(),
    description: values.description.trim(),
    country: values.country,
    is_default: values.is_default,
    status: values.status,
    status_note: values.status_note.trim(),
    display_order:
      values.display_order === "" ? undefined : values.display_order,
    notes: values.notes.trim(),
  };
}

/** Same fields as create, minus the immutable `key` (§7 — a template's key can never be sent on update). */
export function toUpdateTemplatePayload(
  values: TemplateFormValues,
): UpdateTemplatePayload {
  return {
    label: values.label.trim(),
    description: values.description.trim(),
    country: values.country,
    is_default: values.is_default,
    status: values.status,
    status_note: values.status_note.trim(),
    display_order:
      values.display_order === "" ? undefined : values.display_order,
    notes: values.notes.trim(),
  };
}
