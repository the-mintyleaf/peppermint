"use client";

import type { ReactNode } from "react";
import { Badge, Divider, Group, Stack, Text, ThemeIcon } from "@peppermint/ui";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";

import type { OverviewTabProps } from "./OverviewTab.types";

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs">{value}</Text>
    </Group>
  );
}

export function OverviewTab({ user }: OverviewTabProps) {
  const canSignIn =
    user.is_active && user.is_login_enabled && user.account_status === "active";

  return (
    <Stack gap="md">
      <Group gap="xs">
        <ThemeIcon
          size={28}
          radius="xl"
          color={canSignIn ? "green" : "red"}
          variant="light"
        >
          {canSignIn ? (
            <CheckCircleIcon size={16} weight="fill" aria-hidden />
          ) : (
            <XCircleIcon size={16} weight="fill" aria-hidden />
          )}
        </ThemeIcon>
        <Text size="sm" fw={600}>
          {canSignIn ? "Can sign in" : "Cannot sign in"}
        </Text>
      </Group>
      <Text size="xs" c="dimmed">
        Based on active status, login-enabled flag, and account status. Lock
        state isn&apos;t exposed by this endpoint.
      </Text>

      <Divider />

      <Stack gap="xs">
        <InfoRow label="Username" value={user.username} />
        <InfoRow label="Display name" value={user.display_name} />
        <InfoRow label="Email" value={user.email ?? "—"} />
        <InfoRow
          label="Actor type"
          value={<Badge size="xs">{user.actor_type}</Badge>}
        />
        <InfoRow
          label="Account status"
          value={<Badge size="xs">{user.account_status}</Badge>}
        />
        <InfoRow label="Last login" value={user.last_login ?? "Never"} />
        <InfoRow label="Created" value={user.created_at} />
        <InfoRow label="Updated" value={user.updated_at} />
      </Stack>

      <Divider />

      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Staff
          </Text>
          <Badge size="xs" color={user.is_staff ? "blue" : "gray"}>
            {user.is_staff ? "Yes" : "No"}
          </Badge>
        </Group>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            Superuser
          </Text>
          <Badge size="xs" color={user.is_superuser ? "violet" : "gray"}>
            {user.is_superuser ? "Yes" : "No"}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          Staff and superuser flags aren&apos;t editable from this view.
        </Text>
      </Stack>
    </Stack>
  );
}
