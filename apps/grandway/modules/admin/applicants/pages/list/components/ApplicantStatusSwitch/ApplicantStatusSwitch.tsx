"use client";

import { StatusBadge } from "@peppermint/admin";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { InlineStageSwitch } from "@/components/InlineStageSwitch";
import type { InlineStageSwitchAction } from "@/components/InlineStageSwitch";
import { useCapabilities } from "@/config/access";
import { useChangeApplicantStatus } from "../../../../applicants.hooks";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  WORKING_STATUSES,
  applicantDisplayName,
} from "../../../../applicants.labels";
import { useApplicantLifecycleActions } from "../../../../applicants.lifecycle";
import type { ApplicantStatus } from "../../../../applicants.types";
import type { ApplicantStatusSwitchProps } from "./ApplicantStatusSwitch.types";

/**
 * Inline status switch for the applicants table and the detail header.
 *
 * - **Active ⇄ Dormant** are plain inline confirms — freely interchangeable.
 * - **Archive** (the soft delete) sits below the divider and opens its own
 *   confirm, which says nothing is erased and that only an Admin restores it.
 * - **Archived** is settled for `POST /status/` (it 409s any move out); the
 *   switch reads as terminal and offers only **Restore**, Admin-only.
 *
 * Self-gates on `applicantStatusChange` rather than taking a prop, because this
 * is the status control on **both** surfaces. A reader (a Lead Manager) gets the
 * same fact as a plain `StatusBadge`: same words, same colour, no lever — so an
 * archived file shows "Archived" and nothing that would 403.
 */
export function ApplicantStatusSwitch({
  applicant,
  fullWidth = true,
}: ApplicantStatusSwitchProps) {
  const { applicantStatusChange } = useCapabilities();
  const mutation = useChangeApplicantStatus(applicant.id);
  const lifecycle = useApplicantLifecycleActions(applicant);
  const archived = applicant.status === "archived";

  if (!applicantStatusChange) {
    return (
      <StatusBadge<ApplicantStatus>
        value={applicant.status}
        colorMap={STATUS_COLORS}
        labelMap={STATUS_LABELS}
      />
    );
  }

  const targets = archived
    ? []
    : WORKING_STATUSES.filter((status) => status !== applicant.status);

  const actions: InlineStageSwitchAction[] = [];
  if (lifecycle.canArchive) {
    actions.push({
      label: "Archive (soft delete)…",
      icon: <ArchiveIcon size={14} aria-hidden />,
      color: "red",
      onClick: lifecycle.confirmArchive,
    });
  }
  if (lifecycle.canRestore) {
    actions.push({
      label: "Restore applicant…",
      icon: <ArrowCounterClockwiseIcon size={14} aria-hidden />,
      onClick: lifecycle.confirmRestore,
    });
  }

  return (
    <InlineStageSwitch
      fullWidth={fullWidth}
      current={applicant.status}
      colorMap={STATUS_COLORS}
      labelMap={STATUS_LABELS}
      targets={targets}
      actions={actions}
      terminal={archived}
      menuLabel="Set status"
      entityLabel={applicantDisplayName(applicant)}
      onConfirm={(value) =>
        mutation.mutateAsync({ status: value as ApplicantStatus })
      }
    />
  );
}
