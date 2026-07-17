"use client";

import { useState } from "react";
import { notifications, useMutation, useQueryClient } from "@peppermint/ui";
import {
  RowActionsMenu,
  openReasonConfirmModal,
  useModalTableShellContext,
} from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { PlayCircleIcon } from "@phosphor-icons/react/dist/csr/PlayCircle";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { OneTimeSecretModal } from "@/modules/admin/authenticate/_shared/OneTimeSecretModal";
import { resetUserPassword, revokeUserSessions } from "../../../../users.api";
import { usersQueryKeys } from "../../../../users.queryKeys";
import type { UserAdmin } from "../../../../users.types";
import { useUserLifecycleActions } from "../useUserLifecycleActions";
import { SetTemporaryPasswordModal } from "../SetTemporaryPasswordModal";
import type { UserRowActionsMenuProps } from "./UserRowActionsMenu.types";

export function UserRowActionsMenu({
  user,
  currentUserId,
  isSuperadmin,
  onViewDetails,
}: UserRowActionsMenuProps) {
  const queryClient = useQueryClient();
  const { openEditModal } = useModalTableShellContext<UserAdmin>();
  const [resetOpen, setResetOpen] = useState(false);
  const [issuedPassword, setIssuedPassword] = useState<string | null>(null);

  const lifecycle = useUserLifecycleActions(user, {
    currentUserId,
    isSuperadmin,
  });
  const { status, isSelf, canLifecycle, canSuspend } = lifecycle;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });

  const notifyError = (title: string) => (error: unknown) =>
    notifications.show({
      color: "red",
      title,
      message: getApiErrorMessage(error),
    });

  const revokeMutation = useMutation({
    mutationFn: () => revokeUserSessions(user.id),
    onSuccess: (result) => {
      invalidate();
      notifications.show({
        color: "green",
        title: "Sessions revoked",
        message: `${result.sessions_revoked} session${
          result.sessions_revoked === 1 ? "" : "s"
        } revoked for ${user.username}.`,
      });
    },
    onError: notifyError("Couldn't revoke sessions"),
  });
  const resetMutation = useMutation({
    mutationFn: (temporaryPassword: string) =>
      resetUserPassword(user.id, temporaryPassword),
    onSuccess: (_data, temporaryPassword) => {
      invalidate();
      setResetOpen(false);
      setIssuedPassword(temporaryPassword);
    },
    onError: notifyError("Couldn't reset password"),
  });

  const openRevokeConfirm = () =>
    openReasonConfirmModal({
      title: "Revoke sessions",
      parentLabel: "Users",
      hideReason: true,
      tone: "warning",
      alertTitle: "Signs them out everywhere",
      description: `@${user.username} is signed out of every device right now. They can sign back in with their current password.`,
      confirmLabel: "Revoke sessions",
      confirmColor: "orange",
      onConfirm: async () => {
        await revokeMutation.mutateAsync();
      },
    });

  return (
    <>
      <RowActionsMenu<UserAdmin>
        record={user}
        aria-label={`Actions for ${user.username}`}
        actions={[
          {
            label: "View details",
            icon: <EyeIcon size={16} aria-hidden />,
            onClick: onViewDetails,
          },
          {
            label: "Edit profile",
            icon: <PencilSimpleIcon size={16} aria-hidden />,
            onClick: (record) => openEditModal(record),
          },
          {
            label: "Reactivate",
            icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
            dividerBefore: true,
            hidden: () => status !== "deactivated" || !canLifecycle,
            onClick: () => lifecycle.reactivate(),
          },
          {
            label: "Unsuspend",
            icon: <PlayCircleIcon size={16} aria-hidden />,
            dividerBefore: true,
            hidden: () => status !== "suspended" || !canSuspend,
            onClick: () => lifecycle.unsuspend(),
          },
          {
            label: "Suspend",
            icon: <PauseCircleIcon size={16} aria-hidden />,
            color: "orange",
            dividerBefore: true,
            hidden: () => status !== "active" || !canSuspend,
            disabled: () => isSelf,
            onClick: () => lifecycle.openSuspend(),
          },
          {
            label: "Reset password",
            icon: <KeyIcon size={16} aria-hidden />,
            dividerBefore: true,
            hidden: () => !isSuperadmin,
            onClick: () => setResetOpen(true),
          },
          {
            label: "Revoke sessions",
            icon: <SignOutIcon size={16} aria-hidden />,
            hidden: () => !isSuperadmin,
            onClick: openRevokeConfirm,
          },
          {
            label: "Deactivate",
            icon: <ProhibitIcon size={16} aria-hidden />,
            color: "red",
            dividerBefore: true,
            hidden: () => status !== "active" || !canLifecycle,
            disabled: () => isSelf,
            onClick: () => lifecycle.openDeactivate(),
          },
        ]}
      />

      <SetTemporaryPasswordModal
        // Remount per open so the entered password never lingers in state after a
        // success (which closes via setResetOpen, bypassing the input's own reset).
        key={resetOpen ? "reset-open" : "reset-closed"}
        opened={resetOpen}
        onClose={() => setResetOpen(false)}
        username={user.username}
        isSubmitting={resetMutation.isPending}
        onConfirm={(pw) => resetMutation.mutate(pw)}
      />

      <OneTimeSecretModal
        opened={issuedPassword !== null}
        onClose={() => setIssuedPassword(null)}
        title="Temporary password set"
        description={`Share this temporary password with ${user.username} securely.`}
        secrets={issuedPassword ? [issuedPassword] : []}
      />
    </>
  );
}
