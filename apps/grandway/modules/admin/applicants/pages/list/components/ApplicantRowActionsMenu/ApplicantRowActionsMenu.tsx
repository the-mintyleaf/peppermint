"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import type { Applicant } from "../../../../applicants.types";
import type { ApplicantRowActionsMenuProps } from "./ApplicantRowActionsMenu.types";

/**
 * Routes, not modals — this is a `MultiPageModule` — so "View"/"Edit" push to
 * their own URLs rather than opening a drawer/modal. Status changes are the
 * inline `ApplicantStatusSwitch` in the Status column here (and the header
 * control on the detail page) — an explicit manual change either way, never a
 * form field (`docs/backend/applicants/CONCEPT.md`).
 */
export function ApplicantRowActionsMenu({
  applicant,
  onViewDetails,
}: ApplicantRowActionsMenuProps) {
  const router = useRouter();

  return (
    <RowActionsMenu<Applicant>
      record={applicant}
      aria-label={`Actions for ${applicant.full_name}`}
      actions={[
        {
          label: "View details",
          icon: <EyeIcon size={16} aria-hidden />,
          onClick: onViewDetails,
        },
        {
          label: "Edit",
          icon: <PencilSimpleIcon size={16} aria-hidden />,
          onClick: () => router.push(`/admin/applicants/${applicant.id}/edit`),
        },
      ]}
    />
  );
}
