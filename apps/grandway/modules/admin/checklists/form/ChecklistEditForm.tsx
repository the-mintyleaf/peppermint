"use client";

import {
  Alert,
  Button,
  DateInput,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import type { ModalFormComponentProps } from "@peppermint/admin";
import type { Checklist, UpdateChecklistPayload } from "../checklists.types";
import type { ChecklistEditValues } from "./ChecklistEditForm.types";

/**
 * The `Checklist` list-row shape carries no `notes` (only `ChecklistDetail`
 * does) — `onEditTrigger` on the worklist always re-fetches the full detail
 * before this form mounts, so `record.notes` is a real value at runtime even
 * though the generic here is the narrower `Checklist`.
 */
type EditableChecklist = Partial<Checklist> & { notes?: string };

function toEditFormValues(record: EditableChecklist): ChecklistEditValues {
  return {
    title: record.title ?? "",
    description: record.description ?? "",
    assigned_to: record.assigned_to?.id ?? "",
    due_at: record.due_at ?? null,
    notes: record.notes ?? "",
  };
}

/**
 * Diffs the edited values against the loaded checklist and returns ONLY the
 * fields that changed — a PATCH must carry just the mutable fields the user
 * actually touched (§3, mirrors `offers.OfferEditForm`'s `diffOfferUpdate`).
 */
function diffChecklistUpdate(
  original: EditableChecklist,
  values: ChecklistEditValues,
): UpdateChecklistPayload {
  const base = toEditFormValues(original);
  const payload: UpdateChecklistPayload = {};

  if (values.title.trim() !== base.title) payload.title = values.title.trim();
  if (values.description.trim() !== base.description)
    payload.description = values.description.trim();
  if (values.assigned_to.trim() !== base.assigned_to)
    payload.assigned_to = values.assigned_to.trim() || null;
  if ((values.due_at || null) !== (base.due_at || null))
    payload.due_at = values.due_at || null;
  if (values.notes.trim() !== base.notes) payload.notes = values.notes.trim();

  return payload;
}

/**
 * Edit form — the mutable subset only (`title`/`description`/`assigned_to`/
 * `due_at`/`notes`). The journey, origin, source template, and status are
 * immutable here; status moves only through the lifecycle actions on the
 * Checklist Detail page (never through this modal).
 */
export function ChecklistEditForm({
  onSubmit,
  isLoading,
  initialValues,
}: ModalFormComponentProps<Checklist, UpdateChecklistPayload>) {
  const record: EditableChecklist = initialValues ?? {};
  const initial = toEditFormValues(record);

  return (
    <FormWrapper<ChecklistEditValues>
      initial={initial}
      hasDirtCheck
      finalSubmitFn={async (values) => {
        onSubmit(diffChecklistUpdate(record, values));
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="blue"
          icon={<InfoIcon size={16} aria-hidden />}
          title="Status moves through lifecycle actions only"
        >
          Activate, complete, reopen, archive, and restore live on the
          checklist&apos;s own detail page — not here.
        </Alert>
        <EditFields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function EditFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<ChecklistEditValues>();
  return (
    <>
      <TextInput
        label="Title"
        required
        disabled={isLoading}
        {...form.getInputProps("title")}
      />
      <Textarea
        label="Description"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("description")}
      />
      <TextInput
        label="Assigned to (user ID, optional)"
        description="No user picker is available yet — paste the user's id"
        disabled={isLoading}
        {...form.getInputProps("assigned_to")}
      />
      <DateInput
        label="Due date"
        valueFormat="YYYY-MM-DD"
        clearable
        disabled={isLoading}
        {...form.getInputProps("due_at")}
      />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("notes")}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save changes
    </Button>
  );
}
