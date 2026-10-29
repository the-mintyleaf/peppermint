"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
} from "@peppermint/ui";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import {
  ProfileLayout,
  ProfileSidebar,
  ProfileTabs,
  type ProfileTab,
} from "@/components/profile";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import { useCapabilities } from "@/config/access";
import { ApplicantDocumentsPanel } from "@/modules/admin/documents";
import { ApplicantAlertsPanel } from "@/modules/admin/notifications/_shared/ApplicantAlertsPanel";
import { RecordRemindersPanel } from "@/modules/admin/reminders/_shared/RecordRemindersPanel";
import { FilesPanel } from "@/modules/admin/uploaded-files/_shared/FilesPanel";
import { useApplicantDetail } from "../../applicants.hooks";
import { applicantDisplayName } from "../../applicants.labels";
import { useApplicantLifecycleActions } from "../../applicants.lifecycle";
import type { ApplicantDetail as ApplicantDetailRecord } from "../../applicants.types";
import { useApplicantPhotograph } from "../../photograph";
import { ApplicantAssigneeControl } from "./components/ApplicantAssigneeControl";
import { ApplicantEducationPanel } from "./components/ApplicantEducationPanel";
import { ApplicantHistoryPanel } from "./components/ApplicantHistoryPanel";
import { ApplicantJourneysPanel } from "./components/ApplicantJourneysPanel";
import { ApplicantNotesPanel } from "./components/ApplicantNotesPanel";
import { ApplicantOverviewPanel } from "./components/ApplicantOverviewPanel";
import { ApplicantPassportFamilyPanel } from "./components/ApplicantPassportFamilyPanel";
import { ApplicantStatusSwitch } from "../list/components/ApplicantStatusSwitch";
import type { ArchivedBannerProps } from "./ApplicantDetail.types";

/**
 * The page-level anchor for an archived ("deleted") file: says plainly that
 * nothing was erased, what is frozen, and — for an Admin — offers Restore
 * right here. A Lead Manager sees the same facts and who can undo it.
 */
function ArchivedBanner({ applicant }: ArchivedBannerProps) {
  const lifecycle = useApplicantLifecycleActions(applicant);
  return (
    <Box p="md" pb={0}>
      <Alert
        color="gray"
        variant="light"
        icon={<ArchiveIcon size={18} aria-hidden />}
        title="This applicant is archived (deleted)"
      >
        <Group justify="space-between" align="flex-end" gap="sm">
          <Text size="sm">
            Nothing was erased. Notes are read-only and the file can&apos;t be
            assigned until it is restored
            {lifecycle.canRestore ? "." : " — ask an Admin to restore it."}
          </Text>
          {lifecycle.canRestore ? (
            <Button
              size="xs"
              variant="default"
              leftSection={<ArrowCounterClockwiseIcon size={14} aria-hidden />}
              onClick={lifecycle.confirmRestore}
            >
              Restore applicant
            </Button>
          ) : null}
        </Group>
      </Alert>
    </Box>
  );
}

/**
 * Content-column tabs (Overview is the sidebar, not a tab).
 *
 * Two are conditional, for different reasons. **Documents**: a role that cannot read
 * documents must not even see the tab, since an empty tab would itself disclose that
 * documents may exist (`documents/INTEGRATION.md` §1). **Reminders**: every reminders
 * endpoint 403s a `superadmin`, so the tab is gated rather than left to fail — but
 * `caps.reminders` holds for both `admin` and `lead_manager`, and that module has no
 * read/write split, so the panel inside is fully writable for either.
 *
 * **The rest stay for everyone who reaches this page, deliberately.** The applicant
 * *record* is read-only for staff — identity, passport, family, education, status —
 * but Journeys, Notes, Files, Reminders, Alerts and History belong to resources staff
 * still work in fully. Do not extend the read-only rule to them.
 *
 * Notes sits right after Journeys: it is the tab people write in most, and a visit
 * note is usually about the journey just above it.
 */
