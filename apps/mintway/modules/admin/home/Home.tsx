"use client";

import Link from "next/link";
import { Anchor, Group, SimpleGrid, Stack, Text, Title } from "@peppermint/ui";
import { ModuleErrorBoundary } from "@peppermint/admin";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { SignatureIcon } from "@phosphor-icons/react/dist/csr/Signature";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { UserListIcon } from "@phosphor-icons/react/dist/csr/UserList";
import { UserMinusIcon } from "@phosphor-icons/react/dist/csr/UserMinus";

import { RequireAuth } from "@/components/RequireAuth";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";

import {
  AttentionList,
  QuickActions,
  RecentApplicants,
  SectionCard,
  StatTile,
} from "./components";
import {
  selectDueFollowUps,
  useActiveSignaturesCount,
  useApplicantCount,
  useDocumentWorkspaces,
  useFollowUpsDue,
  useNow,
  useRecentApplicants,
  useUserCount,
} from "./Home.hooks";
import { formatRelative } from "./Home.utils";

const APPLICANTS_HREF = "/admin/applicants";

function greetingWord(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function HomeDashboard() {
  const { user, isAdmin } = useCurrentUser();
  // A minute-ticking clock so relative labels and the overdue/due-today math stay correct
  // on a long-open dashboard (and keep render pure — no Date.now() during render).
  const now = useNow();

  // ── Pipeline (lifecycle stage) counts ──
  const interested = useApplicantCount("interested", {
    lifecycle_stage: "interested",
  });
  const potential = useApplicantCount("potential", {
    lifecycle_stage: "potential",
  });
  const applicant = useApplicantCount("applicant", {
    lifecycle_stage: "applicant",
  });

  // ── Engagement health counts ──
  const active = useApplicantCount("eng-active", {
    engagement_status: "active",
  });
  const onHold = useApplicantCount("eng-on_hold", {
    engagement_status: "on_hold",
  });
  const lost = useApplicantCount("eng-lost", { engagement_status: "lost" });

  // ── Lists + admin-only ops ──
  const recent = useRecentApplicants(5);
  const followUps = useFollowUpsDue(isAdmin);
  const docs = useDocumentWorkspaces(isAdmin);
  const signatures = useActiveSignaturesCount(isAdmin);
  const users = useUserCount(isAdmin);

  const dueRows = selectDueFollowUps(followUps.data, now).slice(0, 6);
  const name =
    user?.employee_profile.preferred_name?.trim() ||
    user?.employee_profile.first_name?.trim() ||
    user?.username ||
    "";
  const freshness = recent.dataUpdatedAt
    ? formatRelative(recent.dataUpdatedAt, now)
    : null;

  const pipelineTiles = [
    {
      key: "interested",
      label: "Interested",
      query: interested,
      color: "gray",
      icon: <SparkleIcon size={22} aria-hidden />,
    },
    {
      key: "potential",
      label: "Potential",
      query: potential,
      color: "blue",
      icon: <TrendUpIcon size={22} aria-hidden />,
    },
    {
      key: "applicant",
      label: "Applicants",
      query: applicant,
      color: "teal",
      icon: <GraduationCapIcon size={22} aria-hidden />,
    },
  ];

  const engagementTiles = [
    {
      key: "active",
      label: "Active",
      query: active,
      color: "teal",
      icon: <PulseIcon size={22} aria-hidden />,
    },
    {
      key: "on-hold",
      label: "On hold",
      query: onHold,
      color: "yellow",
      icon: <PauseCircleIcon size={22} aria-hidden />,
    },
    {
      key: "lost",
      label: "Lost",
      query: lost,
      color: "gray",
      icon: <UserMinusIcon size={22} aria-hidden />,
    },
  ];

  return (
    <Stack gap="xl" py="md">
      <Group justify="space-between" align="flex-end" gap="md">
        <Stack gap={2}>
          <Title order={3}>
            {greetingWord(new Date(now).getHours())}
            {name ? `, ${name}` : ""}
          </Title>
          <Text size="sm" c="dimmed">
            Here&apos;s what&apos;s happening across your applicants
            {freshness ? ` · updated ${freshness}` : ""}
          </Text>
        </Stack>
        <QuickActions isAdmin={isAdmin} />
      </Group>

      {isAdmin ? (
        <SectionCard title="Needs attention">
          <AttentionList
            rows={dueRows}
            now={now}
            isLoading={followUps.isLoading}
            isError={followUps.isError}
            onRetry={() => void followUps.refetch()}
            isRetrying={followUps.isRefetching}
          />
        </SectionCard>
      ) : null}

      <Stack gap="sm">
        <Title order={5}>Pipeline</Title>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
          {pipelineTiles.map((t) => (
            <StatTile
              key={t.key}
              label={t.label}
              value={t.query.data}
              icon={t.icon}
              color={t.color}
              href={APPLICANTS_HREF}
              isLoading={t.query.isLoading}
              isError={t.query.isError}
              onRetry={() => void t.query.refetch()}
            />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack gap="sm">
        <Title order={5}>Engagement health</Title>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
          {engagementTiles.map((t) => (
            <StatTile
              key={t.key}
              label={t.label}
              value={t.query.data}
              icon={t.icon}
              color={t.color}
              href={APPLICANTS_HREF}
              isLoading={t.query.isLoading}
              isError={t.query.isError}
              onRetry={() => void t.query.refetch()}
            />
          ))}
        </SimpleGrid>
      </Stack>

      <SectionCard
        title="Recent activity"
        action={
          <Anchor component={Link} href={APPLICANTS_HREF} size="sm">
            <Group gap={4} align="center">
              View all <ArrowRightIcon size={14} aria-hidden />
            </Group>
          </Anchor>
        }
      >
        <RecentApplicants
          rows={recent.data}
          now={now}
          isLoading={recent.isLoading}
          isError={recent.isError}
          onRetry={() => void recent.refetch()}
          isRetrying={recent.isRefetching}
        />
      </SectionCard>

      {isAdmin ? (
        <Stack gap="sm">
          <Title order={5}>Operations</Title>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
            <StatTile
              label="Document workspaces"
              value={docs.data?.count}
              hint={docs.data ? `${docs.data.drafts} open drafts` : undefined}
              icon={<FileTextIcon size={22} aria-hidden />}
              color="brand"
              href="/admin/documents"
              isLoading={docs.isLoading}
              isError={docs.isError}
              onRetry={() => void docs.refetch()}
            />
            <StatTile
              label="Active signatures"
              value={signatures.data}
              icon={<SignatureIcon size={22} aria-hidden />}
              color="grape"
              href="/admin/signatures"
              isLoading={signatures.isLoading}
              isError={signatures.isError}
              onRetry={() => void signatures.refetch()}
            />
            <StatTile
              label="User accounts"
              value={users.data}
              icon={<UserListIcon size={22} aria-hidden />}
              color="indigo"
              href="/admin/authenticate/users"
              isLoading={users.isLoading}
              isError={users.isError}
              onRetry={() => void users.refetch()}
            />
          </SimpleGrid>
        </Stack>
      ) : null}
    </Stack>
  );
}

/** Admin home — an operational signal board scoped to the signed-in user's role. */
export function ModuleHome() {
  return (
    <RequireAuth>
      <ModuleErrorBoundary title="The dashboard hit an error">
        <HomeDashboard />
      </ModuleErrorBoundary>
    </RequireAuth>
  );
}
