"use client";

import { Button, Stack } from "@peppermint/ui";
import { FormWrapper, useFormControls } from "@peppermint/admin";

import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { ApplicantFields } from "./ApplicantFields";
import {
  APPLICANT_FORM_INITIAL,
  buildApplicantSchema,
} from "./applicantForm.utils";
import type {
  ApplicantCreateFormProps,
  ApplicantFormValues,
} from "./ApplicantForm.types";

/**
 * Create-applicant form. Staff must supply an email or phone (contact-required);
 * admin may bypass it (imported records) and additionally fills the protected block.
 * `finalSubmitFn` hands validated values to the shell's create mutation, which maps
 * them to the role-scoped payload. `initial` lets a caller prefill fields (e.g. the
 * Documents "create student" flow seeds the name from the search box).
 */
export function ApplicantForm({
  onSubmit,
  isLoading,
  initial,
}: ApplicantCreateFormProps) {
  const { isAdmin } = useCurrentUser();

  return (
    <FormWrapper<ApplicantFormValues>
      initial={{ ...APPLICANT_FORM_INITIAL, ...initial }}
      validation={[buildApplicantSchema(!isAdmin)]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <ApplicantFields
          mode="create"
          isAdmin={isAdmin}
          isLoading={isLoading}
        />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Create applicant
    </Button>
  );
}
