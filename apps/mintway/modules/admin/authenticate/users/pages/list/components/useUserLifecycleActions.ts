"use client";

import { notifications, useMutation, useQueryClient } from "@peppermint/ui";
import { openReasonConfirmModal } from "@peppermint/admin";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import {
  deactivateUser,
  reactivateUser,
  suspendUser,
  unsuspendUser,
} from "../../../users.api";
import { usersQueryKeys } from "../../../users.queryKeys";
import type { UserAdmin } from "../../../users.types";

interface LifecycleContext {
  currentUserId?: string;
  isSuperadmin: boolean;
}

export interface UserLifecycleActions {
  status: UserAdmin["account_status"];
  /** Acting on your own account — deactivate/suspend must stay disabled. */
  isSelf: boolean;
  /** A plain admin may only lifecycle `staff` targets (API §3). */
  canLifecycle: boolean;
  /** Suspend/unsuspend are superadmin-only. */
  canSuspend: boolean;
  openDeactivate: () => void;
  reactivate: () => void;
  openSuspend: () => void;
  unsuspend: () => void;
}

/**
 * The account lifecycle transitions (deactivate/reactivate/suspend/unsuspend) —
 * mutations, notifications, and reason-confirm openers — shared by the row-action
 * menu and the interactive Status cell so the two entry points never drift.
 * Reset-password and revoke-sessions keep their own local modal state in the menu.
 */
export function useUserLifecycleActions(
  user: UserAdmin,
  { currentUserId, isSuperadmin }: LifecycleContext,
): UserLifecycleActions {
  const queryClient = useQueryClient();

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

  return {
    status: user.account_status,
    isSelf: user.id === currentUserId,
    canLifecycle: isSuperadmin || user.role === "staff",
    canSuspend: isSuperadmin,
    openDeactivate: () =>
      openReasonConfirmModal({
        title: "Deactivate account",
        description: `${user.username} will lose access and all their sessions will be revoked.`,
        tone: "danger",
        reasonPlaceholder: "Why is this account being deactivated?",
        confirmLabel: "Deactivate",
        confirmColor: "red",
        onConfirm: (reason) => deactivateMutation.mutateAsync(reason),
      }),
    reactivate: () => reactivateMutation.mutate(),
    openSuspend: () =>
      openReasonConfirmModal({
        title: "Suspend account",
        description: `${user.username} will be blocked from signing in until unsuspended.`,
        tone: "warning",
        reasonPlaceholder: "Why is this account being suspended?",
        confirmLabel: "Suspend",
        confirmColor: "orange",
        onConfirm: (reason) => suspendMutation.mutateAsync(reason),
      }),
    unsuspend: () => unsuspendMutation.mutate(),
  };
}
