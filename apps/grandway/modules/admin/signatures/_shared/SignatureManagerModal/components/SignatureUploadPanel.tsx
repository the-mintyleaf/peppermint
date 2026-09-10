"use client";

import {
  FormWrapper,
  openReasonConfirmModal,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { Box, Button, Divider, Group, Stack, Text } from "@peppermint/ui";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { z } from "zod";
import { SignatureImage } from "../../SignatureImage";
import {
  useRemoveSignatorySignature,
  useUploadSignatorySignature,
} from "../../../signatures.hooks";
import {
  MAX_SIGNATURE_SIZE_BYTES,
  SIGNATURE_EXTENSIONS,
  SIGNATURE_SOURCE_LABELS,
} from "../../../signatures.labels";
import type {
  Signatory,
  SignatureUploadFormValues,
} from "../../../signatures.types";
import { DirtyReporter, type ReportDirty } from "./DirtyReporter";
import { SignatureDropzone } from "./SignatureDropzone";

/**
 * The extension list is **narrower than the file ledger's seven types** and
 * deliberately so (§7) — none of PDF/DOCX/XLSX is a signature. Checking it here
 * turns two of the three server-side rejections into inline messages.
 *
 * The third — leading bytes disagreeing with the extension, i.e. a PDF renamed
 * `.png` — **cannot be pre-empted client-side**, so it arrives as a
 * notification from the mutation rather than as field validation.
 */
const schema = z.object({
  file: z
    .instanceof(File, { message: "Choose a signature image" })
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
  const props = form.getInputProps("file");
  return (
    <SignatureDropzone
      file={form.values.file}
      onPick={(file) => form.setFieldValue("file", file)}
      error={typeof props.error === "string" ? props.error : undefined}
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

/**
 * Removal is **archiving the file** on the `uploaded_files` module — this API
 * has no removal endpoint (§3). Only offered when an uploaded file is actually
 * in force; an external link is cleared by emptying the URL field above, and
 * there is nothing to remove when the source is `none`.
 *
 * The confirm names what will render afterwards, because the fallback is not
 * obvious: clearing an uploaded image does not always mean a blank signature —
 * a signatory that also has a URL falls back to it.
 */
function RemoveSignatureAction({ signatory }: { signatory: Signatory }) {
  const fileId = signatory.signature_file?.id ?? "";
  const mutation = useRemoveSignatorySignature(fileId);

  if (signatory.signature_source !== "uploaded" || !fileId) return null;

  const fallsBackTo = signatory.signature_image_url
    ? "the external link in the details above"
    : "a blank signature";

  const confirm = () =>
    openReasonConfirmModal({
      title: "Remove signature image",
      alertTitle: `${signatory.name}'s signature will stop rendering`,
      description: `Certificates naming this signer will fall back to ${fallsBackTo} — including ones already issued, since a reprint resolves the signature live. The file itself is archived, not deleted, and can be restored from the file record.`,
      tone: "danger",
      reasonLabel: "Reason",
      reasonPlaceholder: "Why is this signature being withdrawn?",
      confirmLabel: "Remove signature",
      confirmColor: "red",
      onConfirm: async (reason) => {
        await mutation.mutateAsync({ reason });
      },
    });

  return (
    <Button
      size="xs"
      variant="subtle"
      color="red"
      loading={mutation.isPending}
      leftSection={<TrashIcon size={14} aria-hidden />}
      onClick={confirm}
    >
      Remove
    </Button>
  );
}