function getApplicantTabs(
  applicant: ApplicantDetailRecord,
  displayName: string,
  includeDocuments: boolean,
  includeReminders: boolean,
): ProfileTab[] {
  return [
    {
      value: "passport-family",
      label: "Passport & Family",
      count:
        applicant.family_members.length + applicant.emergency_contacts.length ||
        undefined,
      panel: <ApplicantPassportFamilyPanel applicant={applicant} />,
    },
    {
      value: "education",
      label: "Education & Tests",
      count:
        applicant.educations.length + applicant.language_tests.length ||
        undefined,
      panel: <ApplicantEducationPanel applicant={applicant} />,
    },
    {
      value: "journeys",
      label: "Journeys",
      panel: <ApplicantJourneysPanel applicantId={applicant.id} />,
    },
    {
      value: "notes",
      label: "Notes",
      panel: <ApplicantNotesPanel applicant={applicant} />,
    },
    ...(includeDocuments
      ? [
          {
            value: "documents",
            label: "Documents",
            panel: (
              <ApplicantDocumentsPanel
                applicantId={applicant.id}
                applicantName={displayName}
              />
            ),
          } satisfies ProfileTab,
        ]
      : []),
    {
      value: "files",
      label: "Files",
      panel: <FilesPanel scope={{ applicant: applicant.id }} />,
    },
    // Reminders sits immediately before Alerts: the two are siblings — a
    // reminder is the follow-up a person *chose* to be prompted about, an
    // alert is one the system raised — and the authored one reads first.
    ...(includeReminders
      ? [
          {
            value: "reminders",
            label: "Reminders",
            panel: <RecordRemindersPanel owner={{ applicant: applicant.id }} />,
          } satisfies ProfileTab,
        ]
      : []),
    {
      value: "alerts",
      label: "Alerts",
      // Every alert about this applicant (`?applicant_id=`) — status, restore,
      // visit-note, assignment, journey, passport and test expiry — not just
      // the passport-keyed ones the old `RecordAlertsPanel` could reach.
      panel: <ApplicantAlertsPanel applicantId={applicant.id} />,
    },
    {
      value: "history",
      label: "History",
      panel: <ApplicantHistoryPanel applicantId={applicant.id} />,
    },
  ];
}

function ApplicantDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    documents: canReadDocuments,
    applicantEdit,
    reminders: canUseReminders,
  } = useCapabilities();
  const {
    data: applicant,
    isLoading,
    isError,
    error,
    refetch,
  } = useApplicantDetail(id);
  // Two extra requests (find the file, fetch its bytes), both cached for the
  // session. A failure falls back to initials inside `ProfileSidebar` — a
  // missing portrait is not worth an error state on a page that loaded.
  const photograph = useApplicantPhotograph(id);

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

  const displayName = applicantDisplayName(applicant);
  const tabs = getApplicantTabs(
    applicant,
    displayName,
    canReadDocuments,
    canUseReminders,
  );

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Applicants", href: "/admin/applicants" },
          { label: displayName, href: `/admin/applicants/${id}` },
        ]}
        right={
          <Group gap="xs" wrap="nowrap">
            {/* Assignee (routing), then status (current value + dropdown), then
                Edit (the action) — different look, different position. Both
                controls self-gate to plain facts for a reader. */}
            <ApplicantAssigneeControl applicant={applicant} />
            <ApplicantStatusSwitch applicant={applicant} fullWidth={false} />
            {applicantEdit && (
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
            )}
          </Group>
        }
      />

      {/* ModalPaper is fixed-height (`calc(100% - header)`) with `overflow: hidden`;
          override to scroll vertically so a tall profile is fully reachable (the
          sticky sidebar sticks within this scroll container). No padding — the
          ProfileLayout owns its own column spacing + divider. */}
      <ModalPaper withBorder style={{ overflowY: "auto" }}>
        {applicant.status === "archived" ? (
          <ArchivedBanner applicant={applicant} />
        ) : null}
        <ProfileLayout
          sidebar={
            <ProfileSidebar
              name={displayName}
              avatarSrc={photograph.url}
              avatarLoading={photograph.isLoading}
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
