import { openReasonConfirmModal } from "@peppermint/admin";
import { notifications } from "@peppermint/ui";
import {
  LEAD_DELETE_REASON_MAX,
  LEAD_RESTORE_REASON_MAX,
} from "../../leadManagement.types";
import { isStaleLeadError } from "../../leadErrors.utils";

interface LeadRef {
  id: string;
  full_name: string;
}

type DeleteLeadFn = (variables: {
  id: string;
  reason: string;
}) => Promise<unknown>;
type RestoreLeadFn = (variables: {
  id: string;
  reason?: string;
}) => Promise<unknown>;

/**
 * The confirm modal has no length cap of its own, so an over-long reason is
 * caught here (the modal stays open with the text intact) rather than by a
 * server `VALIDATION_ERROR`.
 */
function assertReasonLength(reason: string, max: number) {
  if (reason.length <= max) return;
  notifications.show({
    color: "red",
    title: "Reason is too long",
    message: `Keep it under ${max} characters (it is ${reason.length}).`,
  });
  throw new Error("reason too long");
}

/**
 * Runs the write; a stale-lead 409 (already deleted / already restored /
 * converted) RESOLVES instead of rejecting, so the confirm modal closes —
 * retrying can't succeed. The mutation hook has already toasted why and
 * refetched the lead and board. Any other failure rejects, keeping the modal
 * open with the reason intact for a retry.
 */
async function closeOnStale(write: Promise<unknown>): Promise<void> {
  try {
    await write;
  } catch (error) {
    if (!isStaleLeadError(error)) throw error;
  }
}

/**
 * Admin-only soft delete, behind a required reason. The copy separates it
 * from "Mark as lost" on purpose: lost is a real enquiry that stays
 * reportable; deleted should never have counted (a duplicate, spam, a test).
 * `deleteLead` is `useDeleteLead().mutateAsync` — it toasts its own outcome.
 * A failure keeps the modal open for retry, except a stale-lead 409
 * (`closeOnStale`), which closes it because a retry can't succeed.
 */
export function openDeleteLeadModal(lead: LeadRef, deleteLead: DeleteLeadFn) {
  openReasonConfirmModal({
    title: "Delete lead",
    parentLabel: lead.full_name,
    tone: "danger",
    alertTitle: "Removes this lead from every list, search and dashboard",
    description:
      "Use this for duplicates, spam or test entries — not for an enquiry that won't proceed (mark that lost instead). Nothing is erased: an Admin can restore it from Deleted leads.",
    reasonLabel: "Why is this lead being deleted?",
    reasonPlaceholder: "Duplicate of an existing enquiry",
    confirmLabel: "Delete lead",
    confirmColor: "red",
    onConfirm: async (reason) => {
      assertReasonLength(reason, LEAD_DELETE_REASON_MAX);
      await closeOnStale(deleteLead({ id: lead.id, reason }));
    },
  });
}

/** Admin-only restore; the reason is optional and lands in the lead's history. */
export function openRestoreLeadModal(
  lead: LeadRef,
  restoreLead: RestoreLeadFn,
  onRestored?: () => void,
) {
  openReasonConfirmModal({
    title: "Restore lead",
    parentLabel: lead.full_name,
    tone: "info",
    alertTitle: "Brings the lead back exactly as it was",
    description:
      "It returns to the board, search and dashboards with its stage, notes and history untouched, and its owner can see it again.",
    reasonLabel: "Reason (optional)",
    reasonPlaceholder: "Not a duplicate after all",
    reasonRequired: false,
    confirmLabel: "Restore lead",
    onConfirm: async (reason) => {
      assertReasonLength(reason, LEAD_RESTORE_REASON_MAX);
      // `onRestored` fires on a stale refusal too: either way the lead has
      // left the deleted list, so the caller's page adjustment still applies.
      await closeOnStale(
        restoreLead({ id: lead.id, reason: reason || undefined }),
      );
      onRestored?.();
    },
  });
}
