"use client";

import { Badge, Stack, Tabs, VisuallyHidden } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { CalendarCheckIcon } from "@phosphor-icons/react/dist/csr/CalendarCheck";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { DocumentPhotoField } from "../../components/DocumentPhotoField";
import { CertificateAttendanceField } from "./CertificateAttendanceField";
import {
  CertificateCourseSection,
  CertificateDatesSection,
  CertificateGradesSection,
  CertificateSignatorySection,
  CertificateStudentSection,
} from "./CertificateFormSections";
import { countErrorsByTab } from "./certificateTabs";
import type {
  CertificateFormTabsProps,
  CertificateFormValues,
  CertificateTab,
  CertificateTabErrorBadgeProps,
} from "./CertificateForm.types";

const PHOTO_CAPTION =
  "This is the applicant's photograph — changing it here updates their profile too. The certificate prints the one that is current when you save.";

/**
 * The certificate's fields on two tabs. Both panels stay mounted
 * (`keepMounted`), so switching never drops local state (the photo upload, the
 * attendance range picks); every value lives in the one `FormWrapper` anyway.
 * A tab with errors carries their count, so a problem behind the other tab is
 * never invisible.
 */
export function CertificateFormTabs({
  tab,
  onTabChange,
  applicantId,
  studentName,
  signatureOptions,
  disabled,
}: CertificateFormTabsProps) {
  const { form } = useFormInstance<CertificateFormValues>();
  const counts = countErrorsByTab(form.errors);

  return (
    <Tabs
      value={tab}
      onChange={(value) => onTabChange((value as CertificateTab) ?? "general")}
      keepMounted
    >
      <Tabs.List px="md">
        <Tabs.Tab
          value="general"
          fz="xs"
          fw={700}
          leftSection={<IdentificationCardIcon size={16} aria-hidden />}
          rightSection={<TabErrorBadge count={counts.general} />}
        >
          General details
        </Tabs.Tab>
        <Tabs.Tab
          value="attendance"
          fz="xs"
          fw={700}
          leftSection={<CalendarCheckIcon size={16} aria-hidden />}
          rightSection={<TabErrorBadge count={counts.attendance} />}
        >
          Attendance &amp; grades
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="general" px="md" pt="md">
        <Stack gap="lg">
          <DocumentPhotoField
            applicantId={applicantId}
            name={studentName}
            caption={PHOTO_CAPTION}
          />
          <CertificateStudentSection disabled={disabled} />
          <CertificateCourseSection disabled={disabled} />
          <CertificateDatesSection disabled={disabled} />
          <CertificateSignatorySection
            disabled={disabled}
            signatureOptions={signatureOptions}
          />
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="attendance" px="md" pt="md">
        <Stack gap="lg">
          <CertificateAttendanceField disabled={disabled} />
          <CertificateGradesSection disabled={disabled} />
        </Stack>
      </Tabs.Panel>
    </Tabs>
  );
}

/** The number of fields to fix on a tab — in words for screen readers, not color alone. */
function TabErrorBadge({ count }: CertificateTabErrorBadgeProps) {
  if (count === 0) return null;
  return (
    <>
      <Badge size="xs" color="red" variant="filled" circle aria-hidden>
        {count}
      </Badge>
      <VisuallyHidden>
        {count === 1 ? "1 field to fix" : `${count} fields to fix`}
      </VisuallyHidden>
    </>
  );
}
