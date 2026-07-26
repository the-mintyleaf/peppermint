"use client";

import { Group, Stack, Text, Title } from "@peppermint/ui";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";

const ROLE_LABELS: Record<string, string> = {
  admin: "admin",
  lead_manager: "lead_manager",
  superadmin: "superadmin",
};

/**
 * The page-level anchor band: a quiet eyebrow, the "Placement overview" title,
 * and — on the right — the time range in scope (the fiscal year) plus who is
 * looking (role · name). DESIGN.md requires a dashboard to state its time range;
 * the fiscal year is that range, shown here rather than left implicit in the
 * filter bar.
 */
export function DashboardHero({ fiscalYear }: { fiscalYear: string }) {
  const { user, authorityType } = useCurrentUser();

  const rangeLabel = fiscalYear ? `FY ${fiscalYear} BS` : "All fiscal years";
  const roleLabel = authorityType ? ROLE_LABELS[authorityType] : null;

  return (
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
        <Title order={1} fz={32} fw={700} style={{ letterSpacing: "-0.02em" }}>
          Placement overview
        </Title>
      </Stack>
      <Group gap="sm" c="dimmed">
        <Text size="sm" c="dimmed">
          {rangeLabel}
        </Text>
        {roleLabel && user ? (
          <>
            <Text size="sm" c="dimmed" aria-hidden>
              ·
            </Text>
            <Text size="sm" c="dimmed">
              {roleLabel} · {user.display_name || user.username}
            </Text>
          </>
        ) : null}
      </Group>
    </Group>
  );
}
