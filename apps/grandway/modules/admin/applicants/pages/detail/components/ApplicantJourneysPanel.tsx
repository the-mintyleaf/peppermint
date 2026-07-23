"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
} from "@peppermint/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { QueryErrorState } from "@/components/QueryErrorState";
// Concrete-file imports, not the `applicant-journeys` barrel — that barrel's
// `form/index.ts` re-exports `JourneyForm`, which itself imports the
// `applicants` barrel for its picker hooks. Importing the barrel here would
// close a cross-module cycle (applicants barrel -> this panel ->
// applicant-journeys barrel -> JourneyForm -> applicants barrel).
import {
  useCreateJourney,
  useJourneyList,
} from "@/modules/admin/applicant-journeys/applicantJourneys.hooks";
import {
  STAGE_COLORS,
  STAGE_LABELS,
} from "@/modules/admin/applicant-journeys/applicantJourneys.labels";
import type { ApplicantJourney } from "@/modules/admin/applicant-journeys/applicantJourneys.types";
import {
  JourneyForm,
  toJourneyPayload,
} from "@/modules/admin/applicant-journeys/form/JourneyForm";

/**
 * The per-person view `CONCEPT.md` calls the primary entry point for
 * journeys (the standalone worklist is secondary). Cards, not a table —
 * this is a related-records region on a Detail page (`DESIGN.md` Part 5B),
 * not the module's own list surface.
 */
export function ApplicantJourneysPanel({
  applicantId,
}: {
  applicantId: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError, isRefetching, refetch } = useJourneyList({
    page: 1,
    pageSize: 50,
    search: "",
    sort: [],
    filters: { applicant: applicantId },
  });
  const journeys = data?.data ?? [];
  const createMutation = useCreateJourney();

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          Study objectives for this applicant
        </Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="default"
            component={Link}
            href={`/admin/applicant-journeys?applicant=${applicantId}`}
            rightSection={<ArrowSquareOutIcon size={14} aria-hidden />}
          >
            View in worklist
          </Button>
          <Button
            size="xs"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={() => setCreateOpen(true)}
          >
            New journey
          </Button>
        </Group>
      </Group>

      {isLoading ? (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      ) : isError ? (
        <QueryErrorState
          message="Couldn't load journeys."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : journeys.length === 0 ? (
        <Text size="xs" c="dimmed">
          No journeys yet — add this applicant&apos;s first study objective.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {journeys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New journey"
      >
        <JourneyForm
          applicantId={applicantId}
          isLoading={createMutation.isPending}
          onSubmit={(values) => {
            createMutation.mutate(toJourneyPayload(values), {
              onSuccess: () => setCreateOpen(false),
            });
          }}
        />
      </Modal>
    </Stack>
  );
}

function JourneyCard({ journey }: { journey: ApplicantJourney }) {
  return (
    <Card
      withBorder
      padding="sm"
      component={Link}
      href={`/admin/applicant-journeys/${journey.id}`}
    >
      <Stack gap={4}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text size="sm" fw={500}>
            {journey.target_country || "Destination not decided"}
          </Text>
          <Badge size="xs" color={STAGE_COLORS[journey.stage]}>
            {STAGE_LABELS[journey.stage]}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          {journey.preferred_intake || "Intake not set"}
        </Text>
      </Stack>
    </Card>
  );
}
