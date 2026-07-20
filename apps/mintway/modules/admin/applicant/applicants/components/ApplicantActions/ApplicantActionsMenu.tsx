"use client";

import { RowActionsMenu, useModalTableShellContext } from "@peppermint/admin";
import type { RowAction } from "@peppermint/admin";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { LockKeyOpenIcon } from "@phosphor-icons/react/dist/csr/LockKeyOpen";
import { GitMergeIcon } from "@phosphor-icons/react/dist/csr/GitMerge";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";

import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import type { ApplicantActionTarget } from "../../../_shared";
import { useApplicantProfile } from "../ApplicantProfileModal/ApplicantProfileModal.context";
import { TransitionModal } from "./TransitionModal";
import { MergeModal } from "./MergeModal";
import { useApplicantActionState } from "./useApplicantActionState";

/**
 * Row-action menu for the applicants list. View + Edit are staff-reachable; lifecycle,
 * lock/unlock, merge, and archive are admin-only (hidden, not just disabled, so staff
 * never see an action the server would 403/404). Edit routes through the shell's edit
 * modal.
 */
export function ApplicantActionsMenu({
  applicant,
}: {
  applicant: ApplicantActionTarget;
}) {
  const { isAdmin } = useCurrentUser();
  const { openEditModal } = useModalTableShellContext<ApplicantActionTarget>();
  const { openProfile } = useApplicantProfile();
  const state = useApplicantActionState(applicant);

  const notAdmin = () => !isAdmin;

  const actions: RowAction<ApplicantActionTarget>[] = [
    {
      label: "View",
      icon: <EyeIcon size={16} />,
      onClick: (r) => openProfile(r.id),
    },
    {
      label: "Edit",
      icon: <PencilSimpleIcon size={16} />,
      // A locked record rejects staff writes with a 423. Disable rather than hide,
      // so the reason the action is unavailable stays visible — and rather than let
      // staff fill in a form that cannot be saved. Admins keep editing while locked.
      disabled: (r) => !isAdmin && r.is_locked,
      onClick: (r) => openEditModal(r),
    },
    {
      label: "Change lifecycle",
      icon: <ArrowsLeftRightIcon size={16} />,
      dividerBefore: true,
      hidden: (r) => notAdmin() || Boolean(r.archived_at),
      onClick: () => state.setTransitionOpen(true),
    },
    {
      label: applicant.is_locked ? "Unlock" : "Lock",
      icon: applicant.is_locked ? (
        <LockKeyOpenIcon size={16} />
      ) : (
        <LockKeyIcon size={16} />
      ),
      // Locking a terminal (archived/merged) record 409s; unlocking one is still valid.
      hidden: (r) =>
        notAdmin() ||
        (!r.is_locked && (Boolean(r.archived_at) || Boolean(r.merged_into))),
      onClick: () =>
        applicant.is_locked ? state.openUnlock() : state.openLock(),
    },
    {
      label: "Merge…",
      icon: <GitMergeIcon size={16} />,
      hidden: (r) =>
        notAdmin() || Boolean(r.archived_at) || Boolean(r.merged_into),
      onClick: () => state.setMergeOpen(true),
    },
    {
      label: "Archive",
      icon: <ArchiveIcon size={16} />,
      color: "red",
      dividerBefore: true,
      hidden: (r) => notAdmin() || Boolean(r.archived_at),
      onClick: () => state.openArchive(),
    },
  ];

  return (
    <>
      <RowActionsMenu record={applicant} actions={actions} />
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
