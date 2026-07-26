"use client";

import { useState } from "react";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import {
  InlineStageSwitch,
  type InlineStageSwitchAction,
} from "@/components/InlineStageSwitch";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { STAGE_COLORS, STAGE_LABELS } from "../../../../leadCategory.utils";
import { useChangeLeadStage } from "../../../../leadManagement.hooks";
import {
  SELECTABLE_STAGES,
  type SelectableLeadStage,
} from "../../../../leadManagement.types";
import { ConvertLeadModal } from "../ConvertLeadModal";
import { MarkLeadLostModal } from "../MarkLeadLostModal";
import { ReopenLeadModal } from "../ReopenLeadModal";
import type { LeadStageSwitchProps } from "./LeadStageSwitch.types";

type ActiveModal = "lost" | "convert" | "reopen" | null;

/**
 * Inline stage switch for the leads board. Plain moves between the 6
 * `SELECTABLE_STAGES` inline-confirm and mutate in place; the remark-required
 * transitions open their existing structured modals from the same control:
 * Mark as lost (loss reason), Convert to applicant (Admin-only —
 * `LEADS_ACTOR_FORBIDDEN` otherwise, `docs/backend/lead-management/SECURITY.md`
 * §2). A `lost`/`converted` lead is terminal: no plain targets, only Reopen —
 * the one path back, which never undoes a conversion (`FLOWS.md`).
 */
export function LeadStageSwitch({ lead }: LeadStageSwitchProps) {
  const { isAdmin, isSuperadmin } = useCurrentUser();
  const canConvert = isAdmin && !isSuperadmin;
  const mutation = useChangeLeadStage(lead.id);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const isClosed = lead.stage === "lost" || lead.stage === "converted";
  const closeModal = () => setActiveModal(null);

  const targets = isClosed
    ? []
    : SELECTABLE_STAGES.filter((s) => s !== lead.stage);

  const actions: InlineStageSwitchAction[] = isClosed
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
          label: "Mark as lost",
          color: "red",
          icon: <ProhibitIcon size={16} aria-hidden />,
          onClick: () => setActiveModal("lost"),
        },
        ...(canConvert
          ? [
              {
                label: "Convert to applicant",
                icon: <ArrowsLeftRightIcon size={16} aria-hidden />,
                onClick: () => setActiveModal("convert"),
              },
            ]
          : []),
      ];

  return (
    <>
      <InlineStageSwitch
        current={lead.stage}
        colorMap={STAGE_COLORS}
        labelMap={STAGE_LABELS}
        targets={targets}
        menuLabel="Move to stage"
        entityLabel={lead.full_name || lead.full_name_en || lead.full_name_np}
        terminal={isClosed}
        actions={actions}
        onConfirm={(value) =>
          mutation.mutateAsync({ stage: value as SelectableLeadStage })
        }
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
