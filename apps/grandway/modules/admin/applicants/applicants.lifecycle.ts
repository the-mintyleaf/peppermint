"use client";

import { openReasonConfirmModal } from "@peppermint/admin";
import { useApplicantAuthority } from "./applicants.access";
import {
  useChangeApplicantStatus,
  useRestoreApplicant,
} from "./applicants.hooks";
import { applicantDisplayName } from "./applicants.labels";
import type { Applicant } from "./applicants.types";

export interface ApplicantLifecycleActions {
  /** Archive ("soft delete") is offered — Admin, applicant not archived. */
  canArchive: boolean;
  /** Restore is offered — Admin, applicant archived. */
  canRestore: boolean;
  /** Opens the archive confirm; resolves the mutation on confirm. */
  confirmArchive: () => void;
  /** Opens the restore confirm (optional reason). */
  confirmRestore: () => void;
}

/**
 * Archive and Restore, the applicant's soft delete and its undo, as ONE pair of
 * confirm flows shared by the status switch, the row menu, and the detail
 * page's archived banner — so all three say the same thing.
 *
 * Archive is a plain `POST /status/` with `archived`, but it is not offered as
 * a bare status pick: it freezes notes and assignment and hides the file from
 * active work, so it gets a confirm that says so — and says it is reversible.
 * Restore is Admin-only (`POST /restore/`) and returns the status held before.
 * Neither is offered to a Lead Manager, who can do neither in this app.
 */
export function useApplicantLifecycleActions(
  applicant: Applicant,
): ApplicantLifecycleActions {
  const authority = useApplicantAuthority();
  const statusMutation = useChangeApplicantStatus(applicant.id);
  const restoreMutation = useRestoreApplicant(applicant.id);
  const name = applicantDisplayName(applicant);
  const archived = applicant.status === "archived";

  const confirmArchive = () =>
    openReasonConfirmModal({
      title: "Archive applicant",
      parentLabel: name,
      hideReason: true,
      tone: "warning",
      alertTitle: `Archive ${name}? This is a soft delete.`,
      description:
        "Nothing is erased — journeys, files, notes and history stay as they are. While archived, notes are read-only and the file can't be assigned. Only an Admin can restore it.",
      confirmLabel: "Archive applicant",
      confirmColor: "red",
      onConfirm: async () => {
        await statusMutation.mutateAsync({ status: "archived" });
      },
    });

  const confirmRestore = () =>
    openReasonConfirmModal({
      title: "Restore applicant",
      parentLabel: name,
      tone: "info",
      alertTitle: `Bring ${name} back?`,
      description:
        "The applicant returns to the status they held before archiving (Active or Dormant). Notes and assignment reopen.",
      reasonLabel: "Reason (optional)",
      reasonPlaceholder: "Returned to continue their application",
      reasonRequired: false,
      confirmLabel: "Restore applicant",
      onConfirm: async (reason) => {
        // Over-long reasons are refused by the server (400) rather than cut
        // here — the modal stays open with the text intact to shorten.
        await restoreMutation.mutateAsync(reason ? { reason } : {});
      },
    });

  return {
    canArchive: authority.archive && !archived,
    canRestore: authority.restore && archived,
    confirmArchive,
    confirmRestore,
  };
}
