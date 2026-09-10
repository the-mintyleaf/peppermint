"use client";

import { FormWrapper, useFormControls } from "@peppermint/admin";
import { Button, Group, Stack } from "@peppermint/ui";
import type { SignatoryFormValues } from "../../../signatures.types";
import { DirtyReporter, type ReportDirty } from "./DirtyReporter";
import { SignatoryDetailFields } from "./SignatoryDetailFields";
import { signatoryDetailSchema } from "./signatoryFormSchema";

interface SignatoryFormFieldsProps {
  initial: SignatoryFormValues;
  submitLabel: string;
  /** Guarded by the modal shell, which owns every exit path. Never confirm here as well. */
  onCancel: () => void;
  onSubmit: (values: SignatoryFormValues) => Promise<void>;
  /**
   * Reports dirtiness up to the shell. **Must be referentially stable** — it is
   * an effect dependency. The shell keeps it in a `useCallback` that only
   * writes a ref.
   */
  onDirtyChange: ReportDirty;
}

/**
 * The **edit** form: details only. The signature image is a separate endpoint
 * with a separate encoding, and on this screen it has its own panel below —
 * unlike create, where it is folded into one action.
 */
export function SignatoryFormFields({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
  onDirtyChange,
}: SignatoryFormFieldsProps) {
  return (
    <FormWrapper<SignatoryFormValues>
      initial={initial}
      validation={[signatoryDetailSchema]}
      hasDirtCheck
      finalSubmitFn={async (values) => {
        await onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="sm">
        <DirtyReporter source="details" onDirtyChange={onDirtyChange} />
        <SignatoryDetailFields />
        <SubmitRow submitLabel={submitLabel} onCancel={onCancel} />
      </Stack>
    </FormWrapper>
  );
}

function SubmitRow({
  submitLabel,
  onCancel,
}: {
  submitLabel: string;
  onCancel: () => void;
}) {
  const { handleSubmit, isLoading } = useFormControls();
  return (
    <Group justify="flex-end" gap="xs">
      {/* No discard prompt here: `onCancel` is the shell's guarded leave, which
          already confirms. Prompting in both places would ask twice. */}
      <Button
        variant="default"
        size="xs"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button size="xs" loading={isLoading} onClick={handleSubmit}>
        {submitLabel}
      </Button>
    </Group>
  );
}
