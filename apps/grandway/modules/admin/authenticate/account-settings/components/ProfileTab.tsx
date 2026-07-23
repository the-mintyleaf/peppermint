"use client";

import { Badge, Divider, Group, Loader, Stack, Text } from "@peppermint/ui";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { QueryErrorState } from "@/components/QueryErrorState";
import type { SettingsTabProps } from "../account-settings.types";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsRow } from "./SettingsRow";

const AUTHORITY_LABELS: Record<string, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  lead_manager: "Lead Manager",
};

/**
 * Read-only view of the signed-in account (`GET /me/`). Profile fields are managed by
 * the account's managing authority (`PATCH /users/<id>/` — `authenticate/docs/INTEGRATION.md`
 * §7), so there is no self-edit here.
 */
export function ProfileTab({ title, description }: SettingsTabProps) {
  const { user, isLoading, isError, isRefetching, refetch } = useCurrentUser();

  if (isError) {
    return (
      <Stack gap="md">
        <SettingsHeader title={title} description={description} />
        <QueryErrorState
          message="Couldn't load your profile."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      </Stack>
    );
  }

  if (isLoading || !user) {
    return (
      <Stack gap="md">
        <SettingsHeader title={title} description={description} />
        <Group justify="center" py="lg">
          <Loader size="sm" />
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <SettingsHeader title={title} description={description} />
      <Text size="xs" c="dimmed">
        Profile details are managed by your administrator. Contact them to
        request a change.
      </Text>
      <Stack gap="sm">
        <SettingsRow
          label="Display name"
          right={<Text size="xs">{user.display_name || "—"}</Text>}
        />
        <Divider />
        <SettingsRow
          label="Username"
          right={<Text size="xs">{user.username}</Text>}
        />
        <Divider />
        <SettingsRow
          label="Authority"
          right={
            <Badge size="xs" variant="light">
              {AUTHORITY_LABELS[user.authority_type] ?? user.authority_type}
            </Badge>
          }
        />
        <Divider />
        <SettingsRow
          label="Contact email"
          right={
            <Text size="xs" c={user.email ? undefined : "dimmed"}>
              {user.email || "Not set"}
            </Text>
          }
        />
        <Divider />
        <SettingsRow
          label="Contact phone"
          right={
            <Text size="xs" c={user.phone ? undefined : "dimmed"}>
              {user.phone || "Not set"}
            </Text>
          }
        />
        <Divider />
        <SettingsRow
          label="Last sign-in"
          right={
            <Text size="xs" c={user.last_login ? undefined : "dimmed"}>
              {user.last_login
                ? new Date(user.last_login).toLocaleString()
                : "Never"}
            </Text>
          }
        />
      </Stack>
    </Stack>
  );
}
