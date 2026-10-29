"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  FormShell,
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import {
  Alert,
  DateInput,
  Divider,
  Group,
  Select,
  Stack,
  TextInput,
} from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { LanguageTestsField } from "@/components/academic";
import { ApplicantPhotoField } from "../photograph";
import { AddressesSection } from "./components/AddressesSection";
import { ContactNumbersField } from "./components/ContactNumbersField";
import { EducationsField } from "./components/EducationsField";
import { EmergencyContactsField } from "./components/EmergencyContactsField";
import { FamilyMembersField } from "./components/FamilyMembersField";
import { IdentityNumbersSection } from "./components/IdentityNumbersSection";
import { PassportSection } from "./components/PassportSection";
import { STEPS, STEP_FIELDS, STEP_VALIDATION } from "./ApplicantForm.schemas";
import type {
  ApplicantFormBodyProps,
  ApplicantFormProps,
  ApplicantFormValues,
  ServerErrorBridge,
  StepDocumentsProps,
  StepEducationTestsProps,
  StepIdentityProps,
} from "./ApplicantForm.types";
import {
  applyServerErrors,
  toApplicantPayload,
  toFormValues,
} from "./ApplicantForm.utils";

export type { ApplicantFormProps } from "./ApplicantForm.types";

/**
 * `applicantId` is `null` on create, and the photo control is hidden entirely
 * there rather than shown-and-disabled: a file's owner must exist before
 * `POST /files/` accepts it, so on create there is nothing to attach to and a
 * disabled control would only advertise a step the user can't take. The photo
 * is added from the edit form once the record exists.
 */
function StepIdentity({ applicantId }: StepIdentityProps) {
  const { form } = useFormInstance<ApplicantFormValues>();
  return (
    <Stack gap="md">
      {applicantId ? (
        <ApplicantPhotoField
          applicantId={applicantId}
          name={form.values.full_name || "this applicant"}
          mode="deferred"
          value={form.values.photograph}
          onChange={(file) => form.setFieldValue("photograph", file)}
          error={form.errors.photograph as string | undefined}
        />
      ) : null}

      <TextInput
        label="Full name"
        placeholder="Ram Bahadur Shrestha"
        autoComplete="name"
        required
        {...form.getInputProps("full_name")}
      />

      <Group grow align="flex-start">
        <DateInput
          label="Date of birth"
          valueFormat="YYYY-MM-DD"
          clearable
          {...form.getInputProps("date_of_birth")}
        />
        <Select
          label="Gender"
          data={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
            { value: "undisclosed", label: "Undisclosed" },
          ]}
          clearable
          {...form.getInputProps("gender")}
          onChange={(value) => form.setFieldValue("gender", value ?? "")}
        />
      </Group>

      <Group grow align="flex-start">
        <TextInput
          label="Nationality"
          placeholder="Nepali"
          {...form.getInputProps("nationality")}
        />
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="ram@example.com"
          {...form.getInputProps("email")}
        />
      </Group>

      <ContactNumbersField />
    </Stack>
  );
}

/** Citizenship / national ID first (the WODA letters need them), then passport. */
function StepDocuments({ hadExistingPassport }: StepDocumentsProps) {
  return (
    <Stack gap="md">
      <IdentityNumbersSection />
      <PassportSection hadExistingPassport={hadExistingPassport} />
    </Stack>
  );
}

/**
 * Both academic lists replace wholesale, and re-saving a record carried over
 * from the converted lead drops its "From lead" mark — so when such records
 * are present, say so before the user edits them (the payload leaves an
 * untouched list out entirely, keeping the mark).
 */
function StepEducationTests({
  hasCarriedOverRecords,
}: StepEducationTestsProps) {
  return (
    <Stack gap="lg">
      {hasCarriedOverRecords ? (
        <Alert
          color="blue"
          variant="light"
          icon={<InfoIcon size={16} aria-hidden />}
        >
          Records marked “From lead” came over when the lead was converted.
          Changing anything in a list re-saves that whole list and those marks
          are dropped; leave a list as it is to keep them.
        </Alert>
      ) : null}
      <EducationsField />
      <Divider />
      <LanguageTestsField
        path="language_tests"
        description="IELTS, PTE, TOEFL, Duolingo — every field but the test is optional."
      />
    </Stack>
  );
}

