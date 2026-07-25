"use client";

import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import type { Checklist } from "../../../../checklists.types";
import type { ChecklistRowActionsMenuProps } from "./ChecklistRowActionsMenu.types";

/**
 * "View" navigates to the Checklist Detail route (where lifecycle actions and
 * item status controls live). "Edit" delegates to the shell's own edit modal —
 * the mutable subset (title/description/assigned_to/due_at/notes) only, same
 * pattern as `OfferRowActionsMenu`. No authority-based hiding — admin and
 * lead_manager share identical rights on checklists (§1).
 */
export function ChecklistRowActionsMenu({
  checklist,
  onViewDetails,
}: ChecklistRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<Checklist>();

  return (
    <RowActionsMenu<Checklist>
      record={checklist}
      aria-label={`Actions for the checklist "${checklist.title}"`}
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
