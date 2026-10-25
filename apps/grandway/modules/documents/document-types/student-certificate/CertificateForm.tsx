"use client";

import { Button, Stack } from "@peppermint/ui";
import { FormWrapper, useFormControls } from "@peppermint/admin";
import { DocumentPhotoField } from "../../components/DocumentPhotoField";
import { CertificateAttendanceField } from "./CertificateAttendanceField";
import {
  CertificateCourseSection,
  CertificateDatesSection,
  CertificateGradesSection,
  CertificateSignatorySection,
  CertificateStudentSection,
} from "./CertificateFormSections";
import {
  certificateSchema,
  toCertificateContent,
  toCertificateFormValues,
} from "./certificateForm.utils";
import { certificateSignatureOptions } from "./certificateSignatureOptions";
import type {
  CertificateFormValues,
  CertificateSubmitButtonProps,
} from "./CertificateForm.types";
import type {
  DocumentFormProps,
  CertificateContent,
} from "../../documents.types";

/**
 * Every field the certificate prints. The old form saved a single
 * `studentName` the template never read, so certificates printed without a
 * name; a certificate saved that way opens here with the name split into parts.
 */
export function CertificateForm({
  applicantId,
  studentFullData,
  initialContent,
  signatures = [],
  onSubmit,
  isLoading,
}: DocumentFormProps) {
  const existing = initialContent as CertificateContent | undefined;

  return (
    <FormWrapper<CertificateFormValues>
      initial={toCertificateFormValues(existing, studentFullData)}
      validation={[certificateSchema]}
      finalSubmitFn={async (values) => {
        onSubmit(toCertificateContent(values, existing));
        return { ok: true };
      }}
    >
      <Stack gap="lg" p="md">
        <DocumentPhotoField
          applicantId={applicantId}
          name={studentFullData?.fullName}
        />
        <CertificateStudentSection disabled={isLoading} />
        <CertificateCourseSection disabled={isLoading} />
        <CertificateDatesSection disabled={isLoading} />
        <CertificateAttendanceField disabled={isLoading} />
        <CertificateGradesSection disabled={isLoading} />
        <CertificateSignatorySection
          disabled={isLoading}
          signatureOptions={certificateSignatureOptions(signatures)}
        />
        <SubmitButton isEdit={Boolean(existing)} isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function SubmitButton({ isEdit, isLoading }: CertificateSubmitButtonProps) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      {isEdit ? "Save changes" : "Create certificate"}
    </Button>
  );
}
