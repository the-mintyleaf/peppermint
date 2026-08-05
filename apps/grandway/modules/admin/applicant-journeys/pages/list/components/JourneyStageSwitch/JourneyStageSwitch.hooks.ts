"use client";

import { useState } from "react";
import { useQueryClient } from "@peppermint/ui";
// Concrete-file imports of the `checklists` module (never its barrel) — no
// cycle: these files don't import applicant-journeys.
import { listChecklists } from "@/modules/admin/checklists/checklists.api";
import { checklistQueryKeys } from "@/modules/admin/checklists/checklists.queryKeys";
import { journeyChecklistListParams } from "../../../../applicantJourneys.checklist";

/**
 * Profile Building is the stage where the journey's worklist starts being
 * worked, so entering it is the moment to have one — but *which* one is a
 * judgement call (which country template, or a blank list), and that call
 * belongs to the person moving the stage. This asks instead of deciding: after
 * a successful move it looks for an existing active worklist and, only when
 * there is none, opens the create form.
 *
 * Reads through the same `checklistQueryKeys.list` entry the Worklist tab uses
 * (shared params in `applicantJourneys.checklist.ts`), so a worklist created
 * here shows up there without a refetch.
 */
export function useWorklistPrompt(journeyId: string) {
  const queryClient = useQueryClient();
  const [isOpen, setOpen] = useState(false);

  const promptIfMissing = async () => {
    const params = journeyChecklistListParams(journeyId);
    let existing;
    try {
      existing = await queryClient.fetchQuery({
        queryKey: checklistQueryKeys.list(params),
        queryFn: () => listChecklists(params),
      });
    } catch {
      // Couldn't confirm whether one exists — don't prompt on a guess. The
      // journey's Worklist tab still offers explicit creation.
      return;
    }
    if (existing.data.length === 0) setOpen(true);
  };

  return { isOpen, close: () => setOpen(false), promptIfMissing };
}
