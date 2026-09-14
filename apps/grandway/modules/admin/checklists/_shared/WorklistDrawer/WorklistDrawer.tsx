"use client";

import { useState } from "react";
import { Button, Drawer, Title } from "@peppermint/ui";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { WorklistPickerPanel } from "./WorklistPickerPanel";
import { WorklistProfilePanel } from "./WorklistProfilePanel";
import type { WorklistDrawerProps } from "./WorklistDrawer.types";

/**
 * Requirement worklists as a side surface rather than a route: pick one and
 * work it where you already are. Every entry point that used to push a page —
 * the applicant list's row icon, the applicant's Journeys tab, the journey
 * list's worklist icon — opens this instead, so the board or profile behind it
 * stays in view.
 *
 * It costs its host page nothing until it is used. A closed Mantine drawer
 * renders no children, so mounting it issues no request; the picker's list
 * query runs on the first open and the detail query only for the worklist
 * actually opened. React Query keeps both, so reopening is instant and
 * revalidates in the background.
 */
export function WorklistDrawer({
  applicantId,
  worklistId,
  opened,
  onClose,
}: WorklistDrawerProps) {
  const [pickedId, setPickedId] = useState<string | null>(null);

  // A drawer opened on a known worklist has nothing to go back to; one opened
  // on an applicant does, as soon as something is picked.
  const shownId = worklistId ?? pickedId;
  const canGoBack = worklistId === undefined && pickedId !== null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      // Back to the picker only once the drawer is actually gone — resetting on
      // the click would swap the panel under the closing animation.
      onExitTransitionEnd={() => setPickedId(null)}
      position="right"
      size="lg"
      title={
        canGoBack ? (
          <Button
            variant="subtle"
            color="gray"
            size="compact-xs"
            leftSection={<CaretLeftIcon size={12} aria-hidden />}
            onClick={() => setPickedId(null)}
          >
            All worklists
          </Button>
        ) : (
          <Title order={4}>{shownId ? "Worklist" : "Worklists"}</Title>
        )
      }
    >
      {shownId ? (
        <WorklistProfilePanel worklistId={shownId} />
      ) : applicantId ? (
        <WorklistPickerPanel applicantId={applicantId} onSelect={setPickedId} />
      ) : null}
    </Drawer>
  );
}
