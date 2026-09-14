"use client";

import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { SealCheckIcon } from "@phosphor-icons/react/dist/csr/SealCheck";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";
import { InlineStageSwitch } from "@/components/InlineStageSwitch";
import type { InlineStageSwitchAction } from "@/components/InlineStageSwitch";
import { useUpdateItemStatus } from "../../../../checklists.hooks";
import {
  ITEM_STATUS_COLORS,
  ITEM_STATUS_LABELS,
} from "../../../../checklists.labels";
import type { ItemStatus } from "../../../../checklists.types";
import type { ChecklistItemStatusSwitchProps } from "./ChecklistItemStatusSwitch.types";

/**
 * Statuses the switch can set on its own: nothing but a confirmation is
 * required. `waived` and `blocked` are deliberately absent — the backend makes
 * `status_note` mandatory for both (INTEGRATION.md §7), so they are offered as
 * actions that open the modal already on that status, never as a plain move
 * that would 400 on `CHECKLISTS_STATUS_NOTE_REQUIRED`.
 */
const PLAIN_STATUSES: ItemStatus[] = ["pending", "completed", "not_applicable"];

/**
 * The item's status as a lever, in the row itself — the same pill-and-menu
 * control the leads, journeys, and applicants tables use, so a status move
 * costs one click and a confirmation instead of a modal round-trip. The modal
 * still owns the two moves that need a written reason, plus evidence.
 */
export function ChecklistItemStatusSwitch({
  checklistId,
  item,
  onOpenStatusModal,
  frozen = false,
}: ChecklistItemStatusSwitchProps) {
  const mutation = useUpdateItemStatus(checklistId);

  const actions: InlineStageSwitchAction[] = [
    ...(item.status !== "waived"
      ? [
          {
            label: "Waive…",
            color: "blue",
            icon: <SealCheckIcon size={16} aria-hidden />,
            onClick: () => onOpenStatusModal(item, "waived"),
          },
        ]
      : []),
    ...(item.status !== "blocked"
      ? [
          {
            label: "Mark as blocked…",
            color: "red",
            icon: <ProhibitIcon size={16} aria-hidden />,
            onClick: () => onOpenStatusModal(item, "blocked"),
          },
        ]
      : []),
    ...(item.item_type === "document"
      ? [
          {
            label: item.evidence_file ? "Change evidence…" : "Attach evidence…",
            icon: <PaperclipIcon size={16} aria-hidden />,
            onClick: () => onOpenStatusModal(item, item.status),
          },
        ]
      : []),
  ];

  return (
    <InlineStageSwitch
      current={item.status}
      colorMap={ITEM_STATUS_COLORS}
      labelMap={ITEM_STATUS_LABELS}
      targets={PLAIN_STATUSES.filter((s) => s !== item.status)}
      actions={actions}
      disabled={frozen}
      entityLabel={item.label}
      menuLabel="Set status"
      onConfirm={(status) =>
        mutation.mutateAsync({
          itemId: item.id,
          body: { status: status as ItemStatus },
        })
      }
    />
  );
}
