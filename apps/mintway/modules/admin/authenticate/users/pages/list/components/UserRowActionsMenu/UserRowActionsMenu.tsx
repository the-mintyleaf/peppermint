"use client";

import { useState } from "react";
import { notifications, useMutation, useQueryClient } from "@peppermint/ui";
import {
  RowActionsMenu,
  openReasonConfirmModal,
  useModalTableShellContext,
} from "@peppermint/admin";
import { modals } from "@peppermint/ui";
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
import {
  deactivateUser,
  reactivateUser,
  resetUserPassword,
  revokeUserSessions,
  suspendUser,
  unsuspendUser,
} from "../../../../users.api";
import { usersQueryKeys } from "../../../../users.queryKeys";
import type { UserAdmin } from "../../../../users.types";
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

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });

  const notifyError = (title: string) => (error: unknown) =>
    notifications.show({
      color: "red",
      title,
      message: getApiErrorMessage(error),
    });

  const notifySuccess = (title: string, message: string) => () => {
    invalidate();
    notifications.show({ color: "green", title, message });
  };

  const deactivateMutation = useMutation({
    mutationFn: (reason: string) => deactivateUser(user.id, reason),
    onSuccess: notifySuccess(
      "Account deactivated",
      `${user.username} was deactivated.`,
    ),
    onError: notifyError("Couldn't deactivate account"),
  });
  const reactivateMutation = useMutation({
    mutationFn: () => reactivateUser(user.id),
    onSuccess: notifySuccess(
      "Account reactivated",
      `${user.username} was reactivated.`,
    ),
    onError: notifyError("Couldn't reactivate account"),
  });
  const suspendMutation = useMutation({
    mutationFn: (reason: string) => suspendUser(user.id, reason),
    onSuccess: notifySuccess(
      "Account suspended",
      `${user.username} was suspended.`,
    ),
    onError: notifyError("Couldn't suspend account"),
  });
  const unsuspendMutation = useMutation({
    mutationFn: () => unsuspendUser(user.id),
    onSuccess: notifySuccess(
      "Account unsuspended",
      `${user.username} was unsuspended.`,
    ),
    onError: notifyError("Couldn't unsuspend account"),
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

  const isSelf = user.id === currentUserId;
  const status = user.account_status;
  // A plain admin may only lifecycle `staff` targets (API §3); the superadmin may act
  // on any visible account. Hide the action rather than let the backend 403 it.
  const canLifecycle = isSuperadmin || user.role === "staff";

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
            label: "Deactivate",
            icon: <ProhibitIcon size={16} aria-hidden />,
            color: "red",
            dividerBefore: true,
            hidden: () => status !== "active" || !canLifecycle,
            disabled: () => isSelf,
            onClick: () =>
              openReasonConfirmModal({
                title: "Deactivate account",
                description: `${user.username} will lose access and all their sessions will be revoked.`,
                confirmLabel: "Deactivate",
                confirmColor: "red",
                onConfirm: (reason) => deactivateMutation.mutateAsync(reason),
              }),
          },
          {
            label: "Reactivate",
            icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
            hidden: () => status !== "deactivated" || !canLifecycle,
            onClick: () => reactivateMutation.mutate(),
          },
          {
            label: "Suspend",
            icon: <PauseCircleIcon size={16} aria-hidden />,
            color: "red",
            dividerBefore: true,
            hidden: () => !isSuperadmin || status !== "active",
            disabled: () => isSelf,
            onClick: () =>
              openReasonConfirmModal({
                title: "Suspend account",
                description: `${user.username} will be blocked from signing in until unsuspended.`,
                confirmLabel: "Suspend",
                confirmColor: "red",
                onConfirm: (reason) => suspendMutation.mutateAsync(reason),
              }),
          },
          {
            label: "Unsuspend",
            icon: <PlayCircleIcon size={16} aria-hidden />,
            hidden: () => !isSuperadmin || status !== "suspended",
            onClick: () => unsuspendMutation.mutate(),
          },
          {
            label: "Reset password",
            icon: <KeyIcon size={16} aria-hidden />,
            color: "red",
            dividerBefore: true,
            hidden: () => !isSuperadmin,
            onClick: () => setResetOpen(true),
          },
          {
            label: "Revoke sessions",
            icon: <SignOutIcon size={16} aria-hidden />,
            color: "red",
            hidden: () => !isSuperadmin,
            onClick: () =>
              modals.openConfirmModal({
                title: "Revoke sessions",
                children: `Sign ${user.username} out of every device?`,
                labels: { confirm: "Revoke", cancel: "Cancel" },
                confirmProps: { color: "red" },
                onConfirm: () => revokeMutation.mutate(),
              }),
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
