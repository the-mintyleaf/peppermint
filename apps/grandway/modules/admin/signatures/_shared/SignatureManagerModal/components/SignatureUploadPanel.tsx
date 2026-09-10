"use client";

import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { Box, Button, Divider, Group, Stack, Text } from "@peppermint/ui";
import { z } from "zod";
import { SignatureImage } from "../../SignatureImage";
import { useUploadSignatorySignature } from "../../../signatures.hooks";
import { SIGNATURE_SOURCE_LABELS } from "../../../signatures.labels";
import type {
  Signatory,
  SignatureUploadFormValues,
} from "../../../signatures.types";
import { DirtyReporter, type ReportDirty } from "./DirtyReporter";
import { RemoveSignatureAction } from "./RemoveSignatureAction";
import { SignatureDropzone } from "./SignatureDropzone";
import { signatureFileSchema } from "./signatoryFormSchema";

/**
 * Only `file` is validated; `notes` is free text. The rules live in
 * `signatureFileSchema` so the create form applies exactly the same ones.
 */
const schema = z.object({
  file: signatureFileSchema,
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

      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <Box
          p="xs"
          style={{
            flex: 1,
            minWidth: 0,
            border: "1px solid var(--mantine-color-gray-light)",
            borderRadius: "var(--mantine-radius-sm)",
          }}
        >
          <SignatureImage signatory={signatory} height={72} />
        </Box>
        <RemoveSignatureAction signatory={signatory} />
      </Group>

      {signatory.signature_source === "uploaded" && version ? (
        <Text size="xs" c="dimmed">
          {signatory.signature_file?.original_filename} · version {version}.
          Uploading again replaces it; the previous version is kept.
        </Text>
      ) : signatory.signature_source === "url" ? (
        <Text size="xs" c="dimmed">
          Rendering the external link from the details above. Uploading an image
          will take precedence over it.
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
        // still shows the image after a successful save, which reads as "it
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
          <UploadSubmit replacing={signatory.signature_source === "uploaded"} />
        </Stack>
      </FormWrapper>
    </Stack>
  );
}

function UploadField() {
  const { form } = useFormInstance<SignatureUploadFormValues>();
  // `useFormInstance` alone does not re-render on submit state, so the pending
  // flag has to come from the controls context. Without it the drop target
  // stays live during an upload: a second image could be dropped mid-flight,
  // swapping the preview to a file that is not the one being sent, and
  // `formClearOnSuccess` would then wipe that second pick when the FIRST
  // upload resolved — a silent, unexplained loss.
  const { isLoading } = useFormControls();
  const props = form.getInputProps("file");
  return (
    <SignatureDropzone
      file={form.values.file}
      onPick={(file) => form.setFieldValue("file", file)}
      error={typeof props.error === "string" ? props.error : undefined}
      disabled={isLoading}
    />
  );
}

function UploadSubmit({ replacing }: { replacing: boolean }) {
  const { handleSubmit, isLoading } = useFormControls();
  const { form } = useFormInstance<SignatureUploadFormValues>();
  const file = form.values.file;
  return (
    <Group justify="flex-end" gap="xs">
      {file ? (
        <Button
          size="xs"
          variant="subtle"
          disabled={isLoading}
          onClick={() => form.setFieldValue("file", null)}
        >
          Clear
        </Button>
      ) : null}
      <Button
        size="xs"
        variant="light"
        loading={isLoading}
        disabled={!file}
        onClick={handleSubmit}
      >
        {replacing ? "Replace signature" : "Upload signature"}
      </Button>
    </Group>
  );
}
