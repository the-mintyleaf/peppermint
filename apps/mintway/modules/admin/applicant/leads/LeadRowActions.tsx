"use client";

import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import type { RowAction } from "@peppermint/admin";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";

import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { Lead } from "./leads.types";

interface LeadRowActionsProps {
  lead: Lead;
  onView: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
}

/**
 * Row actions for one enquiry. Edit routes through the shell's edit modal (via the
 * shell context, the same way the applicant row menu does); view and convert are
 * owned by the list.
 *
 * The converted state drives all three: a frozen lead can't be edited (the PATCH
 * would 409), can't be re-converted (also 409), and is the only case where the
 * read-only view is reachable — since conversion leaves the enquiry-only fields
 * here and nothing else surfaces them.
 */
export function LeadRowActions({
  lead,
  onView,
  onConvert,
}: LeadRowActionsProps) {
  const { isAdmin } = useCurrentUser();
  const { openEditModal } = useModalTableShellContext<Lead>();

  const actions: RowAction<Lead>[] = [
    {
      label: "View enquiry",
      icon: <EyeIcon size={16} />,
      hidden: (l) => !l.is_converted,
      onClick: (l) => onView(l),
    },
    {
      label: "Edit",
      icon: <PencilSimpleIcon size={16} />,
      // Disabled rather than hidden: the operator should see *why* they can't
      // edit, and the adjacent "View enquiry" action tells them where to look.
      disabled: (l) => l.is_converted,
      onClick: (l) => openEditModal(l),
    },
    {
      label: "Convert to applicant",
      icon: <ArrowsLeftRightIcon size={16} />,
      dividerBefore: true,
      // Admin-only per the contract; re-converting a frozen lead 409s.
      hidden: (l) => !isAdmin || l.is_converted,
      onClick: (l) => onConvert(l),
    },
  ];

  return (
    <RowActionsMenu
      record={lead}
      actions={actions}
      aria-label={`Actions for ${lead.lead_code}`}
    />
  );
}
