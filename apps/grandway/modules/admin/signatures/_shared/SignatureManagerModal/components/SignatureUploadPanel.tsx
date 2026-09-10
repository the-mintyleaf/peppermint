"use client";

import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import {
  Box,
  Button,
  Divider,
  FileInput,
  Group,
  Stack,
  Text,
} from "@peppermint/ui";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { z } from "zod";
import { SignatureImage } from "../../SignatureImage";
import { useUploadSignatorySignature } from "../../../signatures.hooks";
import {
  MAX_SIGNATURE_SIZE_BYTES,
  SIGNATURE_EXTENSIONS,
  SIGNATURE_FILE_INPUT_ACCEPT,
  SIGNATURE_SOURCE_LABELS,
} from "../../../signatures.labels";
import type {
  Signatory,
  SignatureUploadFormValues,
} from "../../../signatures.types";
import { DirtyReporter, type ReportDirty } from "./DirtyReporter";

/**
 * The extension list is **narrower than the file ledger's seven types** and
 * deliberately so (§7) — none of PDF/DOCX/XLSX is a signature. Checking it here
 * turns one of the three server-side rejections into an inline message.
 *
 * The third rejection — leading bytes disagreeing with the extension, i.e. a PDF
 * renamed `.png` — **cannot be pre-empted client-side**, so it arrives as a
 * notification from the mutation rather than as field validation.
 */
const schema = z.object({
  file: z
    .instanceof(File, { message: "Choose an image" })
    .refine((f) => f.size > 0, "This file is empty")
    .refine(
      (f) => f.size <= MAX_SIGNATURE_SIZE_BYTES,
      "Image must be 10 MB or smaller",
    )
    .refine(
      (f) =>
        SIGNATURE_EXTENSIONS.some((ext) =>
          f.name.toLowerCase().endsWith(`.${ext}`),
        ),
      "Accepted types: PNG, JPG, JPEG, WEBP",
    ),
  notes: z.string(),
});

const initial: SignatureUploadFormValues = { file: null, notes: "" };

interface SignatureUploadPanelProps {
  signatory: Signatory;
  /**
   * A picked-but-not-yet-uploaded file is unsaved input like any other, and the
   * shell guards every exit path — so this panel reports its own dirtiness
   * rather than letting the file be dropped silently.
   */
  onDirtyChange: ReportDirty;
}

/**
 * The signature image section of the edit view. Separate from the details form
 * because it is a separate endpoint with a separate encoding — multipart, and
 * one that needs an id, which is why this never appears while creating.
 *
 * Uploading again **replaces**: the predecessor is versioned, not duplicated.
 */
export function SignatureUploadPanel({
  signatory,
  onDirtyChange,
}: SignatureUploadPanelProps) {
  const mutation = useUploadSignatorySignature(signatory.id);
  const version = signatory.signature_file?.version_number;

  return (
    <Stack gap="sm">
      <Divider
        label={`Signature image — ${SIGNATURE_SOURCE_LABELS[signatory.signature_source]}`}
        labelPosition="left"
      />

      <Box
        p="xs"
        style={{
          border: "1px solid var(--mantine-color-gray-light)",
          borderRadius: "var(--mantine-radius-sm)",
        }}
      >
        <SignatureImage signatory={signatory} height={72} />
      </Box>

      {signatory.signature_source === "uploaded" && version ? (
        <Text size="xs" c="dimmed">
          {signatory.signature_file?.original_filename} · version {version}.
          Uploading again replaces it; the previous version is kept.
        </Text>
      ) : signatory.signature_source === "url" ? (
        <Text size="xs" c="dimmed">
          Rendering the external link. Uploading an image will take precedence
          over it.
        </Text>
      ) : (
        <Text size="xs" c="dimmed">
          This signer will render a blank signature until an image is uploaded
          or a URL is set.
        </Text>
      )}

      <FormWrapper<SignatureUploadFormValues>
        initial={initial}
        validation={[schema]}
        // Required for `isDirty` to mean anything — `FormWrapper` hard-codes it
        // to `false` without this, which would leave `DirtyReporter` below
        // permanently reporting "clean" and let a picked-but-not-uploaded file
        // be dropped with no prompt.
        hasDirtCheck
        // Clears the picked file once the upload lands. Without it the field
        // still shows the filename after a successful save, which reads as "it
        // didn't work" and invites a second click that stores a pointless
        // extra version.
        formClearOnSuccess
        finalSubmitFn={async (values) => {
          const formData = new FormData();
          formData.append("file", values.file as File);
          if (values.notes.trim())
            formData.append("notes", values.notes.trim());
          try {
            await mutation.mutateAsync(formData);
          } catch {
            // The mutation already showed the specific error — including the
            // content-mismatch case this form cannot pre-empt. Reporting `ok`
            // keeps the panel open so the user can pick a different file.
            return { ok: true };
          }
          return { ok: true };
        }}
      >
        <Stack gap="xs">
          <DirtyReporter
            source="signature-image"
            onDirtyChange={onDirtyChange}
          />
          <UploadField />
          <UploadSubmit />
        </Stack>
      </FormWrapper>
    </Stack>
  );
}

function UploadField() {
  const { form } = useFormInstance<SignatureUploadFormValues>();
  return (
    <FileInput
      size="xs"
      label={undefined}
      placeholder="PNG, JPG, JPEG or WEBP — max 10 MB"
      accept={SIGNATURE_FILE_INPUT_ACCEPT}
      clearable
      leftSection={<UploadSimpleIcon size={14} aria-hidden />}
      aria-label="Signature image file"
      {...form.getInputProps("file")}
    />
  );
}

function UploadSubmit() {
  const { handleSubmit, isLoading } = useFormControls();
  const { form } = useFormInstance<SignatureUploadFormValues>();
  return (
    <Group justify="flex-end">
      <Button
        size="xs"
        variant="light"
        loading={isLoading}
        disabled={!form.values.file}
        onClick={handleSubmit}
      >
        Upload signature
      </Button>
    </Group>
  );
}
