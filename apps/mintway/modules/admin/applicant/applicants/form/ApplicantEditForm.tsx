"use client";

import { Button, Stack } from "@peppermint/ui";
import { FormWrapper, useFormControls } from "@peppermint/admin";

import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { ApplicantFields } from "./ApplicantFields";
import {
  applicantToFormValues,
  buildApplicantSchema,
} from "./applicantForm.utils";
import type {
  ApplicantEditFormProps,
  ApplicantFormValues,
} from "./ApplicantForm.types";

/**
 * Edit-applicant form. Prefilled from the record; contact-required does not apply to
 * edit (an existing record never clears both). Lifecycle/engagement/lock/`record_version`
 * are never editable here — those move through the transition/lock actions.
 */
export function ApplicantEditForm({
  initialValues,
  onSubmit,
  isLoading,
}: ApplicantEditFormProps) {
  const { isAdmin } = useCurrentUser();

  return (
    <FormWrapper<ApplicantFormValues>
      initial={applicantToFormValues(initialValues ?? {})}
      validation={[buildApplicantSchema(false)]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <ApplicantFields isAdmin={isAdmin} isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save changes
    </Button>
  );
}
