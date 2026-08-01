"use client";

import {
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
  Divider,
} from "@peppermint/ui";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useDashboardSummary } from "../dashboard.hooks";
import { formatFetchedAt } from "../dashboard.utils";
import type { DashboardHeroProps } from "./DashboardHero.types";

const ROLE_LABELS: Record<string, string> = {
  admin: "admin",
  lead_manager: "lead_manager",
  superadmin: "superadmin",
};

/**
 * The page-level anchor, and the dashboard's ONE expressive moment (DESIGN.md
 * Layer 2 — the signature treatment is spent here so every card below can stay
 * quiet). It carries three things and stops: who is looking, the three standing
 * volumes that give every other figure on the page its scale, and — because
 * there is no refresh contract (INTEGRATION.md §9) — when those volumes were
 * actually fetched.
 *
 * The volumes stay visible on every tab: they are the denominator a reader
 * needs for a count in Today, Pipeline or Blockers, and re-reading them costs
 * nothing (the same cached `summary` query the alert strip uses).
 */
export function DashboardHero({ filters }: DashboardHeroProps) {
  const { user, authorityType } = useCurrentUser();
  const { data, isPending, isError, dataUpdatedAt } =
    useDashboardSummary(filters);

  const roleLabel = authorityType ? ROLE_LABELS[authorityType] : null;

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      style={{
        background:
          "linear-gradient(135deg, var(--mantine-color-brand-light) 0%, var(--mantine-color-body) 65%)",
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <Stack gap={4}>
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: "0.12em" }}
            >
              Placement operations
            </Text>
            <Title
              order={1}
              fz={32}
              fw={700}
              style={{ letterSpacing: "-0.02em" }}
            >
              Placement overview
            </Title>
          </Stack>
          {roleLabel && user ? (
            <Text size="sm" c="dimmed">
              {roleLabel} · {user.display_name || user.username}
            </Text>
          ) : null}
        </Group>

        <Divider />

        <Group gap="xl" wrap="wrap">
          <VolumeStat
            value={data?.volumes.leads_total}
            label="Total leads"
            isPending={isPending}
            isError={isError}
          />
          <VolumeStat
            value={data?.volumes.applicants_active}
            label="Active applicants"
            isPending={isPending}
            isError={isError}
          />
          <VolumeStat
            value={data?.volumes.journeys_total}
            label="Total journeys"
            isPending={isPending}
            isError={isError}
          />
        </Group>

        <Text size="xs" c="dimmed">
          {isError
            ? "Volumes unavailable — the alert panel below carries the retry."
            : `Fetched ${formatFetchedAt(dataUpdatedAt)} · nothing polls, use Refresh for the latest.`}
        </Text>
      </Stack>
    </Card>
  );
}

/**
 * One standing volume. A failed fetch shows an em dash, never a `0` — a zero
 * here would read as "no leads exist", which is a different fact from "we could
 * not ask" (DESIGN.md, Truth over Aesthetics).
 */
function VolumeStat({
  value,
  label,
  isPending,
  isError,
}: {
  value: number | undefined;
  label: string;
  isPending: boolean;
  isError: boolean;
}) {
  return (
    <Stack gap={2}>
      {isPending ? (
        <Skeleton height={30} width={72} radius="sm" />
      ) : (
        <Text fz={30} fw={700} lh={1.1} style={{ letterSpacing: "-0.03em" }}>
          {isError || value === undefined ? "—" : value.toLocaleString()}
        </Text>
      )}
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    </Stack>
  );
}
