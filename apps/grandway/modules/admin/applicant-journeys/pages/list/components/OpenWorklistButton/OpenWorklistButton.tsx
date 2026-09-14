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
import { WorklistDrawer } from "@/modules/admin/checklists/_shared/WorklistDrawer";
import { listChecklists } from "@/modules/admin/checklists/checklists.api";
import { checklistQueryKeys } from "@/modules/admin/checklists/checklists.queryKeys";
import { journeyChecklistListParams } from "../../../../applicantJourneys.checklist";
import type { OpenWorklistButtonProps } from "./OpenWorklistButton.types";

/**
 * Opens a journeys-worklist row's checklist — the per-journey "worklist" —
 * beside the table instead of leaving it. Rendered only for Profile
 * Building journeys (the caller gates on `stage`). One click resolves the
 * checklist id (the row carries a journey id, and the worklist is keyed by
 * checklist id) and opens the `WorklistDrawer` on it, so items can be set
 * without losing the board and its filters. Only the "there is no worklist
 * yet" case still navigates — creating one lives on the journey's own page.
 */
export function OpenWorklistButton({ journey }: OpenWorklistButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpening, setOpening] = useState(false);
  // Kept after closing: the drawer stays mounted-but-closed so it can play its
  // exit animation, and a closed drawer renders nothing anyway. Until the first
  // click there is no drawer on the row at all.
  const [worklistId, setWorklistId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClick = async () => {
    setOpening(true);
    try {
      const params = journeyChecklistListParams(journey.id);
      const result = await queryClient.fetchQuery({
        queryKey: checklistQueryKeys.list(params),
        queryFn: () => listChecklists(params),
      });
      const checklist = result.data[0];
      if (checklist) {
        setWorklistId(checklist.id);
        setDrawerOpen(true);
        setOpening(false);
      } else {
        // No worklist yet — creating one lives on the journey's own page, so
        // this is the one branch that still navigates. The spinner stays up
        // until the route lands.
        router.push(`/admin/applicant-journeys/${journey.id}`);
      }
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
    <>
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

      {worklistId ? (
        <WorklistDrawer
          worklistId={worklistId}
          opened={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      ) : null}
    </>
  );
}
