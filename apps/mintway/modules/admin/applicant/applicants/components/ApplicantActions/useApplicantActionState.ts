"use client";

import { useState } from "react";
import { useQueryClient } from "@peppermint/ui";
import { openReasonConfirmModal } from "@peppermint/admin";

import {
  applicantKeys,
  archiveApplicant,
  getApplicant,
  lockApplicant,
  unlockApplicant,
  useApplicantMutation,
} from "../../../_shared";
import type { Applicant, ApplicantActionTarget } from "../../../_shared";

/**
 * Owns the admin action surface for one applicant: lock / unlock / archive (each a
 * required-reason confirm) plus open/close state for the transition and merge modals.
 * Both the list row menu and the overview action bar consume this so the mutation +
 * invalidation logic lives in one place.
 */
export function useApplicantActionState(applicant: ApplicantActionTarget) {
  const queryClient = useQueryClient();
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

  /**
   * `record_version` cannot be read off `applicant` — the list projection omits it, so
   * a row-sourced value serialises to `undefined` and the key drops out of the DELETE
   * body ("This field is required").
   *
   * It is resolved through the `detail` query cache rather than an unconditional GET.
   * That distinction matters: a fresh read immediately before the write would echo a
   * version that cannot possibly be stale, silently disabling the conflict check the
   * contract requires. Going through `fetchQuery` echoes the version the user actually
   * last read whenever the detail is cached, so a concurrent edit still surfaces as
   * APPLICANT_VERSION_CONFLICT; it only falls back to a network read when archiving
   * from a list row the user never opened, where no read version exists to defend.
   */
  const archive = useApplicantMutation<void, string>({
    mutationFn: async (reason) => {
      const current = await queryClient.fetchQuery({
        queryKey: applicantKeys.detail(applicant.id),
        queryFn: () => getApplicant(applicant.id),
        staleTime: Infinity,
      });
      return archiveApplicant(applicant.id, current.record_version, reason);
    },
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
