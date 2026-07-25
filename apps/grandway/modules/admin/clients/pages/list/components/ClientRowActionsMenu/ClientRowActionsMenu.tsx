"use client";

import {
  RowActionsMenu,
  openReasonConfirmModal,
  useModalTableShellContext,
} from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useRestoreClient, useRetireClient } from "../../../../clients.hooks";
import type { ClientRow } from "../../../../clients.types";
import { openRetireClientModal } from "../RetireClientModal";
import type { ClientRowActionsMenuProps } from "./ClientRowActionsMenu.types";

/**
 * Row actions. "View details" is always available (reads are shared with lead
 * managers). Every write — Edit, Retire, Restore — is gated on the exact
 * `admin` tier: a lead manager gets `CLIENTS_ACTOR_FORBIDDEN` server-side, so
 * the controls are hidden rather than left to fail (§1). `isAdmin` from
 * `useCurrentUser` also covers `superadmin` (403 on everything here), so this
 * checks the tier directly. Retire/restore mirror the record's standing: retire
 * only when active, restore only when inactive (409 otherwise, §7).
 */
export function ClientRowActionsMenu({
  client,
  onViewDetails,
}: ClientRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<ClientRow>();
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";
  const retireMutation = useRetireClient();
  const restoreMutation = useRestoreClient();

  const openRestoreConfirm = () =>
    openReasonConfirmModal({
      title: "Restore client",
      parentLabel: "Clients",
      hideReason: true,
      tone: "info",
      alertTitle: "This makes the partner active again",
      description: `${client.name} will be offered as a current contact and its retirement note cleared.`,
      confirmLabel: "Restore client",
      confirmColor: "teal",
      onConfirm: async () => {
        await restoreMutation.mutateAsync(client.id);
      },
    });

  return (
    <RowActionsMenu<ClientRow>
      record={client}
      aria-label={`Actions for ${client.name}`}
      actions={[
        {
          label: "View details",
          icon: <EyeIcon size={16} aria-hidden />,
          onClick: onViewDetails,
        },
        {
          label: "Edit",
          icon: <PencilSimpleIcon size={16} aria-hidden />,
          hidden: () => !isAdmin,
          onClick: (record) => openEditModal(record),
        },
        {
          label: "Retire",
          icon: <ProhibitIcon size={16} aria-hidden />,
          color: "red",
          dividerBefore: true,
          // Admin only, and only a currently-active client can be retired.
          hidden: () => !isAdmin || client.status !== "active",
          onClick: () =>
            openRetireClientModal({
              clientName: client.name,
              onConfirm: async (reason) => {
                await retireMutation.mutateAsync({ id: client.id, reason });
              },
            }),
        },
        {
          label: "Restore",
          icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
          color: "teal",
          dividerBefore: true,
          // Admin only, and only a retired client can be restored.
          hidden: () => !isAdmin || client.status !== "inactive",
          onClick: openRestoreConfirm,
        },
      ]}
    />
  );
}
