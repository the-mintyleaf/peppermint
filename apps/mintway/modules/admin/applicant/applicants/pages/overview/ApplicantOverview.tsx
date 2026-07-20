"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Group, Modal } from "@peppermint/ui";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";

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
  const router = useRouter();
  const { applicant, isAdmin } = useApplicant(applicantId);
  const [editOpen, setEditOpen] = useState(false);

  const editMutation = useApplicantMutation<Applicant, ApplicantFormValues>({
    mutationFn: (values) => {
      // Never default the version: `0` is not "unknown", it is a wrong version that
      // the server answers with APPLICANT_VERSION_CONFLICT. If the detail hasn't
      // loaded there is nothing safe to send, so fail before writing.
      if (!applicant) {
        throw new Error(
          "Applicant not loaded — cannot save without a version.",
        );
      }
      return updateApplicant(
        applicantId,
        toUpdatePayload(values, isAdmin, applicant.record_version),
      );
    },
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
          <Group gap="xs" wrap="nowrap">
            {isAdmin && (
              <Button
                variant="light"
                size="xs"
                leftSection={<FileTextIcon size={14} aria-hidden />}
                onClick={() => router.push(`/documents/${applicantId}`)}
              >
                Prepare documents
              </Button>
            )}
            <ApplicantActionBar
              applicant={applicant}
              onEdit={() => setEditOpen(true)}
            />
          </Group>
        ) : null
      }
    >
      {applicant && <OverviewContent applicant={applicant} isAdmin={isAdmin} />}

      <Modal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit applicant"
        size="lg"
        styles={{ body: { padding: "var(--mantine-spacing-md)" } }}
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
