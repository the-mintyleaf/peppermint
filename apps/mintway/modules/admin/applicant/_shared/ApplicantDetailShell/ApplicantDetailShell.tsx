"use client";

import Link from "next/link";
import {
  Alert,
  Badge,
  Center,
  Group,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";

import { getApiError } from "@/lib/authErrorMessages";
import { useApplicant } from "../useApplicant";
import {
  ENGAGEMENT_STATUS_COLORS,
  ENGAGEMENT_STATUS_LABELS,
  LIFECYCLE_STAGE_COLORS,
  LIFECYCLE_STAGE_LABELS,
} from "../applicant.enums";
import type { EngagementStatus, LifecycleStage } from "../applicant.types";
import { APPLICANT_SECTIONS, sectionHref } from "./sections";
import type { ApplicantDetailShellProps } from "./ApplicantDetailShell.types";

/**
 * Detail chrome for a single applicant: header (name, code, lifecycle/engagement
 * badges, lock/archive/merge indicators), role-filtered section nav, and a slot for
 * per-page header actions. Handles loading, a non-disclosing not-found (§3), and a
 * generic load error so a bad id never blanks the app. Each section page renders its
 * body as `children` inside this shell.
 */
export function ApplicantDetailShell({
  applicantId,
  activeSection,
  children,
  headerActions,
}: ApplicantDetailShellProps) {
  const {
    applicant,
    isLoading,
    isError,
    error,
    isAdmin,
    isLocked,
    isArchived,
    isMerged,
  } = useApplicant(applicantId);

  const breadcrumb = [
    { label: "Applicants", href: "/admin/applicants" },
    {
      label: applicant?.full_name ?? applicant?.applicant_code ?? "Applicant",
      href: `/admin/applicants/${applicantId}`,
    },
  ];

  if (isLoading) {
    return (
      <>
        <ModuleHeader breadcrumbItems={breadcrumb} />
        <ModalPaper withBorder>
          <Center mih={320}>
            <Loader size="sm" />
          </Center>
        </ModalPaper>
      </>
    );
  }

  if (isError || !applicant) {
    const notFound = getApiError(error).code === "APPLICANT_NOT_FOUND";
    return (
      <>
        <ModuleHeader breadcrumbItems={breadcrumb} />
        <ModalPaper withBorder>
          <Center mih={320}>
            <Stack align="center" gap="xs" maw={380}>
              <ThemeIcon size={44} radius="xl" color="gray" variant="light">
                <WarningCircleIcon size={22} weight="fill" aria-hidden />
              </ThemeIcon>
              <Title order={4} ta="center">
                {notFound
                  ? "Applicant not found"
                  : "Couldn't load this applicant"}
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                {notFound
                  ? "This applicant may have been archived or the link is incorrect."
                  : "Something went wrong loading the record. Please try again."}
              </Text>
            </Stack>
          </Center>
        </ModalPaper>
      </>
    );
  }

  const sections = APPLICANT_SECTIONS.filter((s) => isAdmin || !s.adminOnly);

  return (
    <>
      <ModuleHeader breadcrumbItems={breadcrumb} />

      <ModalPaper withBorder mb="md">
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4}>
              <Group gap="xs" align="center">
                <Title order={3}>{applicant.full_name}</Title>
                {isLocked && (
                  <Badge
                    color="orange"
                    variant="light"
                    leftSection={
                      <LockKeyIcon size={12} weight="fill" aria-hidden />
                    }
                  >
                    Locked
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {applicant.applicant_code}
              </Text>
              <Group gap="xs" mt={4}>
                <StatusBadge<LifecycleStage>
                  value={applicant.lifecycle_stage}
                  colorMap={LIFECYCLE_STAGE_COLORS}
                  labelMap={LIFECYCLE_STAGE_LABELS}
                />
                <StatusBadge<EngagementStatus>
                  value={applicant.engagement_status}
                  colorMap={ENGAGEMENT_STATUS_COLORS}
                  labelMap={ENGAGEMENT_STATUS_LABELS}
                />
              </Group>
            </Stack>
            {headerActions ? <Group gap="xs">{headerActions}</Group> : null}
          </Group>

          {isMerged && (
            <Alert color="gray" variant="light" title="Merged record">
              This applicant was merged into another record and is retained for
              history.
            </Alert>
          )}
          {isArchived && !isMerged && (
            <Alert color="orange" variant="light" title="Archived">
              This applicant is archived. Reactivate it before making further
              changes.
            </Alert>
          )}
        </Stack>
      </ModalPaper>

      <Tabs value={activeSection} mb="md" variant="outline">
        <Tabs.List>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Tabs.Tab
                key={section.id}
                value={section.id}
                leftSection={<Icon size={15} aria-hidden />}
                renderRoot={(props) => (
                  <Link
                    href={sectionHref(applicantId, section.id)}
                    {...props}
                  />
                )}
              >
                {section.label}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>

      {children}
    </>
  );
}
