"use client";

import { InlineStageSwitch } from "@/components/InlineStageSwitch";
import { useChangeApplicantStatus } from "../../../../applicants.hooks";
import {
  APPLICANT_STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
} from "../../../../applicants.labels";
import type { ApplicantStatus } from "../../../../applicants.types";
import type { ApplicantStatusSwitchProps } from "./ApplicantStatusSwitch.types";

/**
 * Inline status switch for the applicants table. The three statuses are freely
 * interchangeable with no remarks and no terminal state, so every transition is
 * a plain inline confirm — no modal, no `actions`. Status is still an explicit
 * manual change here, never a form-field side effect
 * (`docs/backend/applicants/CONCEPT.md`).
 */
export function ApplicantStatusSwitch({
  applicant,
}: ApplicantStatusSwitchProps) {
  const mutation = useChangeApplicantStatus(applicant.id);
  const targets = APPLICANT_STATUSES.filter((s) => s !== applicant.status);

  return (
    <InlineStageSwitch
      current={applicant.status}
      colorMap={STATUS_COLORS}
      labelMap={STATUS_LABELS}
      targets={targets}
      menuLabel="Set status"
      entityLabel={
        applicant.full_name ||
        applicant.full_name_en ||
        applicant.full_name_np ||
        applicant.full_name_romanized
      }
      onConfirm={(value) =>
        mutation.mutateAsync({ status: value as ApplicantStatus })
      }
    />
  );
}
