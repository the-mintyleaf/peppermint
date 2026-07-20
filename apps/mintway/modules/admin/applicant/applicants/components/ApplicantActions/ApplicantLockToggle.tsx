"use client";

import { ActionIcon, Tooltip } from "@peppermint/ui";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { LockKeyOpenIcon } from "@phosphor-icons/react/dist/csr/LockKeyOpen";

import type { ApplicantActionTarget } from "../../../_shared";
import { useApplicantActionState } from "./useApplicantActionState";

/**
 * Interactive lock/unlock control shown before the applicant name in the list.
 * Admin-only: it reuses the shared reason-confirm modals so the inline toggle and the
 * row-action menu never drift. Unlocking a terminal (archived/merged) record is still
 * valid, but locking one 409s — so on an unlocked terminal record there's nothing to
 * offer and the control is omitted.
 */
export function ApplicantLockToggle({
  applicant,
}: {
  applicant: ApplicantActionTarget;
}) {
  const state = useApplicantActionState(applicant);
  const locked = applicant.is_locked;

  if (
    !locked &&
    (Boolean(applicant.archived_at) || Boolean(applicant.merged_into))
  )
    return null;

  return (
    <Tooltip
      label={locked ? "Locked — click to unlock" : "Click to lock"}
      withArrow
    >
      <ActionIcon
        variant="subtle"
        size="sm"
        color={locked ? "orange" : "gray"}
        aria-label={locked ? "Unlock applicant" : "Lock applicant"}
        onClick={() => (locked ? state.openUnlock() : state.openLock())}
      >
        {locked ? (
          <LockKeyIcon size={14} weight="fill" />
        ) : (
          <LockKeyOpenIcon size={14} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}
