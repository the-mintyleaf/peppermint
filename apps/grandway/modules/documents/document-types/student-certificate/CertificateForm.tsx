"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
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
import { useDocumentPrefill } from "../../hooks/useDocumentPrefill";
import {
  contentPathLabel,
  getContentFieldErrors,
} from "../../utils/contentFieldErrors";
import { CertificateFormTabs } from "./CertificateFormTabs";
import {
  applyServerFieldErrors,
  certificateSchema,
  resolvePhotoMediaId,
  toCertificateContent,
  toCertificateFormValues,
} from "./certificateForm.utils";
import { certificateSignatureOptions } from "./certificateSignatureOptions";
import { errorPaths, firstTabWithError } from "./certificateTabs";
import type {
  CertificateFormBodyProps,
  CertificateFormInstance,
  CertificateFormRefBridgeProps,
  CertificateFormValues,
  CertificateSubmitButtonProps,
  CertificateTab,
  CertificateUnplacedErrorsProps,
} from "./CertificateForm.types";
import type {
  CertificateContent,
  DocumentFormProps,
} from "../../documents.types";

/**
 * Every field the certificate prints is entered here (or in its Customizations
 * panel) — nothing needs filling in on the applicant's profile. A NEW
 * certificate opens seeded from the applicant file (`GET /documents/prefill/`):
 * name parts, date of birth, gender, address and photograph, all still editable.
 *
 * `FormWrapper` reads `initial` once, so a NEW form mounts only after (a) a
 * **fresh** prefill fetch for this open has settled — successfully or not; a
 * failed prefill opens the form empty — and (b) the editor's applicant summary
 * has arrived (the name fallback and photograph id come from it), or
 * `SUMMARY_WAIT_MS` has passed, whichever is first. Editing never waits.
 */
export function CertificateForm(props: DocumentFormProps) {
  const existing = props.initialContent as CertificateContent | undefined;
  const isNew = !existing;
  const seeds = isNew && Boolean(props.applicantId);
  const prefill = useDocumentPrefill(props.applicantId, { enabled: isNew });
  const summaryWaitOver = useSummaryWait(seeds && !props.studentFullData);

  const waitingForPrefill =
    seeds && !prefill.isFetchedAfterMount && !prefill.isError;
  const waitingForSummary = seeds && !props.studentFullData && !summaryWaitOver;

  if (waitingForPrefill || waitingForSummary) {
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

/** How long a new form waits for the applicant summary before opening without it. */
const SUMMARY_WAIT_MS = 4000;

/**
 * `true` once `waiting` has held for `SUMMARY_WAIT_MS` — the fallback that keeps
 * a slow or failed summary from holding the create form shut. It only ever
 * flips once, so a form that has opened never unmounts again.
 */
function useSummaryWait(waiting: boolean): boolean {
  const [over, setOver] = useState(false);
  useEffect(() => {
    if (!waiting || over) return;
    const timer = setTimeout(() => setOver(true), SUMMARY_WAIT_MS);
    return () => clearTimeout(timer);
  }, [waiting, over]);
  return over;
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
  const [tab, setTab] = useState<CertificateTab>("general");

  const registerForm = useCallback((form: CertificateFormInstance) => {
    formRef.current = form;
  }, []);

  /** Opens the first tab holding one of `paths`; stays put when none does. */
  const showFirstError = (paths: string[]) => {
    const target = firstTabWithError(paths);
    if (target) setTab(target);
  };

  // Validates before `handleSubmit` (which validates again, silently) so a
  // failed save can open the tab with the first error instead of failing
  // behind the other one.
  const validateForSave = () => {
    const form = formRef.current;
    if (!form) return true;
    const { hasErrors, errors } = form.validate();
    if (hasErrors) showFirstError(errorPaths(errors));
    return !hasErrors;
  };

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
        const applied = applyServerFieldErrors(formRef.current, fields);
        setUnplaced(applied.unplaced);
        // The unplaced list sits above the tabs, so only marked fields move it.
        showFirstError(applied.placed);
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
      <Stack gap={0} pt="md">
        {/* Above the tabs, so they show whichever tab is open. */}
        {prefillFailed || Object.keys(unplaced).length > 0 ? (
          <Stack gap="xs" px="md" pb="md">
            {prefillFailed ? (
              <Alert color="yellow" variant="light" p="xs">
                <Text size="xs">
                  Couldn&apos;t load the applicant&apos;s details, so nothing is
                  filled in. Type the fields below.
                </Text>
              </Alert>
            ) : null}
            <UnplacedErrors errors={unplaced} />
          </Stack>
        ) : null}
        <CertificateFormTabs
          tab={tab}
          onTabChange={setTab}
          applicantId={applicantId}
          studentName={studentFullData?.fullName}
          signatureOptions={certificateSignatureOptions(signatures)}
          disabled={isLoading}
        />
        <Box p="md">
          <SubmitButton
            isEdit={Boolean(existing)}
            isLoading={isLoading}
            onBeforeSubmit={validateForSave}
          />
        </Box>
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

function SubmitButton({
  isEdit,
  isLoading,
  onBeforeSubmit,
}: CertificateSubmitButtonProps) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  const submit = () => {
    if (onBeforeSubmit()) void handleSubmit();
  };
  return (
    <Button onClick={submit} loading={isLoading || submitting} fullWidth>
      {isEdit ? "Save changes" : "Create certificate"}
    </Button>
  );
}
