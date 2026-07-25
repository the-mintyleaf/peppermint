"use client";

import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import type { ChecklistTemplate } from "../../../../../checklists.types";
import type { TemplateRowActionsMenuProps } from "./TemplateRowActionsMenu.types";

/**
 * "View items" navigates to the Template Detail route (where the item list,
 * publish/retire, and add-requirement live). "Edit" delegates to the shell's
 * own edit modal. Both are shown unconditionally — this list is already gated
 * Admin-only by `RequireDocumentAccess` at the page level.
 */
export function TemplateRowActionsMenu({
  template,
  onViewDetails,
}: TemplateRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<ChecklistTemplate>();

  return (
    <RowActionsMenu<ChecklistTemplate>
      record={template}
      aria-label={`Actions for ${template.label}`}
      actions={[
        {
          label: "View items",
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
