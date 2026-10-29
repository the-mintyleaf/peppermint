"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Center,
  List,
  Loader,
  Stack,
  Text,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { DocumentPhotoField } from "../../components/DocumentPhotoField";
import { useDocumentPrefill } from "../../hooks/useDocumentPrefill";
import {
  contentPathLabel,
  getContentFieldErrors,
} from "../../utils/contentFieldErrors";
import { CertificateAttendanceField } from "./CertificateAttendanceField";
import {
  CertificateCourseSection,
  CertificateDatesSection,
  CertificateGradesSection,
  CertificateSignatorySection,
  CertificateStudentSection,
} from "./CertificateFormSections";
import {
  applyServerFieldErrors,
  certificateSchema,
  resolvePhotoMediaId,
  toCertificateContent,
  toCertificateFormValues,
} from "./certificateForm.utils";
import { certificateSignatureOptions } from "./certificateSignatureOptions";
import type {
  CertificateFormBodyProps,
  CertificateFormInstance,
  CertificateFormRefBridgeProps,
  CertificateFormValues,
  CertificateSubmitButtonProps,
  CertificateUnplacedErrorsProps,
} from "./CertificateForm.types";
import type {
  CertificateContent,
  DocumentFormProps,
} from "../../documents.types";

const PHOTO_CAPTION =
  "This is the applicant's photograph — changing it here updates their profile too. The certificate prints the one that is current when you save.";

/**
 * Every field the certificate prints is entered here (or in its Customizations
 * panel) — nothing needs filling in on the applicant's profile. A NEW
 * certificate opens seeded from the applicant file (`GET /documents/prefill/`):
 * name parts, date of birth, gender, address and photograph, all still editable.
 *
 * `FormWrapper` reads `initial` once, so the form mounts only after the prefill
 * settles — successfully or not; a failed prefill opens the form empty.
 */
export function CertificateForm(props: DocumentFormProps) {
  const existing = props.initialContent as CertificateContent | undefined;
  const isNew = !existing;
  const prefill = useDocumentPrefill(props.applicantId, { enabled: isNew });

  if (isNew && prefill.isLoading) {
    return (
      <Center p="xl">
        <Loader size="sm" aria-label="Loading the applicant's details" />
      </Center>
    );
  }

  return (
    <CertificateFormBody
      {...props}
      existing={existing}
      prefill={isNew ? (prefill.data ?? null) : null}
      prefillFailed={isNew && prefill.isError}
    />
  );
}

function CertificateFormBody({
  applicantId,
  studentFullData,
  signatures = [],
  onSubmit,
  isLoading,
  existing,
  prefill,
  prefillFailed,
}: CertificateFormBodyProps) {
  const formRef = useRef<CertificateFormInstance | null>(null);
  const [initial] = useState(() =>
    toCertificateFormValues(existing, studentFullData, prefill),
  );
  const [unplaced, setUnplaced] = useState<Record<string, string>>({});

  const registerForm = useCallback((form: CertificateFormInstance) => {
    formRef.current = form;
  }, []);

  const handleFinalSubmit = async (values: CertificateFormValues) => {
    setUnplaced({});
    const content = toCertificateContent(
      values,
      existing,
      resolvePhotoMediaId(values.photo_media_id, studentFullData),
    );
    try {
      await onSubmit(content);
    } catch (error) {
      // The backend validates this body: put each refused key back on its
      // field, and list the ones no input owns (the photograph) above the form.
      const fields = getContentFieldErrors(error);
      if (fields && formRef.current) {
        setUnplaced(applyServerFieldErrors(formRef.current, fields));
      }
    }
    // `ok: true` even on a refusal: the editor has already toasted it, and
    // `ok: false` would make FormWrapper add a second, generic toast. The modal
    // stays open either way — it closes only when the save succeeds.
    return { ok: true };
  };

  return (
    <FormWrapper<CertificateFormValues>
      initial={initial}
      validation={[certificateSchema]}
      finalSubmitFn={handleFinalSubmit}
    >
      <FormRefBridge onForm={registerForm} />
      <Stack gap="lg" p="md">
        {prefillFailed ? (
          <Alert color="yellow" variant="light" p="xs">
            <Text size="xs">
              Couldn&apos;t load the applicant&apos;s details, so nothing is
              filled in. Type the fields below.
            </Text>
          </Alert>
        ) : null}
        <UnplacedErrors errors={unplaced} />
        <DocumentPhotoField
          applicantId={applicantId}
          name={studentFullData?.fullName}
          caption={PHOTO_CAPTION}
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

/** Hands the form instance up, so a refusal that arrives after submit can mark it. */
function FormRefBridge({ onForm }: CertificateFormRefBridgeProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  useEffect(() => onForm(form), [form, onForm]);
  return null;
}

function UnplacedErrors({ errors }: CertificateUnplacedErrorsProps) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;
  return (
    <Alert color="red" variant="light" p="xs" title="Not saved">
      <List size="xs" spacing={2}>
        {entries.map(([path, message]) => (
          <List.Item key={path}>
            {contentPathLabel(path)}: {message}
          </List.Item>
        ))}
      </List>
    </Alert>
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
