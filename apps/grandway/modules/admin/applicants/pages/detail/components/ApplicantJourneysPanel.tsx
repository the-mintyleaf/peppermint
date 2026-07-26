"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  dayjs,
} from "@peppermint/ui";
import { AirplaneTakeoffIcon } from "@phosphor-icons/react/dist/csr/AirplaneTakeoff";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ProfileCard, ProfileSection } from "@/components/profile";
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
 * The per-person view `CONCEPT.md` calls the primary entry point for journeys
 * (the standalone worklist is secondary). Cards, not a table — this is a
 * related-records region on a Detail page (`DESIGN.md` Part 5B).
 */
export function ApplicantJourneysPanel({
  applicantId,
}: {
  applicantId: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, isRefetching, refetch } = useJourneyList({
    page: 1,
    pageSize: 50,
    search: "",
    sort: [],
    filters: { applicant: applicantId },
  });
  const journeys = useMemo(() => data?.data ?? [], [data?.data]);
  const createMutation = useCreateJourney();
  // Search filters only the loaded page (capped at 50). When more exist
  // server-side, say so — a local "no match" isn't proof none exist.
  const truncated = (data?.meta.total ?? 0) > journeys.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return journeys;
    return journeys.filter((j) =>
      [
        j.target_country,
        j.target_institution_name,
        j.target_program_name,
        j.preferred_intake,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q)),
    );
  }, [journeys, search]);

  return (
    <ProfileSection
      title="Journeys"
      description="Study objectives for this applicant"
      action={
        <Group gap="xs" wrap="nowrap">
          {journeys.length > 0 ? (
            <TextInput
              size="xs"
              placeholder="Search journeys"
              aria-label="Search journeys"
              leftSection={<MagnifyingGlassIcon size={14} aria-hidden />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
          ) : null}
          <Button
            size="xs"
            variant="default"
            component={Link}
            href={`/admin/applicant-journeys?applicant=${applicantId}`}
            rightSection={<ArrowSquareOutIcon size={14} aria-hidden />}
          >
            Worklist
          </Button>
          <Button
            size="xs"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={() => setCreateOpen(true)}
          >
            New
          </Button>
        </Group>
      }
    >
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
      ) : filtered.length === 0 ? (
        <Text size="xs" c="dimmed">
          No journeys match &ldquo;{search}&rdquo;
          {truncated
            ? " on this page — open the worklist to search them all"
            : ""}
          .
        </Text>
      ) : (
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {filtered.map((journey) => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          </SimpleGrid>
          {truncated ? (
            <Text size="xs" c="dimmed" ta="center">
              Showing the {journeys.length} most recent journeys — open the
              worklist for the full list.
            </Text>
          ) : null}
        </Stack>
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
    </ProfileSection>
  );
}

function JourneyCard({ journey }: { journey: ApplicantJourney }) {
  const subtitle =
    journey.target_institution_name ||
    journey.target_program_name ||
    journey.preferred_intake ||
    "Objective not detailed yet";

  return (
    <ProfileCard href={`/admin/applicant-journeys/${journey.id}`}>
      <Group align="flex-start" wrap="nowrap" gap="sm">
        <ThemeIcon variant="light" color="blue" size="md" radius="xl">
          <AirplaneTakeoffIcon size={14} aria-hidden />
        </ThemeIcon>
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group
            justify="space-between"
            align="flex-start"
            wrap="nowrap"
            gap="xs"
          >
            <Text size="sm" fw={600}>
              {journey.target_country || "Destination not decided"}
            </Text>
            <Badge
              size="xs"
              variant="light"
              color={STAGE_COLORS[journey.stage]}
            >
              {STAGE_LABELS[journey.stage]}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {subtitle}
          </Text>
          <Group gap={6} wrap="nowrap">
            <Text size="xs" c="dimmed">
              {journey.preferred_intake || "Intake not set"}
            </Text>
            <Text size="xs" c="dimmed">
              ·
            </Text>
            <Text size="xs" c="dimmed">
              Added {dayjs(journey.created_at).format("MMM D, YYYY")}
            </Text>
          </Group>
        </Stack>
      </Group>
    </ProfileCard>
  );
}
