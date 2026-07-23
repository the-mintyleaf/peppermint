"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Tabs,
  Text,
  Title,
} from "@peppermint/ui";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import { useJourneyDetail } from "../../applicantJourneys.hooks";
import { STAGE_COLORS, STAGE_LABELS } from "../../applicantJourneys.labels";
import { ChangeJourneyStageModal } from "../list/components/ChangeJourneyStageModal";
import { CloseJourneyModal } from "../list/components/CloseJourneyModal";
import { DeferJourneyModal } from "../list/components/DeferJourneyModal";
import { ReopenJourneyModal } from "../list/components/ReopenJourneyModal";
import { JourneyHistoryPanel } from "./components/JourneyHistoryPanel";
import { JourneyOverviewPanel } from "./components/JourneyOverviewPanel";

type ActiveModal = "stage" | "defer" | "close" | "reopen" | null;

const TERMINAL_STAGES = new Set(["completed", "closed", "deferred"]);

function JourneyDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const {
    data: journey,
    isLoading,
    isError,
    error,
    refetch,
  } = useJourneyDetail(id);

  const notFound =
    isError && getApiError(error).code === "JOURNEYS_JOURNEY_NOT_FOUND";

  if (isLoading) {
    return (
      <ModalPaper withBorder>
        <Center h={300}>
          <Loader size="sm" />
        </Center>
      </ModalPaper>
    );
  }

  if (notFound) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Journey not found.
          </Text>
          <Button
            size="xs"
            variant="default"
            onClick={() => router.push("/admin/applicant-journeys")}
          >
            Back to journeys
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  if (isError || !journey) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Couldn&apos;t load this journey.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  const displayName =
    journey.applicant.full_name_en || journey.applicant.full_name_np;
  const isTerminal = TERMINAL_STAGES.has(journey.stage);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Applicant Journeys", href: "/admin/applicant-journeys" },
          {
            label: journey.target_country || displayName,
            href: `/admin/applicant-journeys/${id}`,
          },
        ]}
      />
      <ModalPaper withBorder>
        <Stack gap="md" p="md">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Stack gap={4}>
              <Group gap="xs">
                <Title order={4}>
                  {journey.target_country || "No destination set"}
                </Title>
                <Badge
                  size="sm"
                  variant="light"
                  color={STAGE_COLORS[journey.stage]}
                >
                  {STAGE_LABELS[journey.stage]}
                </Badge>
              </Group>
              <Text
                size="xs"
                c="blue"
                component={Link}
                href={`/admin/applicants/${journey.applicant.id}`}
              >
                {displayName}
              </Text>
            </Stack>

            <Group gap="xs">
              {!isTerminal ? (
                <>
                  <Button
                    size="xs"
                    variant="default"
                    leftSection={<ArrowsClockwiseIcon size={14} aria-hidden />}
                    onClick={() => setActiveModal("stage")}
                  >
                    Change stage
                  </Button>
                  <Button
                    size="xs"
                    variant="default"
                    color="orange"
                    leftSection={<PauseCircleIcon size={14} aria-hidden />}
                    onClick={() => setActiveModal("defer")}
                  >
                    Defer
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    leftSection={<ProhibitIcon size={14} aria-hidden />}
                    onClick={() => setActiveModal("close")}
                  >
                    Close
                  </Button>
                </>
              ) : (
                <Button
                  size="xs"
                  color="teal"
                  leftSection={
                    <ArrowCounterClockwiseIcon size={14} aria-hidden />
                  }
                  onClick={() => setActiveModal("reopen")}
                >
                  Reopen
                </Button>
              )}
            </Group>
          </Group>

          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="history">History</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="overview" pt="md">
              <JourneyOverviewPanel journey={journey} />
            </Tabs.Panel>
            <Tabs.Panel value="history" pt="md">
              <JourneyHistoryPanel journeyId={journey.id} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </ModalPaper>

      <ChangeJourneyStageModal
        journey={journey}
        opened={activeModal === "stage"}
        onClose={closeModal}
      />
      <DeferJourneyModal
        journey={journey}
        opened={activeModal === "defer"}
        onClose={closeModal}
      />
      <CloseJourneyModal
        journey={journey}
        opened={activeModal === "close"}
        onClose={closeModal}
      />
      <ReopenJourneyModal
        journey={journey}
        opened={activeModal === "reopen"}
        onClose={closeModal}
      />
    </>
  );
}

export function ModuleJourneyDetail() {
  return (
    <RequireLeadAccess>
      <JourneyDetailContent />
    </RequireLeadAccess>
  );
}
