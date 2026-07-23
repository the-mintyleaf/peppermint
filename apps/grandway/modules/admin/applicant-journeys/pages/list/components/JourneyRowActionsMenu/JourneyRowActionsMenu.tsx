"use client";

import { useState } from "react";
import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import type { ApplicantJourney } from "../../../../applicantJourneys.types";
import { ChangeJourneyStageModal } from "../ChangeJourneyStageModal";
import { DeferJourneyModal } from "../DeferJourneyModal";
import { CloseJourneyModal } from "../CloseJourneyModal";
import { ReopenJourneyModal } from "../ReopenJourneyModal";
import type { JourneyRowActionsMenuProps } from "./JourneyRowActionsMenu.types";

type ActiveModal = "stage" | "defer" | "close" | "reopen" | null;

const TERMINAL_STAGES = new Set(["completed", "closed", "deferred"]);

/**
 * "Edit" delegates to the shell's own edit modal (`openEditModal`) — same
 * pattern as `LeadRowActionsMenu`. "View" navigates to the real Journey
 * Detail route (`MultiPageModule`, not a drawer). The 3 forward-moving
 * lifecycle actions hide once a journey reaches any terminal/deferred state
 * (`JOURNEYS_STAGE_NOT_EDITABLE`) — Reopen is then the only path back, one
 * action serving all three terminal states (`CONCEPT.md` "Reopening").
 */
export function JourneyRowActionsMenu({
  journey,
  onViewDetails,
}: JourneyRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<ApplicantJourney>();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const isTerminal = TERMINAL_STAGES.has(journey.stage);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <RowActionsMenu<ApplicantJourney>
        record={journey}
        aria-label={`Actions for ${journey.applicant.full_name_en || journey.applicant.full_name_np}`}
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
          {
            label: "Change stage",
            icon: <ArrowsClockwiseIcon size={16} aria-hidden />,
            dividerBefore: true,
            hidden: () => isTerminal,
            onClick: () => setActiveModal("stage"),
          },
          {
            label: "Defer",
            icon: <PauseCircleIcon size={16} aria-hidden />,
            color: "orange",
            hidden: () => isTerminal,
            onClick: () => setActiveModal("defer"),
          },
          {
            label: "Close",
            icon: <ProhibitIcon size={16} aria-hidden />,
            color: "red",
            hidden: () => isTerminal,
            onClick: () => setActiveModal("close"),
          },
          {
            label: "Reopen",
            icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
            color: "teal",
            dividerBefore: true,
            hidden: () => !isTerminal,
            onClick: () => setActiveModal("reopen"),
          },
        ]}
      />

      <ChangeJourneyStageModal
        journey={journey}
        opened={activeModal === "stage"}
        onClose={closeModal}
      />
      <DeferJourneyModal
        journey={journey}
        opened={activeModal === "defer"}
        onClose={closeModal}
      />
      <CloseJourneyModal
        journey={journey}
        opened={activeModal === "close"}
        onClose={closeModal}
      />
      <ReopenJourneyModal
        journey={journey}
        opened={activeModal === "reopen"}
        onClose={closeModal}
      />
    </>
  );
}
