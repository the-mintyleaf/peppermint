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
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import { useApplicantDetail } from "../../applicants.hooks";
import type { ApplicantDetail as ApplicantDetailRecord } from "../../applicants.types";
import { ApplicantHistoryPanel } from "./components/ApplicantHistoryPanel";
import { ApplicantOverviewPanel } from "./components/ApplicantOverviewPanel";
import { ApplicantPassportFamilyPanel } from "./components/ApplicantPassportFamilyPanel";
import { ChangeApplicantStatusModal } from "./components/ChangeApplicantStatusModal";

const STATUS_COLORS: Record<string, string> = {
  active: "green",
  dormant: "yellow",
  archived: "gray",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  dormant: "Dormant",
  archived: "Archived",
};

/**
 * Data-driven, not a hardcoded switch — appending the Journeys tab in a
 * later phase (orchestrator-owned; cross-module) means adding one entry
 * here, not restructuring this component's JSX
 * (`{ value: "journeys", label: "Journeys", panel: <ApplicantJourneysPanel applicantId={applicant.id} /> }`).
 */
function getApplicantDetailTabs(applicant: ApplicantDetailRecord) {
  return [
    {
      value: "overview",
      label: "Overview",
      panel: <ApplicantOverviewPanel applicant={applicant} />,
    },
    {
      value: "passport-family",
      label: "Passport & Family",
      panel: <ApplicantPassportFamilyPanel applicant={applicant} />,
    },
    {
      value: "history",
      label: "History",
      panel: <ApplicantHistoryPanel applicantId={applicant.id} />,
    },
    // Journeys panel intentionally omitted — cross-module, built by the
    // orchestrator in a later phase (see this module's build report).
  ];
}

function ApplicantDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const {
    data: applicant,
    isLoading,
    isError,
    error,
    refetch,
  } = useApplicantDetail(id);

  const notFound =
    isError && getApiError(error).code === "APPLICANTS_APPLICANT_NOT_FOUND";

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
            Applicant not found.
          </Text>
          <Button
            size="xs"
            variant="default"
            onClick={() => router.push("/admin/applicants")}
          >
            Back to applicants
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  if (isError || !applicant) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Couldn&apos;t load this applicant.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  const tabs = getApplicantDetailTabs(applicant);
  const displayName =
    applicant.full_name_en ||
    applicant.full_name_np ||
    applicant.full_name_romanized;

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Applicants", href: "/admin/applicants" },
          { label: displayName, href: `/admin/applicants/${id}` },
        ]}
      />
      <ModalPaper withBorder>
        <Stack gap="md" p="md">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Stack gap={4}>
              <Group gap="xs">
                <Title order={4}>{displayName}</Title>
                <Badge
                  size="sm"
                  variant="light"
                  color={STATUS_COLORS[applicant.status]}
                >
                  {STATUS_LABELS[applicant.status]}
                </Badge>
              </Group>
              {applicant.originating_lead_id ? (
                <Group gap={4}>
                  <ArrowsLeftRightIcon size={14} aria-hidden />
                  <Text
                    size="xs"
                    c="blue"
                    component={Link}
                    href="/admin/lead-management"
                  >
                    Converted from a lead
                  </Text>
                </Group>
              ) : null}
            </Stack>

            <Group gap="xs">
              <Button
                size="xs"
                variant="default"
                leftSection={<ArrowsClockwiseIcon size={14} aria-hidden />}
                onClick={() => setStatusModalOpen(true)}
              >
                Change status
              </Button>
              <Button
                size="xs"
                leftSection={<PencilSimpleIcon size={14} aria-hidden />}
                onClick={() =>
                  router.push(`/admin/applicants/${applicant.id}/edit`)
                }
              >
                Edit
              </Button>
            </Group>
          </Group>

          <Tabs defaultValue="overview">
            <Tabs.List>
              {tabs.map((tab) => (
                <Tabs.Tab key={tab.value} value={tab.value}>
                  {tab.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Panel key={tab.value} value={tab.value} pt="md">
                {tab.panel}
              </Tabs.Panel>
            ))}
          </Tabs>
        </Stack>
      </ModalPaper>

      <ChangeApplicantStatusModal
        applicant={applicant}
        opened={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </>
  );
}

export function ModuleApplicantDetail() {
  return (
    <RequireLeadAccess>
      <ApplicantDetailContent />
    </RequireLeadAccess>
  );
}
