"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@peppermint/admin";
import type { RowAction } from "@peppermint/admin";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { useCapabilities } from "@/config/access";
import { applicantDisplayName } from "../../../../applicants.labels";
import { useApplicantLifecycleActions } from "../../../../applicants.lifecycle";
import type { Applicant } from "../../../../applicants.types";
import type { ApplicantRowActionsMenuProps } from "./ApplicantRowActionsMenu.types";

/**
 * Routes, not modals — this is a `MultiPageModule` — so "View"/"Edit" push to
 * their own URLs rather than opening a drawer/modal. Plain status moves are the
 * inline `ApplicantStatusSwitch` in the Status column (and the detail header).
 *
 * **Archive / Restore** — the applicant's soft delete and its undo — are also
 * here, below a divider, because "where do I delete this?" is asked of the row
 * menu first. They open the same confirms the switch does. Both are Admin-only
 * and dropped (not disabled) for a Lead Manager, who could only be refused.
 */
export function ApplicantRowActionsMenu({
  applicant,
  onViewDetails,
}: ApplicantRowActionsMenuProps) {
  const router = useRouter();
  const { applicantEdit } = useCapabilities();
  const lifecycle = useApplicantLifecycleActions(applicant);

  const actions: RowAction<Applicant>[] = [
    {
      label: "View details",
      icon: <EyeIcon size={16} aria-hidden />,
      onClick: onViewDetails,
    },
  ];
  // Dropped rather than disabled for a reader — the edit route itself is
  // gated, so offering it would only lead to a forbidden panel.
  if (applicantEdit) {
    actions.push({
      label: "Edit",
      icon: <PencilSimpleIcon size={16} aria-hidden />,
      onClick: () => router.push(`/admin/applicants/${applicant.id}/edit`),
    });
  }
  if (lifecycle.canRestore) {
    actions.push({
      label: "Restore applicant…",
      icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
      onClick: lifecycle.confirmRestore,
      dividerBefore: true,
    });
  }
  if (lifecycle.canArchive) {
    actions.push({
      label: "Archive (soft delete)…",
      icon: <ArchiveIcon size={16} aria-hidden />,
      color: "red",
      onClick: lifecycle.confirmArchive,
      dividerBefore: true,
    });
  }

  return (
    <RowActionsMenu<Applicant>
      record={applicant}
      aria-label={`Actions for ${applicantDisplayName(applicant)}`}
      actions={actions}
    />
  );
}
