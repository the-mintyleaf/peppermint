"use client";

import { useState } from "react";
import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PhoneCallIcon } from "@phosphor-icons/react/dist/csr/PhoneCall";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useLeadAccess } from "../../../../leadAccess.hooks";
import { useDeleteLead } from "../../../../leadManagement.hooks";
import type { LeadBoardRow } from "../../../../leadManagement.types";
import { openDeleteLeadModal } from "../../leadDeletion.utils";
import { RecordFollowUpModal } from "../RecordFollowUpModal";
import type { LeadRowActionsMenuProps } from "./LeadRowActionsMenu.types";

/**
 * "Edit" delegates to the shell's own edit modal (`openEditModal`). Stage
 * moves and the lifecycle transitions (change stage, mark lost, convert,
 * reopen) live in the inline `LeadStageSwitch` in the Stage column, so this
 * menu keeps the non-stage actions: View, Edit, Record follow-up, and — for an
 * Admin, last and divided off as the one destructive lever — Delete.
 * Follow-up hides once a lead is closed (`lost`/`converted`) — there is
 * nothing left to follow up on. Delete hides on a `converted` lead (the
 * backend refuses it: an applicant's origin record); a converted-then-
 * reopened lead looks active in the list shape, so the server's 409
 * `LEADS_LEAD_ALREADY_CONVERTED` toast covers that case.
 */
export function LeadRowActionsMenu({
  lead,
  onViewDetails,
}: LeadRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<LeadBoardRow>();
  const { isLeadAdmin } = useLeadAccess();
  const deleteLead = useDeleteLead();
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const isClosed = lead.stage === "lost" || lead.stage === "converted";

  return (
    <>
      <RowActionsMenu<LeadBoardRow>
        record={lead}
        aria-label={`Actions for ${lead.full_name}`}
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
          {
            label: "Delete lead",
            icon: <TrashIcon size={16} aria-hidden />,
            color: "red",
            dividerBefore: true,
            hidden: (record) => !isLeadAdmin || record.stage === "converted",
            onClick: (record) =>
              openDeleteLeadModal(record, deleteLead.mutateAsync),
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
