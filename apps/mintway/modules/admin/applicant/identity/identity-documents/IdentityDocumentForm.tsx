"use client";

import {
  Button,
  Group,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";

import {
  IDENTITY_DOCUMENT_TYPE_LABELS,
  VERIFICATION_STATUS_LABELS,
  toOptions,
} from "../../_shared";
import type { IdentityDocument } from "../../_shared";
import type {
  IdentityDocumentFormProps,
  IdentityDocumentFormValues,
  IdentityDocumentPayload,
} from "./IdentityDocumentForm.types";

const TYPE_OPTIONS = toOptions(IDENTITY_DOCUMENT_TYPE_LABELS);
const VERIFICATION_OPTIONS = toOptions(VERIFICATION_STATUS_LABELS);

const INITIAL: IdentityDocumentFormValues = {
  document_type: "passport",
  document_number: "",
  issuing_country: "",
  issued_at: "",
  expires_at: "",
  verification_status: "unverified",
  verification_notes: "",
};

// Client-side mirror of the backend rule `issued_at ≤ expires_at`
// (APPLICANT_IDENTITY_DATE_INVALID) for fast feedback.
const schema = z
  .object({
    document_type: z.string().min(1, "Required"),
    document_number: z.string(),
    issuing_country: z.string(),
    issued_at: z.string(),
    expires_at: z.string(),
    verification_status: z.string(),
    verification_notes: z.string(),
  })
  .refine((v) => !v.issued_at || !v.expires_at || v.issued_at <= v.expires_at, {
    message: "Issue date can't be after expiry",
    path: ["expires_at"],
  });

function toInitial(
  record?: Partial<IdentityDocument>,
): IdentityDocumentFormValues {
  if (!record) return INITIAL;
  return {
    document_type: record.document_type ?? "passport",
    document_number: record.document_number ?? "",
    issuing_country: record.issuing_country ?? "",
    issued_at: record.issued_at ? record.issued_at.slice(0, 10) : "",
    expires_at: record.expires_at ? record.expires_at.slice(0, 10) : "",
    verification_status: record.verification_status ?? "unverified",
    verification_notes: record.verification_notes ?? "",
  };
}

const TEXT_KEYS: (keyof IdentityDocumentFormValues)[] = [
  "document_number",
  "issuing_country",
  "verification_notes",
];
const DATE_KEYS: (keyof IdentityDocumentFormValues)[] = [
  "issued_at",
  "expires_at",
];

/**
 * On create, empties are dropped. On edit, blank text is sent so a cleared field
 * clears (PATCH), while empty dates are dropped (DRF rejects ""). `verification_status`
 * always carries a value from its select.
 */
function toPayload(
  values: IdentityDocumentFormValues,
  isEdit: boolean,
): IdentityDocumentPayload {
  const payload: Record<string, unknown> = {
    document_type: values.document_type,
    verification_status: values.verification_status,
  };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  for (const key of DATE_KEYS) {
    const value = values[key];
    if (typeof value === "string" && value !== "") payload[key] = value;
  }
  return payload as IdentityDocumentPayload;
}

/**
 * Create/edit an identity document (§5.2). Media scans are attached via the Evidence
 * media panel; linking a scan to a document is deferred (the modal form has no applicant
 * scope for a same-applicant media picker).
 */
export function IdentityDocumentForm({
  initialValues,
  onSubmit,
  isLoading,
}: IdentityDocumentFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<IdentityDocumentFormValues>
      initial={toInitial(initialValues)}
      validation={[schema]}
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
  const { form } = useFormInstance<IdentityDocumentFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <Select
          label="Document type"
          required
          data={TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("document_type")}
        />
        <TextInput
          label="Document number"
          disabled={isLoading}
          {...form.getInputProps("document_number")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Issuing country"
          disabled={isLoading}
          {...form.getInputProps("issuing_country")}
        />
        <Select
          label="Verification"
          data={VERIFICATION_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("verification_status")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Issued at"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("issued_at")}
        />
        <TextInput
          label="Expires at"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("expires_at")}
        />
      </Group>
      <Textarea
        label="Verification notes"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("verification_notes")}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save document
    </Button>
  );
}
