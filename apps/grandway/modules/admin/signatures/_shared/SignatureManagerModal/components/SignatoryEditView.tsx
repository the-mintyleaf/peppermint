"use client";

import { Alert, Badge, Group, Loader, Stack, Text } from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import {
  useCreateSignatory,
  useSignatoryList,
  useUpdateSignatory,
} from "../../../signatures.hooks";
import {
  SIGNATORY_STATUS_COLORS,
  SIGNATORY_STATUS_HINTS,
  SIGNATORY_STATUS_LABELS,
} from "../../../signatures.labels";
import type { SignatoryFormValues } from "../../../signatures.types";
import { SignatoryFormFields } from "./SignatoryFormFields";
import { SignatureUploadPanel } from "./SignatureUploadPanel";

const EMPTY: SignatoryFormValues = {
  name: "",
  title: "",
  role: "",
  signature_image_url: "",
};

interface CreateViewProps {
  onDone: (id: string) => void;
  onCancel: () => void;
}

/**
 * Create is details-only. The upload endpoint needs an id that does not exist
 * yet, so the image is genuinely a second step — the alert says so rather than
 * leaving the user hunting for a file field that cannot be here.
 *
 * On success it hands the new id straight to the edit view, so "create, then
 * upload" is one continuous motion rather than a return to the list.
 */
export function SignatoryCreateView({ onDone, onCancel }: CreateViewProps) {
  const mutation = useCreateSignatory();

  return (
    <Stack gap="md" p="md">
      <Alert
        variant="light"
        color="blue"
        icon={<InfoIcon size={16} aria-hidden />}
      >
        <Text size="xs">
          Saving creates a <b>draft</b>. You&apos;ll be able to upload the
          signature image on the next screen, then activate the signer so
          certificates can name them.
        </Text>
      </Alert>
      <SignatoryFormFields
        initial={EMPTY}
        submitLabel="Save and continue"
        onCancel={onCancel}
        onSubmit={async (values) => {
          const created = await mutation.mutateAsync({
            name: values.name.trim(),
            title: values.title.trim(),
            role: values.role.trim(),
            signature_image_url: values.signature_image_url.trim(),
          });
          onDone(created.id);
        }}
      />
    </Stack>
  );
}

interface EditViewProps {
  id: string;
  onCancel: () => void;
}

/**
 * The row is read back out of the list query rather than passed in, so an
 * upload or a status change that lands while this is open is reflected here
 * instead of being shadowed by a stale copy.
 */
export function SignatoryEditView({ id, onCancel }: EditViewProps) {
  const query = useSignatoryList({});
  const signatory = query.data?.data.find((s) => s.id === id);
  const mutation = useUpdateSignatory(id);

  if (query.isLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader size="sm" aria-label="Loading signatory" />
      </Group>
    );
  }

  if (!signatory) {
    return (
      <Stack p="md">
        <Alert
          variant="light"
          color="red"
          icon={<WarningIcon size={16} aria-hidden />}
          title="Signatory not found"
        >
          <Text size="xs">
            It may have been removed from view since this screen opened. Go back
            to the library and try again.
          </Text>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md">
      <Group gap="xs">
        <Badge
          size="sm"
          variant="light"
          color={SIGNATORY_STATUS_COLORS[signatory.status]}
        >
          {SIGNATORY_STATUS_LABELS[signatory.status]}
        </Badge>
        <Text size="xs" c="dimmed">
          {SIGNATORY_STATUS_HINTS[signatory.status]}
        </Text>
      </Group>

      <SignatoryFormFields
        initial={{
          name: signatory.name,
          title: signatory.title,
          role: signatory.role,
          signature_image_url: signatory.signature_image_url,
        }}
        submitLabel="Save details"
        onCancel={onCancel}
        onSubmit={async (values) => {
          await mutation.mutateAsync({
            name: values.name.trim(),
            title: values.title.trim(),
            role: values.role.trim(),
            signature_image_url: values.signature_image_url.trim(),
          });
        }}
      />

      <SignatureUploadPanel signatory={signatory} />
    </Stack>
  );
}
