"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@peppermint/admin";
import {
  Anchor,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
  dayjs,
} from "@peppermint/ui";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import {
  ProfileList,
  ProfileListRow,
  ProfilePanelHeader,
} from "@/components/profile";
import { QueryErrorState } from "@/components/QueryErrorState";
// Concrete-file imports, not the `applicant-journeys` barrel — that barrel's
// `form/index.ts` re-exports `JourneyForm`, which itself imports the
// `applicants` barrel for its picker hooks. Importing the barrel here would
// close a cross-module cycle (applicants barrel -> this panel ->
// applicant-journeys barrel -> JourneyForm -> applicants barrel).
import {
  useCreateJourney,
  useJourneyDetail,
  useJourneyList,
  useUpdateJourney,
} from "@/modules/admin/applicant-journeys/applicantJourneys.hooks";
import {
  STAGE_COLORS,
  STAGE_LABELS,
} from "@/modules/admin/applicant-journeys/applicantJourneys.labels";
import type { ApplicantJourney } from "@/modules/admin/applicant-journeys/applicantJourneys.types";
import {
  JourneyForm,
  toJourneyPayload,
  toJourneyUpdatePayload,
} from "@/modules/admin/applicant-journeys/form/JourneyForm";
import { CloseJourneyModal } from "@/modules/admin/applicant-journeys/pages/list/components/CloseJourneyModal";
import { ApplicantWorklistsDrawer } from "./ApplicantWorklistsDrawer";

/** Already ended — Close would have nothing left to do (`FLOWS.md`, "End an objective"). */
const ENDED_STAGES = new Set(["completed", "closed"]);

/**
 * The per-person view `CONCEPT.md` calls the primary entry point for journeys
 * (the standalone worklist is secondary). A full-width list, not cards: a
 * journey row has to carry a destination, a stage, an intake, a date and its
 * own actions menu, and a half-column card could not hold all five on one line.
 *
 * There is no delete. A journey that should not have existed is closed with the
 * `cancelled` outcome (`applicant_journeys/docs/API.md` §1.4) — reversible via
 * Reopen and kept in the audit trail, which a delete would destroy.
 */
export function ApplicantJourneysPanel({
  applicantId,
}: {
  applicantId: string;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [closingJourney, setClosingJourney] = useState<ApplicantJourney | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [worklistsOpen, setWorklistsOpen] = useState(false);

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
    <Stack gap="md">
      <ProfilePanelHeader
        title="Journeys"
        description="Study objectives for this applicant"
        count={journeys.length || undefined}
        action={
          <>
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
            {/* "Worklist" means the requirement worklists (the nav's
                Requirements → Worklist), so it opens them here rather than
                sending the operator to the journeys route to find them. */}
            <Button
              size="xs"
              variant="default"
              leftSection={<ListChecksIcon size={14} aria-hidden />}
              onClick={() => setWorklistsOpen(true)}
            >
              Worklists
            </Button>
            <Button
              size="xs"
              leftSection={<PlusIcon size={14} aria-hidden />}
              onClick={() => setCreateOpen(true)}
            >
              New
            </Button>
          </>
        }
      />

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
            ? " on this page — see all journeys to search them all"
            : ""}
          .
        </Text>
      ) : (
        <Stack gap="sm">
          <ProfileList>
            {filtered.map((journey) => (
              <JourneyRow
                key={journey.id}
                journey={journey}
                onView={() =>
                  router.push(`/admin/applicant-journeys/${journey.id}`)
                }
                onEdit={() => setEditingId(journey.id)}
                onClose={() => setClosingJourney(journey)}
              />
            ))}
          </ProfileList>
          {truncated ? (
            <Text size="xs" c="dimmed" ta="center">
              Showing the {journeys.length} most recent journeys —{" "}
              <Anchor
                size="xs"
                component={Link}
                href={`/admin/applicant-journeys?applicant=${applicantId}`}
              >
                see all journeys
              </Anchor>
              .
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

      <EditJourneyModal
        journeyId={editingId}
        onClose={() => setEditingId(null)}
      />

      {closingJourney ? (
        <CloseJourneyModal
          journey={closingJourney}
          opened
          onClose={() => setClosingJourney(null)}
        />
      ) : null}

      {/* Mounted, not conditional: a closed drawer renders no children, so it
          issues no query until it is opened — and it keeps its closing
          animation, which an unmount would cut off. */}
      <ApplicantWorklistsDrawer
        applicantId={applicantId}
        opened={worklistsOpen}
        onClose={() => setWorklistsOpen(false)}
      />
    </Stack>
  );
}

/**
 * Edit always works from the **detail** fetch, never from the list row the menu
 * was opened on. The list shape omits `notes`, and `PATCH` replaces what it is
 * sent — prefilling from a list row would silently blank the notes on save.
 */
function EditJourneyModal({
  journeyId,
  onClose,
}: {
  journeyId: string | null;
  onClose: () => void;
}) {
  const { data, isLoading, isError, isRefetching, refetch } =
    useJourneyDetail(journeyId);
  const updateMutation = useUpdateJourney(journeyId ?? "");

  return (
    <Modal opened={journeyId !== null} onClose={onClose} title="Edit journey">
      {isLoading ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : isError || !data ? (
        <Stack p="md">
          <QueryErrorState
            message="Couldn't load this journey."
            onRetry={() => refetch()}
            isRetrying={isRefetching}
          />
        </Stack>
      ) : (
        <JourneyForm
          initialValues={data}
          isLoading={updateMutation.isPending}
          onSubmit={(values) => {
            updateMutation.mutate(toJourneyUpdatePayload(values), {
              onSuccess: onClose,
            });
          }}
        />
      )}
    </Modal>
  );
}

function JourneyRow({
  journey,
  onView,
  onEdit,
  onClose,
}: {
  journey: ApplicantJourney;
  onView: () => void;
  onEdit: () => void;
  onClose: () => void;
}) {
  const subtitle =
    journey.target_institution_name ||
    journey.target_program_name ||
    "Objective not detailed yet";
  const destination = journey.target_country || "Destination not decided";

  return (
    <ProfileListRow>
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap">
            <Text size="sm" fw={600} truncate>
              {destination}
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
          <Text size="xs" c="dimmed">
            {journey.preferred_intake || "Intake not set"} · Added{" "}
            {dayjs(journey.created_at).format("MMM D, YYYY")}
          </Text>
        </Stack>
        <RowActionsMenu<ApplicantJourney>
          record={journey}
          aria-label={`Actions for the ${destination} journey`}
          actions={[
            {
              label: "View",
              icon: <EyeIcon size={16} aria-hidden />,
              onClick: onView,
            },
            {
              label: "Edit",
              icon: <PencilSimpleIcon size={16} aria-hidden />,
              onClick: onEdit,
            },
            {
              label: "Close",
              icon: <ProhibitIcon size={16} aria-hidden />,
              color: "red",
              dividerBefore: true,
              hidden: (record) => ENDED_STAGES.has(record.stage),
              onClick: onClose,
            },
          ]}
        />
      </Group>
    </ProfileListRow>
  );
}
