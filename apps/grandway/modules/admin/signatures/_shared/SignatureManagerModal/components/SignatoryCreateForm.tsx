"use client";

import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { Button, Divider, Group, Stack, Text } from "@peppermint/ui";
import {
  useCreateSignatory,
  useUploadSignatureToSignatory,
} from "../../../signatures.hooks";
import type { SignatoryCreateFormValues } from "../../../signatures.types";
import { DirtyReporter, type ReportDirty } from "./DirtyReporter";
import { SignatoryDetailFields } from "./SignatoryDetailFields";
import { SignatureDropzone } from "./SignatureDropzone";
import { signatoryCreateSchema } from "./signatoryFormSchema";

const EMPTY: SignatoryCreateFormValues = {
  name: "",
  title: "",
  role: "",
  signature_image_url: "",
  file: null,
};

interface SignatoryCreateFormProps {
  /** Called with the new id once the signatory exists, image uploaded or not. */
  onCreated: (id: string) => void;
  onCancel: () => void;
  onDirtyChange: ReportDirty;
}

/**
 * Adding a signer, **image included, in one action**.
 *
 * The API cannot do it in one call: `POST /signatories/<id>/signature/` needs an
 * id that does not exist until the create returns. That is a backend
 * constraint, not something an operator should have to know, so this form
 * chains the two — create, then upload against the new id — and presents it as
 * a single submit.
 *
 * **The two halves fail independently, and that is handled rather than hidden.**
 * If the create succeeds and the upload does not, the signatory really does
 * exist (as a `draft`) and must not be silently dropped: the form hands the new
 * id up regardless, landing on the edit screen where the image panel is waiting
 * and the error notification is still on screen. Rolling back is not an option
 * either — there is no DELETE anywhere in this API.
 */
export function SignatoryCreateForm({
  onCreated,
  onCancel,
  onDirtyChange,
}: SignatoryCreateFormProps) {
  const createMutation = useCreateSignatory();
  // The id is only known after the create resolves, so this variant takes it
  // per call rather than binding one at mount.
  const uploadMutation = useUploadSignatureToSignatory();

  return (
    <FormWrapper<SignatoryCreateFormValues>
      initial={EMPTY}
      validation={[signatoryCreateSchema]}
      hasDirtCheck
      finalSubmitFn={async (values) => {
        const created = await createMutation.mutateAsync({
          name: values.name.trim(),
          title: values.title.trim(),
          role: values.role.trim(),
          signature_image_url: values.signature_image_url.trim(),
        });

        if (values.file) {
          const formData = new FormData();
          formData.append("file", values.file);
          try {
            await uploadMutation.mutateAsync({
              id: created.id,
              formData,
            });
          } catch {
            // The mutation already showed the specific failure. The signatory
            // exists either way, so carry on to the edit screen rather than
            // stranding a record the user cannot see.
            onCreated(created.id);
            return { ok: true };
          }
        }

        onCreated(created.id);
        return { ok: true };
      }}
    >
      <Stack gap="sm">
        <DirtyReporter source="details" onDirtyChange={onDirtyChange} />
        <SignatoryDetailFields />

        <Divider label="Signature image" labelPosition="left" mt="xs" />
        <Text size="xs" c="dimmed">
          Optional — you can add it later. Whatever is uploaded is exactly what
          prints, at the size shown.
        </Text>
        <CreateUploadField />

        <SubmitRow onCancel={onCancel} />
      </Stack>
    </FormWrapper>
  );
}

function CreateUploadField() {
  const { form } = useFormInstance<SignatoryCreateFormValues>();
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

function SubmitRow({ onCancel }: { onCancel: () => void }) {
  const { handleSubmit, isLoading } = useFormControls();
  const { form } = useFormInstance<SignatoryCreateFormValues>();
  return (
    <Group justify="flex-end" gap="xs" mt="xs">
      {form.values.file ? (
        <Button
          variant="subtle"
          size="xs"
          disabled={isLoading}
          onClick={() => form.setFieldValue("file", null)}
        >
          Clear image
        </Button>
      ) : null}
      <Button
        variant="default"
        size="xs"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button size="xs" loading={isLoading} onClick={handleSubmit}>
        {form.values.file ? "Create and upload" : "Create signatory"}
      </Button>
    </Group>
  );
}
