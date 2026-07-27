"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import type { OpenJourneysButtonProps } from "./OpenJourneysButton.types";
import { applicantDisplayName } from "../../../../applicants.labels";

/**
 * List-row quick entry into an applicant's journeys — the row-level analog of
 * `OpenDocumentButton`. One click checks whether the applicant has any journeys
 * (through React Query, priming the same cache the worklist/detail panel read
 * under `journeyQueryKeys.list`): if so it opens the worklist deep-linked to
 * this applicant; if none, it opens the "New journey" form with the applicant
 * preset, so the operator never lands on an empty view.
 *
 * Not admin-gated: journeys are visible to Lead Managers too (the Applicant
 * Detail Journeys panel already renders for them), unlike documents.
 */
export function OpenJourneysButton({ applicant }: OpenJourneysButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isChecking, setChecking] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
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

  const goToWorklist = () =>
    router.push(`/admin/applicant-journeys?applicant=${applicant.id}`);

  const handleClick = async () => {
    setChecking(true);
    try {
      const result = await queryClient.fetchQuery({
        queryKey: journeyQueryKeys.list(listParams),
        queryFn: () => listJourneys(listParams),
      });

      if ((result.meta.total ?? result.data.length) > 0) {
        goToWorklist();
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
      <Tooltip label="Journeys" withArrow>
        <ActionIcon
          variant="subtle"
          size="sm"
          color="gray"
          aria-label={`Journeys for ${displayName}`}
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
                goToWorklist();
              },
            });
          }}
        />
      </Modal>
    </>
  );
}
