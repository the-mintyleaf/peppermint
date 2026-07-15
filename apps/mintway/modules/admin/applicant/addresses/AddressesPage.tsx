"use client";

import { useParams } from "next/navigation";
import { Stack } from "@peppermint/ui";

import { RequireAuth } from "@/components/RequireAuth";
import { ApplicantDetailShell, useApplicant } from "../_shared";
import { AddressesSection } from "./AddressesSection";
import { ProfileImagePanel } from "./profile-image";

function AddressesPageContent() {
  const { applicantId } = useParams<{ applicantId: string }>();
  const { isLocked, isArchived, isAdmin } = useApplicant(applicantId);

  // Staff can't edit a locked record; nobody edits an archived one.
  const uploadDisabled = isArchived || (isLocked && !isAdmin);

  return (
    <ApplicantDetailShell applicantId={applicantId} activeSection="addresses">
      <Stack gap="md">
        <ProfileImagePanel
          applicantId={applicantId}
          disabled={uploadDisabled}
        />
        <AddressesSection applicantId={applicantId} />
      </Stack>
    </ApplicantDetailShell>
  );
}

/** Addresses + profile photo — the staff-permitted profile surface (§3, §4). */
export function AddressesPage() {
  return (
    <RequireAuth>
      <AddressesPageContent />
    </RequireAuth>
  );
}
