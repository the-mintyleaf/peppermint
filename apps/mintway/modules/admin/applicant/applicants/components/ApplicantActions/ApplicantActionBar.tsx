"use client";

import { Button, Group } from "@peppermint/ui";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { LockKeyOpenIcon } from "@phosphor-icons/react/dist/csr/LockKeyOpen";
import { GitMergeIcon } from "@phosphor-icons/react/dist/csr/GitMerge";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";

import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { ApplicantActionTarget } from "../../../_shared";
import { TransitionModal } from "./TransitionModal";
import { MergeModal } from "./MergeModal";
import { useApplicantActionState } from "./useApplicantActionState";

interface ApplicantActionBarProps {
  applicant: ApplicantActionTarget;
  /** Opens the overview's own edit modal. */
  onEdit: () => void;
}

/**
 * Overview action bar. Edit is staff-reachable; the admin levers (lifecycle, lock,
 * merge, archive) render only for admin/superadmin. The destructive Archive is visually
 * separated (light red) from the neutral actions.
 */
export function ApplicantActionBar({
  applicant,
  onEdit,
}: ApplicantActionBarProps) {
  const { isAdmin } = useCurrentUser();
  const state = useApplicantActionState(applicant);
  const isArchived = Boolean(applicant.archived_at);
  const isMerged = Boolean(applicant.merged_into);
  const isTerminal = isArchived || isMerged;

  return (
    <>
      <Group gap="xs">
        <Button
          variant="default"
          size="xs"
          leftSection={<PencilSimpleIcon size={14} />}
          onClick={onEdit}
        >
          Edit
        </Button>
        {isAdmin && (
          <>
            <Button
              variant="default"
              size="xs"
              leftSection={<ArrowsLeftRightIcon size={14} />}
              onClick={() => state.setTransitionOpen(true)}
              disabled={isTerminal}
            >
              Change lifecycle
            </Button>
            <Button
              variant="default"
              size="xs"
              leftSection={
                applicant.is_locked ? (
                  <LockKeyOpenIcon size={14} />
                ) : (
                  <LockKeyIcon size={14} />
                )
              }
              // Locking a terminal record 409s; unlocking one is still valid.
              disabled={!applicant.is_locked && isTerminal}
              onClick={() =>
                applicant.is_locked ? state.openUnlock() : state.openLock()
              }
            >
              {applicant.is_locked ? "Unlock" : "Lock"}
            </Button>
            <Button
              variant="default"
              size="xs"
              leftSection={<GitMergeIcon size={14} />}
              disabled={isTerminal}
              onClick={() => state.setMergeOpen(true)}
            >
              Merge
            </Button>
            {!isArchived && (
              <Button
                variant="light"
                color="red"
                size="xs"
                leftSection={<ArchiveIcon size={14} />}
                onClick={() => state.openArchive()}
              >
                Archive
              </Button>
            )}
          </>
        )}
      </Group>

      <TransitionModal
        applicant={applicant}
        opened={state.transitionOpen}
        onClose={() => state.setTransitionOpen(false)}
      />
      <MergeModal
        applicant={applicant}
        opened={state.mergeOpen}
        onClose={() => state.setMergeOpen(false)}
      />
    </>
  );
}
