"use client";

import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Modal,
  Text,
  Tooltip,
  notifications,
  useQueryClient,
} from "@peppermint/ui";
import { AirplaneTakeoffIcon } from "@phosphor-icons/react/dist/csr/AirplaneTakeoff";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
// Concrete-file imports (not the `applicant-journeys` barrel) — the barrel's
// `JourneyForm` imports the `applicants` barrel, so a barrel import here would
// close a cross-module cycle. Same rule as `ApplicantJourneysPanel`.
import { listJourneys } from "@/modules/admin/applicant-journeys/applicantJourneys.api";
import { useCreateJourney } from "@/modules/admin/applicant-journeys/applicantJourneys.hooks";
import { journeyQueryKeys } from "@/modules/admin/applicant-journeys/applicantJourneys.queryKeys";
import {
  JourneyForm,
  toJourneyPayload,
} from "@/modules/admin/applicant-journeys/form/JourneyForm";
import { WorklistDrawer } from "@/modules/admin/checklists/_shared/WorklistDrawer";
import type { OpenJourneysButtonProps } from "./OpenJourneysButton.types";
import { applicantDisplayName } from "../../../../applicants.labels";

/**
 * List-row quick entry into an applicant's requirement worklists — the
 * row-level analog of `OpenDocumentButton`. One click checks whether the
 * applicant has any journeys at all (through React Query, priming the same
 * cache the journeys worklist and detail panel read under
 * `journeyQueryKeys.list`): if so it opens the `WorklistDrawer` over the
 * table — the row stays where it is, and the operator can set item statuses
 * without a page change; if none, it opens the "New journey" form with the
 * applicant preset, since worklists hang off journeys and there is nothing to
 * show yet.
 *
 * Not admin-gated: journeys are visible to Lead Managers too (the Applicant
 * Detail Journeys panel already renders for them), unlike documents.
 */
export function OpenJourneysButton({ applicant }: OpenJourneysButtonProps) {
  const queryClient = useQueryClient();
  const [isChecking, setChecking] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [worklistsOpen, setWorklistsOpen] = useState(false);
  const createMutation = useCreateJourney();

  const displayName = applicantDisplayName(applicant);

  // Same params the detail panel uses, so the fetch primes/reuses that cache.
  const listParams = {
    page: 1,
    pageSize: 50,
    search: "",
    sort: [],
    filters: { applicant: applicant.id },
  };

  const handleClick = async () => {
    setChecking(true);
    try {
      const result = await queryClient.fetchQuery({
        queryKey: journeyQueryKeys.list(listParams),
        queryFn: () => listJourneys(listParams),
      });

      if ((result.meta.total ?? result.data.length) > 0) {
        setWorklistsOpen(true);
        return;
      }

      setCreateOpen(true);
    } catch {
      notifications.show({
        title: "Couldn't open journeys",
        message: "Please try again.",
        color: "red",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <Tooltip label="Worklists" withArrow>
        <ActionIcon
          variant="subtle"
          size="sm"
          color="gray"
          aria-label={`Worklists for ${displayName}`}
          loading={isChecking}
          onClick={handleClick}
        >
          <AirplaneTakeoffIcon size={16} aria-hidden />
        </ActionIcon>
      </Tooltip>

      <Modal
        size="lg"
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New journey"
      >
        <Alert
          icon={<WarningIcon size={16} aria-hidden />}
          color="yellow"
          m="md"
          mb={0}
        >
          <Text size="xs">
            {displayName} has no journeys yet — add their first study objective.
          </Text>
        </Alert>
        <JourneyForm
          applicantId={applicant.id}
          isLoading={createMutation.isPending}
          onSubmit={(values) => {
            createMutation.mutate(toJourneyPayload(values), {
              onSuccess: () => {
                setCreateOpen(false);
                // The new journey's worklist is created from its destination
                // country's template server-side, so the drawer is where the
                // result of this form actually shows up.
                setWorklistsOpen(true);
              },
            });
          }}
        />
      </Modal>

      <WorklistDrawer
        applicantId={applicant.id}
        opened={worklistsOpen}
        onClose={() => setWorklistsOpen(false)}
      />
    </>
  );
}
