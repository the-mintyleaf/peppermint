"use client";

import { Stack, Text } from "@peppermint/ui";
import { ApplicantPhotoField } from "@/modules/admin/applicants";
import type { DocumentPhotoFieldProps } from "./DocumentPhotoField.types";

/**
 * The portrait control shared by the CV and certificate forms.
 *
 * It edits the **applicant's** photograph, not this document's copy — there is
 * one photo per person, and changing it here changes it on the profile and on
 * every other document that prints one. That is stated in the caption rather
 * than left to be discovered: an operator fixing a crooked photo on a CV should
 * know before they pick the file, not after it appears on a certificate.
 *
 * Uploads immediately rather than on the form's submit. These forms save
 * *document content*, and the photo is not document content — deferring it
 * would tie a file upload to a Save button that otherwise writes nothing but
 * this document's own fields.
 */
export function DocumentPhotoField({
  applicantId,
  name,
}: DocumentPhotoFieldProps) {
  if (!applicantId) {
    return (
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          Photograph
        </Text>
        <Text size="xs" c="dimmed">
          This document isn&apos;t attached to an applicant, so there is no
          photograph to draw on. Add one with the Photo URL field, if the
          template has one.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap={4}>
      <ApplicantPhotoField
        applicantId={applicantId}
        name={name || "this applicant"}
        mode="immediate"
      />
      <Text size="xs" c="dimmed">
        This is the applicant&apos;s photograph — changing it here updates their
        profile and every other document that shows it.
      </Text>
    </Stack>
  );
}
