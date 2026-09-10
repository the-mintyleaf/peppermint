"use client";

import { useState } from "react";
import { Alert, Badge, Group, Loader, Stack, Text } from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import {
  useSignatoryDetail,
  useUpdateSignatory,
} from "../../../signatures.hooks";
import {
  SIGNATORY_STATUS_COLORS,
  SIGNATORY_STATUS_HINTS,
  SIGNATORY_STATUS_LABELS,
} from "../../../signatures.labels";
import type { Signatory, SignatoryFormValues } from "../../../signatures.types";
import type { ReportDirty } from "./DirtyReporter";
import { SignatoryCreateForm } from "./SignatoryCreateForm";
import { SignatoryFormFields } from "./SignatoryFormFields";
import { SignatureUploadPanel } from "./SignatureUploadPanel";

function toFormValues(signatory: Signatory): SignatoryFormValues {
  return {
    name: signatory.name,
    title: signatory.title,
    role: signatory.role,
    signature_image_url: signatory.signature_image_url,
  };
}

function trimmed(values: SignatoryFormValues) {
  return {
    name: values.name.trim(),
    title: values.title.trim(),
    role: values.role.trim(),
    signature_image_url: values.signature_image_url.trim(),
  };
}

interface CreateViewProps {
  onDone: (id: string) => void;
  onCancel: () => void;
  onDirtyChange: ReportDirty;
}

/**
 * Adding a signer. The image lives in this form too — the API needs two calls
 * (the upload endpoint wants an id the create has not returned yet), but that
 * is a backend constraint, not something an operator should have to work
 * around, so `SignatoryCreateForm` chains them behind one submit.
 *
 * On success it moves straight to the edit view, where the signature panel and
 * the activate control are — so "add a signer" reads as one continuous motion.
 */
export function SignatoryCreateView({
  onDone,
  onCancel,
  onDirtyChange,
}: CreateViewProps) {
  return (
    <Stack gap="md" p="md">
      <Alert
        variant="light"
        color="blue"
        icon={<InfoIcon size={16} aria-hidden />}
      >
        <Text size="xs">
          New signers are created as a <b>draft</b> — they appear in the
          certificate picker only once you activate them, on the next screen.
        </Text>
      </Alert>
      <SignatoryCreateForm
        onCreated={onDone}
        onCancel={onCancel}
        onDirtyChange={onDirtyChange}
      />
    </Stack>
  );
}

interface EditViewProps {
  id: string;
  onCancel: () => void;
  onDirtyChange: ReportDirty;
}

/**
 * The row comes from a detail read rather than a lookup in the list, for two
 * reasons: the library list is filterable, so the row being edited may not be
 * in it, and changing a signatory's status would drop it out of a filtered
 * list mid-edit and turn a successful save into "signatory not found".
 *
 * Reading it fresh (rather than taking it as a prop) also means an upload or a
 * status change that lands while this is open is reflected here instead of
 * being shadowed by a stale copy.
 */
export function SignatoryEditView({
  id,
  onCancel,
  onDirtyChange,
}: EditViewProps) {
  const query = useSignatoryDetail(id);
  const signatory = query.data;
  const mutation = useUpdateSignatory(id);

  // What the details form is baselined against, and how many times it has been
  // re-baselined. `FormWrapper` fixes its initial values at mount and has no
  // "accept these as the new baseline" API, so a save has to remount it —
  // otherwise `isDirty` stays true afterwards and every exit pops a false
  // "Discard changes?".
  //
  // **The trigger is our own save, never the server row.** Keying this on
  // `updated_at` would remount the form whenever the detail query refetched —
  // and uploading an image on the panel below does exactly that, since that
  // mutation invalidates this row. A half-typed name would vanish with no
  // prompt, through a path the shell's guard never sees. Baselining from the
  // mutation's own response also closes the window where the PATCH has landed
  // but the fire-and-forget refetch has not.
  const [baseline, setBaseline] = useState<SignatoryFormValues | null>(null);
  const [formEpoch, setFormEpoch] = useState(0);

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
        key={formEpoch}
        initial={baseline ?? toFormValues(signatory)}
        submitLabel="Save details"
        onCancel={onCancel}
        onDirtyChange={onDirtyChange}
        onSubmit={async (values) => {
          const saved = await mutation.mutateAsync(trimmed(values));
          setBaseline(toFormValues(saved));
          setFormEpoch((epoch) => epoch + 1);
        }}
      />

      <SignatureUploadPanel
        signatory={signatory}
        onDirtyChange={onDirtyChange}
      />
    </Stack>
  );
}
