"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Tooltip,
  notifications,
  useQueryClient,
} from "@peppermint/ui";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
// Concrete-file imports of the `checklists` module (never its barrel) — no cycle:
// these files don't import applicant-journeys.
import { listChecklists } from "@/modules/admin/checklists/checklists.api";
import { checklistQueryKeys } from "@/modules/admin/checklists/checklists.queryKeys";
import { journeyChecklistListParams } from "../../../../applicantJourneys.checklist";
import type { OpenWorklistButtonProps } from "./OpenWorklistButton.types";

/**
 * Quick jump from a journeys-worklist row to that journey's checklist — the
 * per-journey "worklist". Rendered only for Profile Building journeys (the
 * caller gates on `stage`). One click resolves the checklist id (the checklist
 * route keys off checklist id, not journey id) and opens it; if none exists yet
 * it falls back to the journey's own Checklist tab, where one can be created.
 */
export function OpenWorklistButton({ journey }: OpenWorklistButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpening, setOpening] = useState(false);

  const handleClick = async () => {
    setOpening(true);
    try {
      const params = journeyChecklistListParams(journey.id);
      const result = await queryClient.fetchQuery({
        queryKey: checklistQueryKeys.list(params),
        queryFn: () => listChecklists(params),
      });
      const checklist = result.data[0];
      router.push(
        checklist
          ? `/admin/checklists/${checklist.id}`
          : `/admin/applicant-journeys/${journey.id}`,
      );
    } catch {
      notifications.show({
        title: "Couldn't open worklist",
        message: "Please try again.",
        color: "red",
      });
      setOpening(false);
    }
  };

  return (
    <Tooltip label="Open worklist" withArrow>
      <ActionIcon
        variant="subtle"
        size="sm"
        color="gray"
        aria-label="Open worklist"
        loading={isOpening}
        onClick={handleClick}
      >
        <ListChecksIcon size={16} aria-hidden />
      </ActionIcon>
    </Tooltip>
  );
}
