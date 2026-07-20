"use client";

import { z } from "zod";
import {
  Button,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import {
  CONSENT_STATUS_LABELS,
  CONSENT_TYPE_LABELS,
  toOptions,
} from "../../_shared";
import type { Consent } from "../../_shared";
import type {
  ConsentFormProps,
  ConsentFormValues,
  ConsentPayload,
} from "./ConsentForm.types";

const CONSENT_TYPE_OPTIONS = toOptions(CONSENT_TYPE_LABELS);
const CONSENT_STATUS_OPTIONS = toOptions(CONSENT_STATUS_LABELS);

const VALIDATION = z.object({
  consent_type: z.string().min(1, "Consent type is required"),
  status: z.string().min(1, "Status is required"),
});

const INITIAL: ConsentFormValues = {
  consent_type: "data_processing",
  status: "granted",
  consent_text_version: "",
  captured_at: "",
  expires_at: "",
  notes: "",
  evidence_media: "",
};

function toInitial(record?: Partial<Consent>): ConsentFormValues {
  if (!record) return INITIAL;
  return {
    consent_type: record.consent_type ?? "data_processing",
    status: record.status ?? "granted",
    consent_text_version: record.consent_text_version ?? "",
    captured_at: record.captured_at ? record.captured_at.slice(0, 16) : "",
    expires_at: record.expires_at ? record.expires_at.slice(0, 16) : "",
    notes: record.notes ?? "",
    evidence_media: record.evidence_media ?? "",
  };
}

const TEXT_KEYS: (keyof ConsentFormValues)[] = [
  "consent_text_version",
  "notes",
];

/** `Nullable=Yes` — cleared by sending `null`, never `""` (DRF rejects `""` for a
 * DateTimeField, and for the `evidence_media` UUID relation). */
const NULLABLE_KEYS: (keyof ConsentFormValues)[] = [
  "captured_at",
  "expires_at",
  "evidence_media",
];

/**
 * Build the api payload. Always send consent_type + status. On create, empty values are
 * dropped; on edit they are sent explicitly so a cleared field actually clears — `""`
 * for the nullable=No text fields, `null` for the datetimes and the media link.
 * `withdrawn_at` is server-stamped and never sent.
 */
function toPayload(values: ConsentFormValues, isEdit: boolean): ConsentPayload {
  const payload: Record<string, unknown> = {
    consent_type: values.consent_type,
    status: values.status,
  };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  for (const key of NULLABLE_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "") payload[key] = value;
    else if (isEdit) payload[key] = null;
  }
  return payload as ConsentPayload;
}

/**
 * Create/edit an applicant consent (§8). Admin-only nested resource; a locked/archived
 * parent is rejected server-side and surfaced by the shell.
 */
export function ConsentForm({
  initialValues,
  onSubmit,
  isLoading,
}: ConsentFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<ConsentFormValues>
      initial={toInitial(initialValues)}
      validation={[VALIDATION]}
      finalSubmitFn={async (values) => {
        onSubmit(toPayload(values, isEdit));
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Fields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function Fields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<ConsentFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <Select
          label="Consent type"
          withAsterisk
          data={CONSENT_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("consent_type")}
        />
        <Select
          label="Status"
          withAsterisk
          data={CONSENT_STATUS_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("status")}
        />
      </Group>
      <Text size="xs" c="dimmed">
        Setting status to Withdrawn stamps the withdrawal time server-side.
      </Text>
      <TextInput
        label="Consent text version"
        disabled={isLoading}
        {...form.getInputProps("consent_text_version")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Captured at"
          type="datetime-local"
          disabled={isLoading}
          {...form.getInputProps("captured_at")}
        />
        <TextInput
          label="Expires at"
          type="datetime-local"
          disabled={isLoading}
          {...form.getInputProps("expires_at")}
        />
      </Group>
      <Textarea
        label="Notes"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("notes")}
      />
      <TextInput
        label="Evidence media"
        description="Id of an uploaded media file belonging to this applicant"
        disabled={isLoading}
        {...form.getInputProps("evidence_media")}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save consent
    </Button>
  );
}
