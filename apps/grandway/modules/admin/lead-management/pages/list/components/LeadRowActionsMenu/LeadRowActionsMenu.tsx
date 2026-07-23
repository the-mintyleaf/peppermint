"use client";

import { useState } from "react";
import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { PhoneCallIcon } from "@phosphor-icons/react/dist/csr/PhoneCall";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { LeadBoardRow } from "../../../../leadManagement.types";
import { ChangeStageModal } from "../ChangeStageModal";
import { RecordFollowUpModal } from "../RecordFollowUpModal";
import { MarkLeadLostModal } from "../MarkLeadLostModal";
import { ReopenLeadModal } from "../ReopenLeadModal";
import { ConvertLeadModal } from "../ConvertLeadModal";
import type { LeadRowActionsMenuProps } from "./LeadRowActionsMenu.types";

type ActiveModal = "stage" | "follow-up" | "lost" | "reopen" | "convert" | null;

/**
 * "Edit" delegates to the shell's own edit modal (`openEditModal`) rather
 * than a bespoke dialog here — same pattern as `UserRowActionsMenu`. The 4
 * original lifecycle actions are exclusive to a lead's current state: `lost`
 * and `converted` are the two reachable terminal stages, so "Change stage"/
 * "Record follow-up"/"Mark as lost"/"Convert to applicant" hide there and
 * "Reopen" is the only path back. "Convert to applicant" is additionally
 * Admin-only — a Lead Manager gets `LEADS_ACTOR_FORBIDDEN` server-side, so
 * hide the action entirely rather than let it fail
 * (`docs/backend/lead-management/SECURITY.md` §2).
 */
export function LeadRowActionsMenu({
  lead,
  onViewDetails,
}: LeadRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<LeadBoardRow>();
  const { isAdmin, isSuperadmin } = useCurrentUser();
  // Not just `!isAdmin` — that flag is true for `superadmin` too, and convert
  // is Admin-only in the strict sense: a Lead Manager *or* Superadmin gets
  // `LEADS_ACTOR_FORBIDDEN` (`docs/backend/lead-management/FLOWS.md` "Convert
  // a lead into a client"). Currently moot since `RequireLeadAccess` already
  // keeps a Superadmin out of this whole module, but this stays correct if
  // that gate is ever relaxed.
  const canConvert = isAdmin && !isSuperadmin;
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
            label: "Convert to applicant",
            icon: <ArrowsLeftRightIcon size={16} aria-hidden />,
            hidden: () => isClosed || !canConvert,
            onClick: () => setActiveModal("convert"),
          },
          {
            label: "Reopen",
            icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
            color: "teal",
            // The only way back from either terminal stage — reopening a
            // converted lead never undoes the conversion or its applicant
            // link (`docs/backend/lead-management/FLOWS.md`).
            hidden: () => !isClosed,
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
      <ConvertLeadModal
        lead={lead}
        opened={activeModal === "convert"}
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
