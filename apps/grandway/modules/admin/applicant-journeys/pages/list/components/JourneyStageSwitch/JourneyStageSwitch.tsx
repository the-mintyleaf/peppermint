"use client";

import { useState } from "react";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import {
  InlineStageSwitch,
  type InlineStageSwitchAction,
} from "@/components/InlineStageSwitch";
import { useChangeJourneyStage } from "../../../../applicantJourneys.hooks";
import {
  STAGE_COLORS,
  STAGE_LABELS,
} from "../../../../applicantJourneys.labels";
import {
  SELECTABLE_STAGES,
  type SelectableJourneyStage,
} from "../../../../applicantJourneys.types";
import { CloseJourneyModal } from "../CloseJourneyModal";
import { DeferJourneyModal } from "../DeferJourneyModal";
import { ReopenJourneyModal } from "../ReopenJourneyModal";
import type { JourneyStageSwitchProps } from "./JourneyStageSwitch.types";

type ActiveModal = "defer" | "close" | "reopen" | null;

const TERMINAL_STAGES = new Set(["completed", "closed", "deferred"]);

/**
 * Inline stage switch for the journeys worklist. Plain moves between the 6
 * `SELECTABLE_STAGES` inline-confirm and mutate in place; the remark-required
 * transitions open their existing structured modals from the same control:
 * Defer (target intake) and Close (outcome). A terminal journey
 * (`completed`/`closed`/`deferred`, `JOURNEYS_STAGE_NOT_EDITABLE`) offers no
 * plain targets, only Reopen — the single path back for all three
 * (`CONCEPT.md` "Reopening").
 */
export function JourneyStageSwitch({ journey }: JourneyStageSwitchProps) {
  const mutation = useChangeJourneyStage(journey.id);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const isTerminal = TERMINAL_STAGES.has(journey.stage);
  const closeModal = () => setActiveModal(null);

  const targets = isTerminal
    ? []
    : SELECTABLE_STAGES.filter((s) => s !== journey.stage);

  const actions: InlineStageSwitchAction[] = isTerminal
    ? [
        {
          label: "Reopen",
          color: "teal",
          icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
          onClick: () => setActiveModal("reopen"),
        },
      ]
    : [
        {
          label: "Defer",
          color: "orange",
          icon: <PauseCircleIcon size={16} aria-hidden />,
          onClick: () => setActiveModal("defer"),
        },
        {
          label: "Close",
          color: "red",
          icon: <ProhibitIcon size={16} aria-hidden />,
          onClick: () => setActiveModal("close"),
        },
      ];

  return (
    <>
      <InlineStageSwitch
        current={journey.stage}
        colorMap={STAGE_COLORS}
        labelMap={STAGE_LABELS}
        targets={targets}
        menuLabel="Move to stage"
        entityLabel={journey.applicant.full_name}
        terminal={isTerminal}
        actions={actions}
        onConfirm={(value) =>
          mutation.mutateAsync({ stage: value as SelectableJourneyStage })
        }
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
