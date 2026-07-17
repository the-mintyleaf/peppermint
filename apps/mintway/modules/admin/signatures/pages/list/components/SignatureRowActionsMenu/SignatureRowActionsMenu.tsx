"use client";

import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import type { Signature } from "@/modules/documents";
import { useSignatureLifecycle } from "../useSignatureLifecycle";
import type { SignatureRowActionsMenuProps } from "./SignatureRowActionsMenu.types";

export function SignatureRowActionsMenu({
  signature,
}: SignatureRowActionsMenuProps) {
  const { openEditModal } = useModalTableShellContext<Signature>();
  const { isActive, isPending, openDeactivate } =
    useSignatureLifecycle(signature);

  return (
    <RowActionsMenu<Signature>
      record={signature}
      aria-label={`Actions for ${signature.name}`}
      actions={[
        {
          label: "Edit",
          icon: <PencilSimpleIcon size={16} aria-hidden />,
          onClick: (record) => openEditModal(record),
        },
        {
          label: "Deactivate",
          icon: <ProhibitIcon size={16} aria-hidden />,
          color: "red",
          dividerBefore: true,
          hidden: () => !isActive,
          // Block a second confirm while the first request is in flight (the row still
          // reads is_active until the refetch resolves).
          disabled: () => isPending,
          onClick: () => openDeactivate(),
        },
      ]}
    />
  );
}
