"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Modal } from "@peppermint/ui";

import { RequireAuth } from "@/components/RequireAuth";
import {
  ApplicantDetailShell,
  applicantKeys,
  updateApplicant,
  useApplicant,
  useApplicantMutation,
} from "../../../_shared";
import type { Applicant } from "../../../_shared";
import { ApplicantActionBar } from "../../components/ApplicantActions";
import { ApplicantEditForm, toUpdatePayload } from "../../form";
import type { ApplicantFormValues } from "../../form";
import { OverviewContent } from "./components/OverviewContent";

function ApplicantOverviewContent() {
  const { applicantId } = useParams<{ applicantId: string }>();
  const { applicant, isAdmin } = useApplicant(applicantId);
  const [editOpen, setEditOpen] = useState(false);

  const editMutation = useApplicantMutation<Applicant, ApplicantFormValues>({
    mutationFn: (values) =>
      updateApplicant(
        applicantId,
        toUpdatePayload(values, isAdmin, applicant?.record_version ?? 0),
      ),
    successTitle: "Applicant updated",
    successMessage: "Your changes were saved.",
    errorTitle: "Couldn't save changes",
    invalidateKeys: [applicantKeys.lists(), applicantKeys.detail(applicantId)],
    onSuccess: () => setEditOpen(false),
  });

  return (
    <ApplicantDetailShell
      applicantId={applicantId}
      activeSection="overview"
      headerActions={
        applicant ? (
          <ApplicantActionBar
            applicant={applicant}
            onEdit={() => setEditOpen(true)}
          />
        ) : null
      }
    >
      {applicant && <OverviewContent applicant={applicant} isAdmin={isAdmin} />}

      <Modal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit applicant"
        size="lg"
      >
        {applicant && (
          <ApplicantEditForm
            initialValues={applicant}
            onSubmit={(values) => editMutation.mutate(values)}
            isLoading={editMutation.isPending}
          />
        )}
      </Modal>
    </ApplicantDetailShell>
  );
}

/** Applicant detail overview — staff-reachable (basic projection); admin sees more. */
export function ApplicantOverview() {
  return (
    <RequireAuth>
      <ApplicantOverviewContent />
    </RequireAuth>
  );
}
