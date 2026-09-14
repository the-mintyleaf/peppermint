"use client";

import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { ChecklistTemplate } from "../../../../../checklists.types";
import type { TemplateRowActionsMenuProps } from "./TemplateRowActionsMenu.types";

/**
 * "View items" opens the template drawer (where the item list, publish/retire,
 * and add-requirement live) — Admin or Lead Manager may read it. "Edit" delegates to the shell's own edit modal and is Admin-only (§1);
 * the list itself is gated `RequireLeadAccess`, not exact-admin, so this
 * menu hides Edit itself rather than offering a control the shell can't back
 * (`editFormComponent`/`onEditApi` are `undefined` for a non-admin).
 */
export function TemplateRowActionsMenu({
  template,
  onViewDetails,
}: TemplateRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<ChecklistTemplate>();
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";

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
          hidden: () => !isAdmin,
          onClick: (record) => openEditModal(record),
        },
      ]}
    />
  );
}
