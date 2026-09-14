"use client";

import { useState } from "react";
import { Button, Drawer, Title } from "@peppermint/ui";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { WorklistPickerPanel } from "./WorklistPickerPanel";
import { WorklistProfilePanel } from "./WorklistProfilePanel";
import type { ApplicantWorklistsDrawerProps } from "./ApplicantWorklistsDrawer.types";

/**
 * The applicant's requirement worklists, two levels deep in one surface: pick a
 * worklist, then work it — instead of the applicant → journeys list → journey →
 * worklist tab → worklist page walk it used to take.
 *
 * It costs the applicant page nothing until someone opens it. A closed Mantine
 * drawer renders no children, and every query lives in the panels below, so the
 * page mounts this component without issuing a single extra request; the first
 * open fetches the list, and picking a worklist fetches only that one. React
 * Query holds both afterwards, so a second open is instant and revalidates in
 * the background.
 */
export function ApplicantWorklistsDrawer({
  applicantId,
  opened,
  onClose,
}: ApplicantWorklistsDrawerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      // Back to the picker only once the drawer is actually gone — resetting on
      // the click would swap the panel under the closing animation.
      onExitTransitionEnd={() => setSelectedId(null)}
      position="right"
      size="lg"
      title={
        selectedId ? (
          <Button
            variant="subtle"
            color="gray"
            size="compact-xs"
            leftSection={<CaretLeftIcon size={12} aria-hidden />}
            onClick={() => setSelectedId(null)}
          >
            All worklists
          </Button>
        ) : (
          <Title order={4}>Worklists</Title>
        )
      }
    >
      {selectedId ? (
        <WorklistProfilePanel worklistId={selectedId} />
      ) : (
        <WorklistPickerPanel
          applicantId={applicantId}
          onSelect={setSelectedId}
        />
      )}
    </Drawer>
  );
}
