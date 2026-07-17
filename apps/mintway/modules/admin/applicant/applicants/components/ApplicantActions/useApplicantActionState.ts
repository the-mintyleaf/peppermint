"use client";

import { useState } from "react";
import { openReasonConfirmModal } from "@peppermint/admin";

import {
  applicantKeys,
  archiveApplicant,
  lockApplicant,
  unlockApplicant,
  useApplicantMutation,
} from "../../../_shared";
import type { Applicant } from "../../../_shared";

/**
 * Owns the admin action surface for one applicant: lock / unlock / archive (each a
 * required-reason confirm) plus open/close state for the transition and merge modals.
 * Both the list row menu and the overview action bar consume this so the mutation +
 * invalidation logic lives in one place.
 */
export function useApplicantActionState(applicant: Applicant) {
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);

  const invalidateKeys = [
    applicantKeys.lists(),
    applicantKeys.detail(applicant.id),
  ];

  const lock = useApplicantMutation<Applicant, string>({
    mutationFn: (reason) => lockApplicant(applicant.id, reason),
    successTitle: "Applicant locked",
    successMessage: "Staff can no longer edit this record.",
    errorTitle: "Couldn't lock applicant",
    invalidateKeys,
  });

  const unlock = useApplicantMutation<Applicant, string>({
    mutationFn: (reason) => unlockApplicant(applicant.id, reason),
    successTitle: "Applicant unlocked",
    successMessage: "Staff can edit this record again.",
    errorTitle: "Couldn't unlock applicant",
    invalidateKeys,
  });

  const archive = useApplicantMutation<void, string>({
    mutationFn: (reason) =>
      archiveApplicant(applicant.id, applicant.record_version, reason),
    successTitle: "Applicant archived",
    successMessage: `${applicant.full_name} was archived.`,
    errorTitle: "Couldn't archive applicant",
    invalidateKeys,
  });

  const openLock = () =>
    openReasonConfirmModal({
      title: "Lock applicant",
      alertTitle: "Staff can no longer edit this record",
      description:
        "While locked, staff can't edit this applicant or its addresses. Admins can still make changes.",
      tone: "warning",
      confirmLabel: "Lock",
      confirmColor: "orange",
      onConfirm: async (reason) => {
        await lock.mutateAsync(reason);
      },
    });

  const openUnlock = () =>
    openReasonConfirmModal({
      title: "Unlock applicant",
      description: "Staff will be able to edit this applicant again.",
      confirmLabel: "Unlock",
      onConfirm: async (reason) => {
        await unlock.mutateAsync(reason);
      },
    });

  const openArchive = () =>
    openReasonConfirmModal({
      title: "Archive applicant",
      alertTitle: "This removes them from active lists",
      description:
        "Archiving takes this applicant off active lists. You can reactivate them later — this isn't a permanent delete.",
      tone: "warning",
      confirmLabel: "Archive",
      confirmColor: "red",
      onConfirm: async (reason) => {
        await archive.mutateAsync(reason);
      },
    });

  return {
    transitionOpen,
    setTransitionOpen,
    mergeOpen,
    setMergeOpen,
    openLock,
    openUnlock,
    openArchive,
  };
}
