"use client";

import { useState } from "react";
import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PhoneCallIcon } from "@phosphor-icons/react/dist/csr/PhoneCall";
import type { LeadBoardRow } from "../../../../leadManagement.types";
import { RecordFollowUpModal } from "../RecordFollowUpModal";
import type { LeadRowActionsMenuProps } from "./LeadRowActionsMenu.types";

/**
 * "Edit" delegates to the shell's own edit modal (`openEditModal`). Stage
 * moves and the lifecycle transitions (change stage, mark lost, convert,
 * reopen) now live in the inline `LeadStageSwitch` in the Stage column, so this
 * menu keeps only the non-stage actions: View, Edit, and Record follow-up.
 * Follow-up hides once a lead is closed (`lost`/`converted`) — there is nothing
 * left to follow up on.
 */
export function LeadRowActionsMenu({
  lead,
  onViewDetails,
}: LeadRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<LeadBoardRow>();
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const isClosed = lead.stage === "lost" || lead.stage === "converted";

  return (
    <>
      <RowActionsMenu<LeadBoardRow>
        record={lead}
        aria-label={`Actions for ${lead.full_name || lead.full_name_en || lead.full_name_np}`}
        actions={[
          {
            label: "View details",
            icon: <EyeIcon size={16} aria-hidden />,
            onClick: onViewDetails,
          },
          {
            label: "Edit",
            icon: <PencilSimpleIcon size={16} aria-hidden />,
            onClick: (record) => openEditModal(record),
          },
          {
            label: "Record follow-up",
            icon: <PhoneCallIcon size={16} aria-hidden />,
            dividerBefore: true,
            hidden: () => isClosed,
            onClick: () => setFollowUpOpen(true),
          },
        ]}
      />

      <RecordFollowUpModal
        lead={lead}
        opened={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
      />
    </>
  );
}
