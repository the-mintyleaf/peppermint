"use client";

import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import {
  Button,
  FileInput,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
} from "@peppermint/ui";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { z } from "zod";
import { confirmDiscardChanges } from "../../confirmDiscardChanges";
import { useUploadFile } from "../../../uploadedFiles.hooks";
import { FILE_CATEGORY_OPTIONS } from "../../../uploadedFiles.labels";
import type {
  FileCategory,
  UploadFileFormValues,
} from "../../../uploadedFiles.types";
import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_FILE_INPUT_ACCEPT,
  MAX_FILE_SIZE_BYTES,
  getOwnerEntry,
} from "../../../uploadedFiles.utils";
import type { UploadFileModalProps } from "./UploadFileModal.types";

const schema = z.object({
  category: z.string().min(1, "Choose a category"),
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, "This file is empty")
    .refine(
      (f) => f.size <= MAX_FILE_SIZE_BYTES,
      "File must be 10 MB or smaller",
    )
    .refine(
      (f) =>
        ACCEPTED_EXTENSIONS.some((ext) =>
          f.name.toLowerCase().endsWith(`.${ext}`),
        ),
      "Accepted types: PDF, JPG, JPEG, PNG, WEBP, DOCX, XLSX",
    ),
  notes: z.string(),
});

const initial: UploadFileFormValues = { category: "", file: null, notes: "" };

/**
 * Upload — `POST /api/v1/files/`, multipart. Owner is implicit from the
 * embedding panel's `scope`, never a field the user picks (§4 — exactly one
 * owner, a database constraint). The new file always lands `pending` (§4);
 * there is no way to pre-verify on upload.
 */
export function UploadFileModal({
  scope,
  opened,
  onClose,
}: UploadFileModalProps) {
  const mutation = useUploadFile();

  return (
    <Modal opened={opened} onClose={onClose} title="Upload file" centered>
      <FormWrapper<UploadFileFormValues>
        initial={initial}
        validation={[schema]}
        hasDirtCheck
        finalSubmitFn={async (values) => {
          const [ownerField, ownerId] = getOwnerEntry(scope);
          const formData = new FormData();
          formData.append(ownerField, ownerId);
          formData.append("category", values.category);
          formData.append("file", values.file as File);
          if (values.notes.trim())
            formData.append("notes", values.notes.trim());
          try {
            await mutation.mutateAsync(formData);
          } catch {
            // `useUploadFile` (useAppMutation) already showed the specific
            // error toast via its own onError — report `ok: true` here so
            // FormWrapper doesn't layer a second, generic one on top. The
            // modal deliberately stays open (no `onClose()`) so the user can
            // retry with the same input.
            return { ok: true };
          }
          onClose();
          return { ok: true };
        }}
      >
        <Stack gap="md" p="md">
          <UploadFileFields />
          <SubmitRow onClose={onClose} />
        </Stack>
      </FormWrapper>
    </Modal>
  );
}

function UploadFileFields() {
  const { form } = useFormInstance<UploadFileFormValues>();
  return (
    <>
      <Select
        label="Category"
        placeholder="What is this file?"
        data={FILE_CATEGORY_OPTIONS}
        required
        {...form.getInputProps("category")}
        onChange={(value) =>
          form.setFieldValue("category", (value ?? "") as FileCategory | "")
        }
      />
      <FileInput
        label="File"
        placeholder="PDF, JPG, JPEG, PNG, WEBP, DOCX, or XLSX — max 10 MB"
        accept={ACCEPTED_FILE_INPUT_ACCEPT}
        clearable
        required
        leftSection={<UploadSimpleIcon size={16} aria-hidden />}
        {...form.getInputProps("file")}
      />
      <Textarea
        label="Notes (optional)"
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
        Upload
      </Button>
    </Group>
  );
}
