"use client";

import { useState } from "react";
import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { PhoneCallIcon } from "@phosphor-icons/react/dist/csr/PhoneCall";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import type { LeadBoardRow } from "../../../../leadManagement.types";
import { ChangeStageModal } from "../ChangeStageModal";
import { RecordFollowUpModal } from "../RecordFollowUpModal";
import { MarkLeadLostModal } from "../MarkLeadLostModal";
import { ReopenLeadModal } from "../ReopenLeadModal";
import type { LeadRowActionsMenuProps } from "./LeadRowActionsMenu.types";

type ActiveModal = "stage" | "follow-up" | "lost" | "reopen" | null;

/**
 * "Edit" delegates to the shell's own edit modal (`openEditModal`) rather
 * than a bespoke dialog here — same pattern as `UserRowActionsMenu`. The 4
 * lifecycle actions are exclusive to a lead's current state: `lost` is the
 * only reachable terminal stage today, so "Change stage"/"Record follow-up"/
 * "Mark as lost" hide there and "Reopen" is the only path back.
 */
export function LeadRowActionsMenu({
  lead,
  onViewDetails,
}: LeadRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<LeadBoardRow>();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const isClosed = lead.stage === "lost" || lead.stage === "converted";

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <RowActionsMenu<LeadBoardRow>
        record={lead}
        aria-label={`Actions for ${lead.full_name_en || lead.full_name_np}`}
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
            label: "Change stage",
            icon: <ArrowsClockwiseIcon size={16} aria-hidden />,
            dividerBefore: true,
            hidden: () => isClosed,
            onClick: () => setActiveModal("stage"),
          },
          {
            label: "Record follow-up",
            icon: <PhoneCallIcon size={16} aria-hidden />,
            hidden: () => isClosed,
            onClick: () => setActiveModal("follow-up"),
          },
          {
            label: "Mark as lost",
            icon: <ProhibitIcon size={16} aria-hidden />,
            color: "red",
            dividerBefore: true,
            hidden: () => isClosed,
            onClick: () => setActiveModal("lost"),
          },
          {
            label: "Reopen",
            icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
            color: "teal",
            hidden: () => lead.stage !== "lost",
            onClick: () => setActiveModal("reopen"),
          },
        ]}
      />

      <ChangeStageModal
        lead={lead}
        opened={activeModal === "stage"}
        onClose={closeModal}
      />
      <RecordFollowUpModal
        lead={lead}
        opened={activeModal === "follow-up"}
        onClose={closeModal}
      />
      <MarkLeadLostModal
        lead={lead}
        opened={activeModal === "lost"}
        onClose={closeModal}
      />
      <ReopenLeadModal
        lead={lead}
        opened={activeModal === "reopen"}
        onClose={closeModal}
      />
    </>
  );
}
