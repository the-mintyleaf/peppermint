"use client";

import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import type { ApplicantJourney } from "../../../../applicantJourneys.types";
import type { JourneyRowActionsMenuProps } from "./JourneyRowActionsMenu.types";

/**
 * "Edit" delegates to the shell's own edit modal (`openEditModal`). "View"
 * navigates to the Journey Detail route (`MultiPageModule`, not a drawer). The
 * stage lifecycle (change stage, defer, close, reopen) now lives in the inline
 * `JourneyStageSwitch` in the Stage column, so this menu keeps only View and
 * Edit.
 */
export function JourneyRowActionsMenu({
  journey,
  onViewDetails,
}: JourneyRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<ApplicantJourney>();

  return (
    <RowActionsMenu<ApplicantJourney>
      record={journey}
      aria-label={`Actions for ${journey.applicant.full_name}`}
      actions={[
        {
          label: "View",
          icon: <EyeIcon size={16} aria-hidden />,
          onClick: onViewDetails,
        },
        {
          label: "Edit",
          icon: <PencilSimpleIcon size={16} aria-hidden />,
          onClick: (record) => openEditModal(record),
        },
      ]}
    />
  );
}
