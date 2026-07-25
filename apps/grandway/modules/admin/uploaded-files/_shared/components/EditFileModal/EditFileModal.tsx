"use client";

import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { Button, Group, Modal, Select, Stack, Textarea } from "@peppermint/ui";
import { z } from "zod";
import { confirmDiscardChanges } from "../../confirmDiscardChanges";
import { useUpdateFile } from "../../../uploadedFiles.hooks";
import { FILE_CATEGORY_OPTIONS } from "../../../uploadedFiles.labels";
import type {
  EditFileFormValues,
  FileCategory,
} from "../../../uploadedFiles.types";
import type { EditFileModalProps } from "./EditFileModal.types";

const schema = z.object({
  category: z.string().min(1, "Choose a category"),
  notes: z.string(),
});

/**
 * Edit — `PATCH /api/v1/files/<id>/`, category and/or notes ONLY (§7).
 * Nothing else exists on this form by contract: a file cannot be moved to
 * another record, renamed, or have its verification set through this
 * endpoint — anything else is refused by name (`UPLOADED_FILES_FIELD_IMMUTABLE`).
 */
export function EditFileModal({ file, opened, onClose }: EditFileModalProps) {
  const mutation = useUpdateFile(file.id);
  const initial: EditFileFormValues = {
    category: file.category,
    notes: file.notes,
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit file" centered>
      <FormWrapper<EditFileFormValues>
        initial={initial}
        validation={[schema]}
        hasDirtCheck
        finalSubmitFn={async (values) => {
          try {
            await mutation.mutateAsync(values);
          } catch {
            // `useUpdateFile` already showed the specific error toast — see
            // `UploadFileModal`'s identical comment for why this reports
            // `ok: true` and keeps the modal open instead of closing it.
            return { ok: true };
          }
          onClose();
          return { ok: true };
        }}
      >
        <Stack gap="md" p="md">
          <EditFileFields />
          <SubmitRow onClose={onClose} />
        </Stack>
      </FormWrapper>
    </Modal>
  );
}

function EditFileFields() {
  const { form } = useFormInstance<EditFileFormValues>();
  return (
    <>
      <Select
        label="Category"
        data={FILE_CATEGORY_OPTIONS}
        required
        allowDeselect={false}
        {...form.getInputProps("category")}
        onChange={(value) =>
          form.setFieldValue(
            "category",
            (value ?? form.values.category) as FileCategory,
          )
        }
      />
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        {...form.getInputProps("notes")}
      />
    </>
  );
}

function SubmitRow({ onClose }: { onClose: () => void }) {
  const { handleSubmit, isLoading, isDirty } = useFormControls();
  const handleCancel = () => {
    if (isDirty) confirmDiscardChanges(onClose);
    else onClose();
  };
  return (
    <Group justify="flex-end" gap="xs">
      <Button
        variant="default"
        size="xs"
        onClick={handleCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button size="xs" loading={isLoading} onClick={handleSubmit}>
        Save changes
      </Button>
    </Group>
  );
}
