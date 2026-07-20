"use client";

import { Badge, Group, Stack, Text } from "@peppermint/ui";

import { SectionLabel } from "@/components";
import type { SessionPanelProps } from "../../Home.types";

/** `null` last-login reads as "first sign-in", not as a missing value. */
function formatLastLogin(value: string | null): string {
  if (!value) return "First sign-in";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="lg">
      <Text fz="12px" c="dimmed">
        {label}
      </Text>
      <Text fz="12px" fw={600} ta="right">
        {value}
      </Text>
    </Group>
  );
}

/**
 * The live `/api/v1/auth/me/` payload, rendered plainly. Its job is to prove
 * the mock session round-trips — token → bearer header → profile — so a
 * broken auth path is visible on the home page rather than only at sign-in.
 */
export function SessionPanel({ user }: SessionPanelProps) {
  const role = user.is_superuser
    ? "Superuser"
    : user.is_staff
      ? "Staff"
      : "Standard";

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <SectionLabel>Your session</SectionLabel>
        <Badge
          size="sm"
          radius={0}
          variant="outline"
          color={user.is_staff ? "accent" : "gray"}
        >
          {role}
        </Badge>
      </Group>

      <Stack gap={8}>
        <Row label="Display name" value={user.display_name} />
        <Row label="Username" value={user.username} />
        <Row label="Email" value={user.email ?? "Not set"} />
        <Row label="Account status" value={user.account_status} />
        <Row label="Last sign-in" value={formatLastLogin(user.last_login)} />
      </Stack>

      <Text fz="11px" c="dimmed">
        Served by the in-app mock at{" "}
        <Text span inherit ff="monospace">
          /api/v1/auth/me/
        </Text>
        . Nothing leaves this app.
      </Text>
    </Stack>
  );
}
