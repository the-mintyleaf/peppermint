"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Center,
  Group,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
} from "@peppermint/ui";
import { AirplaneTakeoffIcon } from "@phosphor-icons/react/dist/csr/AirplaneTakeoff";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import {
  ProfileLayout,
  ProfileSidebar,
  ProfileTabs,
  type ProfileTab,
} from "@/components/profile";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { ApplicantDocumentsPanel } from "@/modules/admin/documents";
import { RecordAlertsPanel } from "@/modules/admin/notifications/_shared/RecordAlertsPanel";
import { FilesPanel } from "@/modules/admin/uploaded-files/_shared/FilesPanel";
import { useApplicantDetail } from "../../applicants.hooks";
import type { ApplicantDetail as ApplicantDetailRecord } from "../../applicants.types";
import { ApplicantHistoryPanel } from "./components/ApplicantHistoryPanel";
import { ApplicantJourneysPanel } from "./components/ApplicantJourneysPanel";
import { ApplicantOverviewPanel } from "./components/ApplicantOverviewPanel";
import { ApplicantPassportFamilyPanel } from "./components/ApplicantPassportFamilyPanel";
import { ApplicantStatusSwitch } from "../list/components/ApplicantStatusSwitch";

function applicantName(applicant: ApplicantDetailRecord): string {
  return (
    applicant.full_name ||
    applicant.full_name_en ||
    applicant.full_name_np ||
    applicant.full_name_romanized
  );
}

/**
 * Content-column tabs (Overview is the sidebar, not a tab). Documents is
 * admin-only — a lead manager must not even see the tab, since an empty tab
 * would itself disclose that documents may exist (`documents/docs/SECURITY.md`).
 */
function getApplicantTabs(
  applicant: ApplicantDetailRecord,
  includeDocuments: boolean,
): ProfileTab[] {
  return [
    {
      value: "passport-family",
      label: "Passport & Family",
      icon: <IdentificationCardIcon size={14} aria-hidden />,
      count:
        applicant.family_members.length + applicant.emergency_contacts.length ||
        undefined,
      panel: <ApplicantPassportFamilyPanel applicant={applicant} />,
    },
    {
      value: "journeys",
      label: "Journeys",
      icon: <AirplaneTakeoffIcon size={14} aria-hidden />,
      panel: <ApplicantJourneysPanel applicantId={applicant.id} />,
    },
    ...(includeDocuments
      ? [
          {
            value: "documents",
            label: "Documents",
            icon: <FolderIcon size={14} aria-hidden />,
            panel: (
              <ApplicantDocumentsPanel
                applicantId={applicant.id}
                applicantName={applicantName(applicant)}
              />
            ),
          } satisfies ProfileTab,
        ]
      : []),
    {
      value: "files",
      label: "Files",
      icon: <PaperclipIcon size={14} aria-hidden />,
      panel: <FilesPanel scope={{ applicant: applicant.id }} />,
    },
    {
      value: "alerts",
      label: "Alerts",
      icon: <BellIcon size={14} aria-hidden />,
      // Only `passport_expiring` is applicant-adjacent, and it keys to the
      // passport's own id, not the applicant's — pass that when a passport is on
      // file; an empty array is the honest "nothing to query" case.
      panel: (
        <RecordAlertsPanel
          sourceEntityId={applicant.passport?.id ? [applicant.passport.id] : []}
        />
      ),
    },
    {
      value: "history",
      label: "History",
      icon: <ClockCounterClockwiseIcon size={14} aria-hidden />,
      panel: <ApplicantHistoryPanel applicantId={applicant.id} />,
    },
  ];
}

function ApplicantDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";
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

  const displayName = applicantName(applicant);
  const tabs = getApplicantTabs(applicant, isAdmin);

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Applicants", href: "/admin/applicants" },
          { label: displayName, href: `/admin/applicants/${id}` },
        ]}
        right={
          <Group gap="xs" wrap="nowrap">
            {/* Status is the interactive control (current value + dropdown),
                Edit is the action — different look, different position. */}
            <ApplicantStatusSwitch applicant={applicant} />
            <Button
              size="xs"
              variant="default"
              leftSection={<PencilSimpleIcon size={14} aria-hidden />}
              onClick={() =>
                router.push(`/admin/applicants/${applicant.id}/edit`)
              }
            >
              Edit applicant
            </Button>
          </Group>
        }
      />

      {/* ModalPaper is fixed-height (`calc(100% - header)`) with `overflow: hidden`;
          override to scroll vertically so a tall profile is fully reachable (the
          sticky sidebar sticks within this scroll container). No padding — the
          ProfileLayout owns its own column spacing + divider. */}
      <ModalPaper withBorder style={{ overflowY: "auto" }}>
        <ProfileLayout
          sidebar={
            <ProfileSidebar
              name={displayName}
              subtitle={
                applicant.full_name_romanized &&
                applicant.full_name_romanized !== displayName
                  ? applicant.full_name_romanized
                  : undefined
              }
              fields={<ApplicantOverviewPanel applicant={applicant} />}
            />
          }
        >
          <ProfileTabs tabs={tabs} defaultValue="passport-family" />
        </ProfileLayout>
      </ModalPaper>
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
