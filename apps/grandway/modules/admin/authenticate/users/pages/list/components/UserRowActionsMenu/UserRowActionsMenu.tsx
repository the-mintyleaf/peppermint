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
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { ShieldSlashIcon } from "@phosphor-icons/react/dist/csr/ShieldSlash";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { OneTimeSecretModal } from "@/modules/admin/authenticate/_shared/OneTimeSecretModal";
import {
  blockUser,
  resetUserMfa,
  resetUserPassword,
  restoreUser,
  revokeUserSessions,
} from "../../../../users.api";
import { usersQueryKeys } from "../../../../users.queryKeys";
import type { User } from "../../../../users.types";
import { SetTemporaryPasswordModal } from "../SetTemporaryPasswordModal";
import type { UserRowActionsMenuProps } from "./UserRowActionsMenu.types";

/**
 * Row actions for a managed account. The list itself is already scoped server-side to
 * the tier the caller manages (`authenticate/docs/INTEGRATION.md` §7 — "scope is by
 * tier, not ownership"), so every action here is uniformly available — there is no
 * finer per-action authority split within a managed tier.
 */
export function UserRowActionsMenu({
  user,
  onViewDetails,
}: UserRowActionsMenuProps) {
  const queryClient = useQueryClient();
  const { openEditModal } = useModalTableShellContext<User>();
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

  const blockMutation = useMutation({
    mutationFn: (reason: string) => blockUser(user.id, reason || undefined),
    onSuccess: () => {
      invalidate();
      notifications.show({
        color: "green",
        title: "Account blocked",
        message: `@${user.username} was blocked and signed out everywhere.`,
      });
    },
    onError: notifyError("Couldn't block account"),
  });
  const restoreMutation = useMutation({
    mutationFn: () => restoreUser(user.id),
    onSuccess: () => {
      invalidate();
      notifications.show({
        color: "green",
        title: "Account restored",
        message: `@${user.username} can sign in again.`,
      });
    },
    onError: notifyError("Couldn't restore account"),
  });
  const resetPasswordMutation = useMutation({
    mutationFn: (password: string | undefined) =>
      resetUserPassword(user.id, password),
    onSuccess: (result, password) => {
      invalidate();
      setResetOpen(false);
      setIssuedPassword(result.temporary_password ?? password ?? null);
    },
    onError: notifyError("Couldn't reset password"),
  });
  const resetMfaMutation = useMutation({
    mutationFn: () => resetUserMfa(user.id),
    onSuccess: () => {
      invalidate();
      notifications.show({
        color: "green",
        title: "Authenticator reset",
        message: `@${user.username}'s authenticator was removed and their sessions revoked.`,
      });
    },
    onError: notifyError("Couldn't reset authenticator"),
  });
  const revokeMutation = useMutation({
    mutationFn: () => revokeUserSessions(user.id),
    onSuccess: (result) => {
      invalidate();
      notifications.show({
        color: "green",
        title: "Sessions revoked",
        message: `${result.revoked} session${result.revoked === 1 ? "" : "s"} revoked for @${user.username}.`,
      });
    },
    onError: notifyError("Couldn't revoke sessions"),
  });

  const openBlockConfirm = () =>
    openReasonConfirmModal({
      title: "Block account",
      parentLabel: "Users",
      alertTitle: "This revokes access immediately",
      description: `@${user.username} is signed out of every device and can no longer sign in. You can restore the account later.`,
      tone: "danger",
      reasonLabel: "Reason (optional)",
      reasonPlaceholder: "e.g. Left the organization",
      confirmLabel: "Block account",
      confirmColor: "red",
      onConfirm: (reason) => blockMutation.mutateAsync(reason),
    });

  const openRestoreConfirm = () =>
    openReasonConfirmModal({
      title: "Restore account",
      parentLabel: "Users",
      hideReason: true,
      tone: "info",
      alertTitle: "This restores access",
      description: `@${user.username} will be able to sign in again.`,
      confirmLabel: "Restore account",
      confirmColor: "teal",
      onConfirm: () => restoreMutation.mutateAsync(),
    });

  const openResetMfaConfirm = () =>
    openReasonConfirmModal({
      title: "Reset authenticator",
      parentLabel: "Users",
      hideReason: true,
      tone: "warning",
      alertTitle: "Removes their authenticator app",
      description: `@${user.username} loses MFA and is signed out of every device. They'll re-enroll after signing back in.`,
      confirmLabel: "Reset authenticator",
      confirmColor: "orange",
      onConfirm: () => resetMfaMutation.mutateAsync(),
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
      <RowActionsMenu<User>
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
            label: "Restore",
            icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
            dividerBefore: true,
            hidden: () => user.is_active,
            onClick: openRestoreConfirm,
          },
          {
            label: "Reset password",
            icon: <KeyIcon size={16} aria-hidden />,
            dividerBefore: true,
            onClick: () => setResetOpen(true),
          },
          {
            label: "Reset authenticator",
            icon: <ShieldSlashIcon size={16} aria-hidden />,
            hidden: () => !user.mfa_enabled,
            onClick: openResetMfaConfirm,
          },
          {
            label: "Revoke sessions",
            icon: <SignOutIcon size={16} aria-hidden />,
            onClick: openRevokeConfirm,
          },
          {
            label: "Block",
            icon: <ProhibitIcon size={16} aria-hidden />,
            color: "red",
            dividerBefore: true,
            hidden: () => !user.is_active,
            onClick: openBlockConfirm,
          },
        ]}
      />

      <SetTemporaryPasswordModal
        key={resetOpen ? "reset-open" : "reset-closed"}
        opened={resetOpen}
        onClose={() => setResetOpen(false)}
        username={user.username}
        isSubmitting={resetPasswordMutation.isPending}
        onConfirm={(password) => resetPasswordMutation.mutate(password)}
      />

      <OneTimeSecretModal
        opened={issuedPassword !== null}
        onClose={() => setIssuedPassword(null)}
        title="Temporary password set"
        description={`Share this temporary password with @${user.username} securely.`}
        secrets={issuedPassword ? [issuedPassword] : []}
      />
    </>
  );
}
