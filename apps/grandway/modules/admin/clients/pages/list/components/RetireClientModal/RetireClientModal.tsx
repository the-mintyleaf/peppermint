"use client";

import { openReasonConfirmModal } from "@peppermint/admin";
import type { OpenRetireClientModalOptions } from "./RetireClientModal.types";

/**
 * Retire confirmation — built on the `openReasonConfirmModal` primitive rather
 * than a hand-rolled modal (CLAUDE.md Framework Primitives). The reason is
 * mandatory and non-empty by contract (§7 `CLIENTS_STATUS_NOTE_REQUIRED`), which
 * is exactly the primitive's default (`reasonRequired: true` keeps Confirm
 * disabled until a reason is typed). Retire is a recoverable action — the copy
 * makes the restore path explicit, and nothing is ever deleted (§3).
 */
export function openRetireClientModal({
  clientName,
  onConfirm,
}: OpenRetireClientModalOptions): void {
  openReasonConfirmModal({
    title: "Retire client",
    parentLabel: "Clients",
    tone: "danger",
    alertTitle: "This marks the partner as retired",
    description: `${clientName} stays in the directory and can be restored later — nothing is deleted. A reason is required.`,
    reasonLabel: "Reason",
    reasonPlaceholder: "e.g. No longer an active partner",
    confirmLabel: "Retire client",
    confirmColor: "red",
    onConfirm,
  });
}
