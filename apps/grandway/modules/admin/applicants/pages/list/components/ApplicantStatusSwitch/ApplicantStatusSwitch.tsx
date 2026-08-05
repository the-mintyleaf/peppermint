"use client";

import { StatusBadge } from "@peppermint/admin";
import { InlineStageSwitch } from "@/components/InlineStageSwitch";
import { useCapabilities } from "@/config/access";
import { useChangeApplicantStatus } from "../../../../applicants.hooks";
import {
  APPLICANT_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  applicantDisplayName,
} from "../../../../applicants.labels";
import type { ApplicantStatus } from "../../../../applicants.types";
import type { ApplicantStatusSwitchProps } from "./ApplicantStatusSwitch.types";

/**
 * Inline status switch for the applicants table. The three statuses are freely
 * interchangeable with no remarks and no terminal state, so every transition is
 * a plain inline confirm — no modal, no `actions`. Status is still an explicit
 * manual change here, never a form-field side effect
 * (`docs/backend/applicants/CONCEPT.md`).
 *
 * Self-gates on `applicantStatusChange` rather than taking a prop, because this is
 * the status control on **both** surfaces — the list's Status column and the detail
 * page's header — and deciding here means neither can forget. A reader gets the same
 * fact as a plain `StatusBadge`: same words, same colour, no lever
 * (`DESIGN.md` — state and action must look and sit differently).
 */
export function ApplicantStatusSwitch({
  applicant,
  fullWidth = true,
}: ApplicantStatusSwitchProps) {
  const { applicantStatusChange } = useCapabilities();
  const mutation = useChangeApplicantStatus(applicant.id);
  const targets = APPLICANT_STATUSES.filter((s) => s !== applicant.status);

  if (!applicantStatusChange) {
    return (
      <StatusBadge<ApplicantStatus>
        value={applicant.status}
        colorMap={STATUS_COLORS}
        labelMap={STATUS_LABELS}
      />
    );
  }

  return (
    <InlineStageSwitch
      fullWidth={fullWidth}
      current={applicant.status}
      colorMap={STATUS_COLORS}
      labelMap={STATUS_LABELS}
      targets={targets}
      menuLabel="Set status"
      entityLabel={applicantDisplayName(applicant)}
      onConfirm={(value) =>
        mutation.mutateAsync({ status: value as ApplicantStatus })
      }
    />
  );
}
