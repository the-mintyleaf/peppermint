"use client";

import { Badge, Divider, Group, Loader, Stack, Text } from "@peppermint/ui";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { QueryErrorState } from "@/components/QueryErrorState";
import type { SettingsTabProps } from "../account-settings.types";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsRow } from "./SettingsRow";

function fullName(p: {
  first_name: string;
  middle_name: string;
  last_name: string;
}): string {
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ");
}

/**
 * Read-only view of the signed-in user's employee profile. Profile fields are managed
 * by administrators (grandway `PATCH /users/<id>/profile/`), so there is no self-edit.
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

  const p = user.employee_profile;

  return (
    <Stack gap="md">
      <SettingsHeader title={title} description={description} />
      <Text size="xs" c="dimmed">
        Profile details are managed by your administrator. Contact them to
        request a change.
      </Text>
      <Stack gap="sm">
        <SettingsRow
          label="Name"
          right={<Text size="xs">{fullName(p) || "—"}</Text>}
        />
        {p.preferred_name ? (
          <>
            <Divider />
            <SettingsRow
              label="Preferred name"
              right={<Text size="xs">{p.preferred_name}</Text>}
            />
          </>
        ) : null}
        <Divider />
        <SettingsRow
          label="Username"
          right={<Text size="xs">{user.username}</Text>}
        />
        <Divider />
        <SettingsRow
          label="Employee code"
          right={<Text size="xs">{p.employee_code}</Text>}
        />
        <Divider />
        <SettingsRow
          label="Job title"
          right={<Text size="xs">{p.job_title}</Text>}
        />
        <Divider />
        <SettingsRow
          label="Employment"
          description={`Started ${p.employment_start_date}${
            p.employment_end_date ? ` · Ended ${p.employment_end_date}` : ""
          }`}
          right={
            <Badge
              size="xs"
              variant="light"
              color={p.employment_status === "active" ? "teal" : "gray"}
            >
              {p.employment_status === "active" ? "Active" : "Ended"}
            </Badge>
          }
        />
        <Divider />
        <SettingsRow
          label="Contact email"
          right={
            <Text size="xs" c={p.email ? undefined : "dimmed"}>
              {p.email || "Not set"}
            </Text>
          }
        />
        <Divider />
        <SettingsRow
          label="Contact phone"
          right={
            <Text size="xs" c={p.phone ? undefined : "dimmed"}>
              {p.phone || "Not set"}
            </Text>
          }
        />
      </Stack>
    </Stack>
  );
}
