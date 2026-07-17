"use client";

import {
  modals,
  notifications,
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import { documentQueryKeys } from "@/modules/documents";
import type { Signature } from "@/modules/documents";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import {
  deactivateSignature,
  reactivateSignature,
} from "../../../signatures.api";
import { signaturesQueryKeys } from "../../../signatures.queryKeys";

export interface SignatureLifecycle {
  isActive: boolean;
  /** A transition is in flight — guard against a double-fire while the row still reads stale. */
  isPending: boolean;
  openDeactivate: () => void;
  openReactivate: () => void;
}

/**
 * Deactivate/reactivate transitions for one signature — mutations, notifications, and the
 * confirm-modal openers — shared by the interactive Status cell and the row-actions menu so the
 * two entry points never drift. Deactivate is a soft `DELETE` (retained for history); reactivate
 * rides `PATCH is_active=true`. Both invalidate the admin list *and* the full-screen editor's
 * active-only signatures key.
 */
export function useSignatureLifecycle(
  signature: Signature,
): SignatureLifecycle {
  const queryClient = useQueryClient();

  // Per-signature key so the pending state is observed across *both* entry points (the Status
  // cell and the row menu each mount their own hook instance). `useIsMutating` reads the shared
  // cache, so a transition started from one guards the other — a plain per-instance
  // `isPending` would let the second entry point fire a duplicate DELETE/PATCH.
  const lifecycleKey = [...signaturesQueryKeys.all, "lifecycle", signature.id];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: signaturesQueryKeys.lists() });
    queryClient.invalidateQueries({ queryKey: documentQueryKeys.signatures() });
  };

  const notifyError = (title: string) => (error: unknown) =>
    notifications.show({
      color: "red",
      title,
      message: getApiErrorMessage(error),
    });

  const deactivateMutation = useMutation({
    mutationKey: lifecycleKey,
    mutationFn: () => deactivateSignature(signature.id),
    onSuccess: () => {
      invalidate();
      notifications.show({
        color: "green",
        title: "Signature deactivated",
        message: "It is retained for historical documents.",
      });
    },
    onError: notifyError("Couldn't deactivate signature"),
  });

  const reactivateMutation = useMutation({
    mutationKey: lifecycleKey,
    mutationFn: () => reactivateSignature(signature.id, signature.name),
    onSuccess: () => {
      invalidate();
      notifications.show({
        color: "green",
        title: "Signature reactivated",
        message: `${signature.name} is selectable on new documents again.`,
      });
    },
    onError: notifyError("Couldn't reactivate signature"),
  });

  // Shared across every hook instance for this signature (see `lifecycleKey` above), so the
  // Status cell and the row menu can't both fire a transition on the same row.
  const isPending = useIsMutating({ mutationKey: lifecycleKey }) > 0;

  return {
    isActive: signature.is_active,
    isPending,
    openDeactivate: () =>
      modals.openConfirmModal({
        title: "Deactivate signature",
        children: `${signature.name} will no longer be selectable on new documents. Existing documents keep it.`,
        labels: { confirm: "Deactivate", cancel: "Cancel" },
        confirmProps: { color: "red", size: "xs" },
        cancelProps: { size: "xs" },
        onConfirm: () => deactivateMutation.mutate(),
      }),
    openReactivate: () =>
      modals.openConfirmModal({
        title: "Reactivate signature",
        children: `${signature.name} will become selectable on new documents again.`,
        labels: { confirm: "Reactivate", cancel: "Cancel" },
        confirmProps: { color: "teal", size: "xs" },
        cancelProps: { size: "xs" },
        onConfirm: () => reactivateMutation.mutate(),
      }),
  };
}
