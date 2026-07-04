"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Center,
  Code,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Text,
} from "@peppermint/ui";

import { fetchUserAuthEvents } from "../../../../../../users.api";
import { usersQueryKeys } from "../../../../../../users.queryKeys";
import type { AuthEventType } from "../../../../../../users.types";
import type { AuthEventsTabProps } from "./AuthEventsTab.types";

const PAGE_SIZE = 10;

const EVENT_TYPE_OPTIONS: { value: AuthEventType; label: string }[] = [
  { value: "login_success", label: "Login success" },
  { value: "login_failed", label: "Login failed" },
  { value: "login_blocked_disabled", label: "Login blocked (disabled)" },
  { value: "login_blocked_inactive", label: "Login blocked (inactive)" },
  { value: "login_blocked_locked", label: "Login blocked (locked)" },
  {
    value: "login_blocked_device_limit",
    label: "Login blocked (device limit)",
  },
  { value: "logout_success", label: "Logout success" },
  { value: "refresh_success", label: "Refresh success" },
  { value: "refresh_failed", label: "Refresh failed" },
  { value: "password_changed", label: "Password changed" },
  {
    value: "password_reset_requested",
    label: "Password reset requested",
  },
  {
    value: "password_reset_completed",
    label: "Password reset completed",
  },
  { value: "account_locked", label: "Account locked" },
  { value: "account_unlocked", label: "Account unlocked" },
  { value: "login_enabled", label: "Login enabled" },
  { value: "login_disabled", label: "Login disabled" },
  { value: "mfa_challenge_created", label: "MFA challenge created" },
  { value: "mfa_challenge_failed", label: "MFA challenge failed" },
  { value: "mfa_challenge_success", label: "MFA challenge success" },
  { value: "mfa_disabled", label: "MFA disabled" },
  { value: "mfa_reset_by_staff", label: "MFA reset by staff" },
  { value: "session_revoked", label: "Session revoked" },
  { value: "all_sessions_revoked", label: "All sessions revoked" },
  {
    value: "service_account_credential_created",
    label: "Service account credential created",
  },
  {
    value: "service_account_credential_revoked",
    label: "Service account credential revoked",
  },
  {
    value: "service_account_auth_failed",
    label: "Service account auth failed",
  },
];

export function AuthEventsTab({ userId }: AuthEventsTabProps) {
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: usersQueryKeys.authEvents(userId, page, eventType ?? undefined),
    queryFn: () =>
      fetchUserAuthEvents(userId, {
        page,
        pageSize: PAGE_SIZE,
        eventType: (eventType as AuthEventType) || undefined,
      }),
  });

  if (isLoading) {
    return (
      <Center h={160}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Text size="sm" c="red">
        Couldn&apos;t load auth events.
      </Text>
    );
  }

  const events = data?.data ?? [];

  return (
    <Stack gap="md">
      <Select
        label="Event type"
        placeholder="All events"
        clearable
        data={EVENT_TYPE_OPTIONS}
        value={eventType}
        onChange={(value) => {
          setEventType(value);
          setPage(1);
        }}
      />

      {events.length === 0 ? (
        <Text size="sm" c="dimmed">
          No auth events recorded.
        </Text>
      ) : (
        <Stack gap="xs">
          {events.map((event) => (
            <Stack
              key={event.id}
              gap={4}
              p="xs"
              bg="var(--mantine-color-default-hover)"
              style={{ borderRadius: 6 }}
            >
              <Group justify="space-between">
                <Badge size="xs" color={event.success ? "green" : "red"}>
                  {event.event_type}
                </Badge>
                <Text size="xs" c="dimmed">
                  {event.created_at}
                </Text>
              </Group>
              <Text size="xs">
                {event.identifier_entered}
                {event.ip_address ? ` · ${event.ip_address}` : ""}
              </Text>
              {event.failure_reason && (
                <Text size="xs" c="red">
                  {event.failure_reason}
                </Text>
              )}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <Code block fz={10}>
                  {JSON.stringify(event.metadata)}
                </Code>
              )}
            </Stack>
          ))}
        </Stack>
      )}

      {data && data.meta.total > PAGE_SIZE && (
        <Group justify="center">
          <Pagination
            total={Math.ceil(data.meta.total / PAGE_SIZE)}
            value={page}
            onChange={setPage}
            size="xs"
          />
        </Group>
      )}
    </Stack>
  );
}
