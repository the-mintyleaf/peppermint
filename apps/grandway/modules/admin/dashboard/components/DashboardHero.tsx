"use client";

import { Group, Stack, Text, Title } from "@peppermint/ui";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";

const ROLE_LABELS: Record<string, string> = {
  admin: "admin",
  lead_manager: "lead_manager",
  superadmin: "superadmin",
};

/**
 * The page-level anchor band: a quiet eyebrow, the "Placement overview" title, and —
 * on the right — who is looking (role · name). The time range in scope (fiscal year)
 * and destination country now live as controls in the module header's right slot, so
 * they are no longer restated here.
 */
export function DashboardHero() {
  const { user, authorityType } = useCurrentUser();

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
      {roleLabel && user ? (
        <Text size="sm" c="dimmed">
          {roleLabel} · {user.display_name || user.username}
        </Text>
      ) : null}
    </Group>
  );
}
