"use client";

import { Button, Center, Loader, Stack, Text } from "@peppermint/ui";
import { FormWrapper, useFormControls } from "@peppermint/admin";
import { FormSection } from "@/components/FormSection";
import { useProgramDetail } from "../../institutions.hooks";
import type { ProgramFormValues } from "../../institutions.types";
import { ProgramCoreFields } from "./fields/ProgramCoreFields";
import { ProgramEntryFields } from "./fields/ProgramEntryFields";
import { ProgramMetaFields } from "./fields/ProgramMetaFields";
import { ProgramTuitionFields } from "./fields/ProgramTuitionFields";
import type { ProgramFormProps } from "./ProgramForm.types";
import { programSchema, toProgramInitial } from "./programForm.utils";

/**
 * Create + edit share one form. In edit mode the full detail (entry expectations
 * aren't in the list row) is fetched first and the form mounts only once it loads
 * — so `FormWrapper`'s `initial` is stable. `institution` is immutable on edit.
 */
export function ProgramForm({
  initialValues,
  onSubmit,
  isLoading,
}: ProgramFormProps) {
  const programId = initialValues?.id ?? null;
  const isEdit = programId !== null;
  const detail = useProgramDetail(programId);

  if (isEdit && detail.isLoading) {
    return (
      <Center h={200}>
        <Loader size="sm" />
      </Center>
    );
  }
  if (isEdit && (detail.isError || !detail.data)) {
    return (
      <Stack align="center" gap="xs" py="xl">
        <Text size="sm" c="dimmed">
          Couldn&apos;t load this program.
        </Text>
        <Button size="xs" variant="default" onClick={() => detail.refetch()}>
          Try again
        </Button>
      </Stack>
    );
  }

  return (
    <FormWrapper<ProgramFormValues>
      initial={toProgramInitial(isEdit ? detail.data : undefined)}
      validation={[programSchema]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <ProgramCoreFields disabled={isLoading} institutionLocked={isEdit} />
        <FormSection title="Tuition">
          <ProgramTuitionFields disabled={isLoading} />
        </FormSection>
        <FormSection title="Entry expectations">
          <ProgramEntryFields disabled={isLoading} />
        </FormSection>
        <FormSection title="More">
          <ProgramMetaFields disabled={isLoading} />
        </FormSection>
        <SubmitButton isLoading={isLoading} isEdit={isEdit} />
      </Stack>
    </FormWrapper>
  );
}

function SubmitButton({
  isLoading,
  isEdit,
}: {
  isLoading: boolean;
  isEdit: boolean;
}) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      {isEdit ? "Save program" : "Create program"}
    </Button>
  );
}
