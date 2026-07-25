"use client";

import { openReasonConfirmModal } from "@peppermint/admin";
import type { UploadedFile } from "../uploadedFiles.types";

/**
 * Archive confirm — built on `openReasonConfirmModal` (CLAUDE.md Framework
 * Primitives) rather than a hand-rolled modal, matching `RetireClientModal`'s
 * pattern. The reason is mandatory (`UPLOADED_FILES_ARCHIVE_REASON_REQUIRED`),
 * which is the primitive's default. Archiving is fully reversible — restore
 * clears all three archive fields and keeps no trace it ever happened (§CONCEPT).
 * Shared between `FileRowActionsMenu` (panel) and `FileDetail` (lifecycle buttons).
 */
export function openArchiveFileModal(
  file: UploadedFile,
  onConfirm: (reason: string) => Promise<void>,
): void {
  openReasonConfirmModal({
    title: "Archive file",
    parentLabel: "Files",
    tone: "danger",
    alertTitle: "This removes the file from active use",
    description: `${file.original_filename} stays in its version history and can be restored later — nothing is deleted. A reason is required.`,
    reasonLabel: "Reason",
    reasonPlaceholder: "e.g. Duplicate of a later upload",
    confirmLabel: "Archive file",
    confirmColor: "red",
    onConfirm,
  });
}

/**
 * Restore confirm — `note` is optional and audit-only (never stored on the
 * record, never returned, §7), so the reason field is shown but not required
 * — the opposite of Archive's mandatory reason.
 */
export function openRestoreFileModal(
  file: UploadedFile,
  onConfirm: (note: string) => Promise<void>,
): void {
  openReasonConfirmModal({
    title: "Restore file",
    parentLabel: "Files",
    reasonRequired: false,
    reasonLabel: "Note (optional)",
    reasonPlaceholder: "Anything worth recording about the restore",
    tone: "info",
    alertTitle: "This returns the file to active use",
    description: `${file.original_filename} will appear in active file lists again.`,
    confirmLabel: "Restore file",
    confirmColor: "teal",
    onConfirm,
  });
}
