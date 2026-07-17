"use client";

import {
  modals,
  notifications,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { documentQueryKeys } from "@/modules/documents";
import type { Signature } from "@/modules/documents";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { deactivateSignature } from "../../../../signatures.api";
import { signaturesQueryKeys } from "../../../../signatures.queryKeys";
import type { SignatureRowActionsMenuProps } from "./SignatureRowActionsMenu.types";

export function SignatureRowActionsMenu({
  signature,
}: SignatureRowActionsMenuProps) {
  const queryClient = useQueryClient();
  const { openEditModal } = useModalTableShellContext<Signature>();

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateSignature(signature.id),
    onSuccess: () => {
      // Refresh both the admin list and the editor's active-only signatures.
      queryClient.invalidateQueries({ queryKey: signaturesQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: documentQueryKeys.signatures(),
      });
      notifications.show({
        color: "green",
        title: "Signature deactivated",
        message: "It is retained for historical documents.",
      });
    },
    onError: (error) =>
      notifications.show({
        color: "red",
        title: "Couldn't deactivate signature",
        message: getApiErrorMessage(error),
      }),
  });

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
          hidden: () => !signature.is_active,
          // Block a second confirm while the first request is in flight (the row still
          // reads is_active until the refetch resolves).
          disabled: () => deactivateMutation.isPending,
          onClick: () =>
            modals.openConfirmModal({
              title: "Deactivate signature",
              children: `${signature.name} will no longer be selectable on new documents. Existing documents keep it.`,
              labels: { confirm: "Deactivate", cancel: "Cancel" },
              confirmProps: { color: "red", size: "xs" },
              cancelProps: { size: "xs" },
              onConfirm: () => deactivateMutation.mutate(),
            }),
        },
      ]}
    />
  );
}
