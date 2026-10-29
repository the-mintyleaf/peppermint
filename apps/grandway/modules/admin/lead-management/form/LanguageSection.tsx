"use client";

import { useFormInstance } from "@peppermint/admin";
import { Select, Stack } from "@peppermint/ui";
import {
  LEAD_CERTIFICATE_LIMIT,
  LanguageTestsField,
} from "@/components/academic";
import { FormSection } from "@/components/FormSection";
import { LANGUAGE_TEST_STATUS_OPTIONS } from "../studyInterest.labels";
import type { LeadFormValues } from "./LeadForm.types";

/**
 * English tests — where they stand, then what they already hold. The status
 * stays (a lead preparing for IELTS has no certificate yet, and the status is
 * what the funnel works on); the certificates are the results themselves, each
 * one becoming an applicant language test at conversion, field for field.
 *
 * States: empty — the field's own dashed call-to-add; at the 10-certificate cap
 * — Add disabled with the reason; server field errors — per row field
 * (`applyLeadServerErrors`). Read-only / deleted / loading — N/A (host modal).
 */
export function LanguageSection() {
  const { form } = useFormInstance<LeadFormValues>();

  return (
    <FormSection
      title="Language tests (optional)"
      description="Their test status, and any results they already hold."
    >
      <Stack gap="md">
        <Select
          label="Test status"
          placeholder="Not recorded"
          data={LANGUAGE_TEST_STATUS_OPTIONS}
          clearable
          maw={260}
          {...form.getInputProps("study_interest.language_test_status")}
          onChange={(value) =>
            form.setFieldValue(
              "study_interest.language_test_status",
              LANGUAGE_TEST_STATUS_OPTIONS.find((o) => o.value === value)
                ?.value ?? "",
            )
          }
        />

        <LanguageTestsField
          path="language_certificates"
          maxCount={LEAD_CERTIFICATE_LIMIT}
          label="Certificates"
          description={`IELTS, PTE, TOEFL, Duolingo or another test — up to ${LEAD_CERTIFICATE_LIMIT}.`}
        />
      </Stack>
    </FormSection>
  );
}
