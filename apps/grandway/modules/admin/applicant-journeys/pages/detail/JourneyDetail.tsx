"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Anchor,
  Badge,
  Button,
  Center,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
} from "@peppermint/ui";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import {
  ProfileLayout,
  ProfileSidebar,
  ProfileTabs,
  type ProfileTab,
} from "@/components/profile";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import { FilesPanel } from "@/modules/admin/uploaded-files/_shared/FilesPanel";
import { useJourneyDetail } from "../../applicantJourneys.hooks";
import { STAGE_COLORS, STAGE_LABELS } from "../../applicantJourneys.labels";
import type { ApplicantJourneyDetail } from "../../applicantJourneys.types";
import { ChangeJourneyStageModal } from "../list/components/ChangeJourneyStageModal";
import { CloseJourneyModal } from "../list/components/CloseJourneyModal";
import { DeferJourneyModal } from "../list/components/DeferJourneyModal";
import { ReopenJourneyModal } from "../list/components/ReopenJourneyModal";
import { JourneyChecklistPanel } from "./components/JourneyChecklistPanel";
import { JourneyHistoryPanel } from "./components/JourneyHistoryPanel";
import { JourneyOverviewPanel } from "./components/JourneyOverviewPanel";

type ActiveModal = "stage" | "defer" | "close" | "reopen" | null;

const TERMINAL_STAGES = new Set(["completed", "closed", "deferred"]);

function applicantName(journey: ApplicantJourneyDetail): string {
  return (
    journey.applicant.full_name ||
    journey.applicant.full_name_en ||
    journey.applicant.full_name_np
  );
}

function getJourneyTabs(journey: ApplicantJourneyDetail): ProfileTab[] {
  return [
    {
      value: "worklist",
      label: "Worklist",
      icon: <ListChecksIcon size={14} aria-hidden />,
      panel: <JourneyChecklistPanel journey={journey} />,
    },
    {
      value: "files",
      label: "Files",
      icon: <PaperclipIcon size={14} aria-hidden />,
      panel: <FilesPanel scope={{ journey: journey.id }} />,
    },
    {
      value: "history",
      label: "History",
      icon: <ClockCounterClockwiseIcon size={14} aria-hidden />,
      panel: <JourneyHistoryPanel journeyId={journey.id} />,
    },
  ];
}

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

  const displayName = applicantName(journey);
  const destination = journey.target_country || "No destination set";
  const isTerminal = TERMINAL_STAGES.has(journey.stage);
  const closeModal = () => setActiveModal(null);
  const tabs = getJourneyTabs(journey);

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

      {/* ModalPaper is fixed-height (`calc(100% - header)`) with `overflow: hidden`;
          override to scroll vertically so a tall profile is fully reachable (the
          sticky sidebar sticks within this scroll container). No padding — the
          ProfileLayout owns its own column spacing + divider. */}
      <ModalPaper withBorder style={{ overflowY: "auto" }}>
        <ProfileLayout
          sidebar={
            <ProfileSidebar
              name={destination}
              avatarLabel={journey.target_country || displayName}
              subtitle={
                <Anchor
                  size="sm"
                  component={Link}
                  href={`/admin/applicants/${journey.applicant.id}`}
                >
                  {displayName}
                </Anchor>
              }
              status={
                <Badge
                  size="sm"
                  variant="light"
                  color={STAGE_COLORS[journey.stage]}
                >
                  {STAGE_LABELS[journey.stage]}
                </Badge>
              }
              fields={<JourneyOverviewPanel journey={journey} />}
              actions={
                isTerminal ? (
                  <Button
                    fullWidth
                    size="xs"
                    color="teal"
                    leftSection={
                      <ArrowCounterClockwiseIcon size={14} aria-hidden />
                    }
                    onClick={() => setActiveModal("reopen")}
                  >
                    Reopen
                  </Button>
                ) : (
                  <>
                    <Button
                      fullWidth
                      size="xs"
                      leftSection={
                        <ArrowsClockwiseIcon size={14} aria-hidden />
                      }
                      onClick={() => setActiveModal("stage")}
                    >
                      Change stage
                    </Button>
                    <Button
                      fullWidth
                      size="xs"
                      variant="default"
                      color="orange"
                      leftSection={<PauseCircleIcon size={14} aria-hidden />}
                      onClick={() => setActiveModal("defer")}
                    >
                      Defer
                    </Button>
                    <Button
                      fullWidth
                      size="xs"
                      color="red"
                      leftSection={<ProhibitIcon size={14} aria-hidden />}
                      onClick={() => setActiveModal("close")}
                    >
                      Close
                    </Button>
                  </>
                )
              }
            />
          }
        >
          <ProfileTabs tabs={tabs} defaultValue="worklist" />
        </ProfileLayout>
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