function StepFamilyEmergency() {
  return (
    <Stack gap="md">
      <FamilyMembersField />
      <EmergencyContactsField />
    </Stack>
  );
}

/**
 * Hands the live form + step navigation to `ApplicantForm`'s submit handler,
 * which runs outside `FormWrapper`'s context, so a refused save can be laid
 * onto the fields that caused it and the user taken to that step.
 */
function useServerErrorBridge(bridgeRef: RefObject<ServerErrorBridge | null>) {
  const { form } = useFormInstance<ApplicantFormValues>();
  const { handleStepGo } = useFormControls();
  useEffect(() => {
    bridgeRef.current = {
      show: (error) => {
        const step = applyServerErrors(form, error);
        if (step !== null) handleStepGo(step);
      },
    };
  }, [bridgeRef, form, handleStepGo]);
}

function ApplicantFormBody({
  title,
  description,
  onBack,
  applicantId,
  bridgeRef,
  hadExistingPassport,
  hasCarriedOverRecords,
}: ApplicantFormBodyProps) {
  const { current, handleStepNext, handleStepBack } = useFormControls();
  useServerErrorBridge(bridgeRef);
  const stepComponents = [
    <StepIdentity key="identity" applicantId={applicantId} />,
    <AddressesSection key="addresses" />,
    <StepDocuments key="documents" hadExistingPassport={hadExistingPassport} />,
    <StepEducationTests
      key="education"
      hasCarriedOverRecords={hasCarriedOverRecords}
    />,
    <StepFamilyEmergency key="family-emergency" />,
  ];
  return (
    <FormShell
      title={title}
      description={description}
      onBack={onBack}
      steps={STEPS}
      showStepper
      showDirtyBanner
      allowStepJump="completed-only"
      onStepNext={handleStepNext}
      onStepBack={handleStepBack}
    >
      {stepComponents[current]}
    </FormShell>
  );
}

/**
 * Shared create+edit form (`POST`/`PATCH /api/v1/applicants/`,
 * `docs/backend/applicants/INTEGRATION.md` §7). Same field set both times —
 * one component serves both routes. The page (`pages/new`, `pages/edit`)
 * owns the mutation and navigation; this component assembles the payload,
 * hands it off via `onSubmit`, and — when that rejects — maps the server's
 * field errors (`APPLICANTS_EDUCATION_INVALID` / `_LANGUAGE_TEST_INVALID`
 * `details.fields`, or DRF-style `details`) onto the fields and jumps to the
 * first step holding one. The mutation's own toast is the only notification:
 * `finalSubmitFn` always resolves `{ ok: true }` so `FormWrapper` never raises
 * a duplicate.
 */
export function ApplicantForm({
  mode,
  initialValues,
  onBack,
  onSubmit,
}: ApplicantFormProps) {
  const hadExistingPassport = Boolean(initialValues?.passport);
  const bridgeRef = useRef<ServerErrorBridge | null>(null);
  // Captured once — FormWrapper reads `initial` once at mount, and the edit
  // payload compares the academic lists against this same snapshot.
  const [initial] = useState(() => toFormValues(initialValues));
  const hasCarriedOverRecords =
    initial.educations.some((e) => e.source_lead_id) ||
    initial.language_tests.some((t) => t.source_lead_id);

  return (
    <FormWrapper<ApplicantFormValues>
      initial={initial}
      validation={STEP_VALIDATION}
      stepFields={STEP_FIELDS}
      finalSubmitFn={async (values) => {
        try {
          await onSubmit(
            toApplicantPayload(values, mode === "edit" ? initial : null),
            values.photograph,
          );
        } catch (error) {
          bridgeRef.current?.show(error);
        }
        return { ok: true };
      }}
      hasDirtCheck
    >
      <ApplicantFormBody
        hadExistingPassport={hadExistingPassport}
        hasCarriedOverRecords={hasCarriedOverRecords}
        applicantId={initialValues?.id ?? null}
        bridgeRef={bridgeRef}
        title={mode === "create" ? "New applicant" : "Edit applicant"}
        description={
          mode === "create"
            ? "Only the name and one contact number are required — the rest can be completed later."
            : "Lists (contact numbers, addresses, family, emergency contacts, education, tests) are saved as a complete set."
        }
        onBack={onBack}
      />
    </FormWrapper>
  );
}
