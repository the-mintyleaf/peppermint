"use client";

import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import {
  Alert,
  Button,
  FileInput,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
} from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { z } from "zod";
import { confirmDiscardChanges } from "../../confirmDiscardChanges";
import { useReplaceFile } from "../../../uploadedFiles.hooks";
import type {
  ReplaceFileFormValues,
  UploadedFile,
} from "../../../uploadedFiles.types";
import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_FILE_INPUT_ACCEPT,
  MAX_FILE_SIZE_BYTES,
} from "../../../uploadedFiles.utils";
import type { ReplaceFileModalProps } from "./ReplaceFileModal.types";

const schema = z.object({
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

const initial: ReplaceFileFormValues = { file: null, notes: "" };

/**
 * Replace — `POST /api/v1/files/<id>/replace/`, multipart. Creates a NEW file
 * record with a NEW id; the predecessor becomes `is_current: false` but keeps
 * its bytes, verdict, and reason permanently (§3). No owner/category fields —
 * both inherited (§7). The successor always lands `pending`, even when
 * replacing a rejected file (§FLOWS).
 */
export function ReplaceFileModal({
  file,
  opened,
  onClose,
  onReplaced,
}: ReplaceFileModalProps) {
  const mutation = useReplaceFile(file.id);

  return (
    <Modal opened={opened} onClose={onClose} title="Replace file" centered>
      <FormWrapper<ReplaceFileFormValues>
        initial={initial}
        validation={[schema]}
        hasDirtCheck
        finalSubmitFn={async (values) => {
          const formData = new FormData();
          formData.append("file", values.file as File);
          if (values.notes.trim())
            formData.append("notes", values.notes.trim());
          let created: UploadedFile;
          try {
            created = await mutation.mutateAsync(formData);
          } catch {
            // `useReplaceFile` already showed the specific error toast — see
            // `UploadFileModal`'s identical comment for why this reports
            // `ok: true` and keeps the modal open instead of closing it.
            return { ok: true };
          }
          onClose();
          onReplaced?.(created.id);
          return { ok: true };
        }}
      >
        <Stack gap="md" p="md">
          <Alert
            variant="light"
            color="blue"
            icon={<InfoIcon size={16} aria-hidden />}
            title={`Replacing ${file.original_filename}`}
          >
            <Text size="xs">
              The new file becomes a separate, pending version. This one keeps
              its history and verdict permanently.
            </Text>
          </Alert>
          <ReplaceFileFields />
          <SubmitRow onClose={onClose} />
        </Stack>
      </FormWrapper>
    </Modal>
  );
}

function ReplaceFileFields() {
  const { form } = useFormInstance<ReplaceFileFormValues>();
  return (
    <>
      <FileInput
        label="New file"
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
        Replace
      </Button>
    </Group>
  );
}
