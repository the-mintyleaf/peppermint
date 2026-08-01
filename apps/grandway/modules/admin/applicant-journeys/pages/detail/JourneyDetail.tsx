"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Anchor,
  Button,
  Center,
  Group,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
} from "@peppermint/ui";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";
import {
  ProfileLayout,
  ProfileSidebar,
  ProfileTabs,
  type ProfileTab,
} from "@/components/profile";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import { ApplicantPhoto } from "@/modules/admin/applicants/photograph";
import { FilesPanel } from "@/modules/admin/uploaded-files/_shared/FilesPanel";
import { useJourneyDetail } from "../../applicantJourneys.hooks";
import { journeyApplicantName } from "../../applicantJourneys.labels";
import type { ApplicantJourneyDetail } from "../../applicantJourneys.types";
import { JourneyStageSwitch } from "../list/components/JourneyStageSwitch";
import { JourneyChecklistPanel } from "./components/JourneyChecklistPanel";
import { JourneyHistoryPanel } from "./components/JourneyHistoryPanel";
import { JourneyOverviewPanel } from "./components/JourneyOverviewPanel";

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

  const displayName = journeyApplicantName(journey);
  const destination = journey.target_country || "No destination set";
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
        // One control, same position as the applicant profile's status switch:
        // the current stage IS the lever. `JourneyStageSwitch` already owns the
        // whole lifecycle — plain moves inline, Defer/Close/Reopen through their
        // own modals — so the four buttons this replaced were four doors into
        // the same room, docked where a fact belongs rather than an action.
        right={<JourneyStageSwitch journey={journey} fullWidth={false} />}
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
              // The page's avatar anchors the *journey* (its destination), so
              // the applicant's face rides with their name in the subtitle
              // instead of displacing it — one anchor, and the photo stays
              // attached to the thing it identifies.
              subtitle={
                <Group gap={6} justify="center" wrap="nowrap">
                  <ApplicantPhoto
                    applicantId={journey.applicant.id}
                    name={displayName}
                    size={20}
                  />
                  <Anchor
                    size="sm"
                    component={Link}
                    href={`/admin/applicants/${journey.applicant.id}`}
                  >
                    {displayName}
                  </Anchor>
                </Group>
              }
              fields={<JourneyOverviewPanel journey={journey} />}
            />
          }
        >
          <ProfileTabs tabs={tabs} defaultValue="worklist" />
        </ProfileLayout>
      </ModalPaper>
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
