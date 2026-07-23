"use client";

import { useState } from "react";
import {
  ActionIcon,
  Group,
  Loader,
  Stack,
  Text,
  useQuery,
} from "@peppermint/ui";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { QueryErrorState } from "@/components/QueryErrorState";
import { fetchUserEvents } from "../../../../users.api";
import { usersQueryKeys } from "../../../../users.queryKeys";

const PAGE_SIZE = 10;

const EVENT_LABELS: Record<string, string> = {
  login_success: "Signed in",
  login_failure: "Sign-in failed",
  forced_password_change: "Forced password change",
  password_change: "Password changed",
  logout: "Signed out",
  session_refreshed: "Session refreshed",
  session_revoked: "Session revoked",
  account_created: "Account created",
  account_updated: "Account updated",
  account_blocked: "Account blocked",
  account_restored: "Account restored",
  admin_password_reset: "Password reset by manager",
  mfa_enabled: "Authenticator enabled",
  mfa_disabled: "Authenticator disabled",
  mfa_verification_failure: "Authenticator code rejected",
  mfa_reset: "Authenticator reset by manager",
  superadmin_bootstrap: "Superadmin bootstrapped",
};

/** A managed account's auth-activity feed (`GET /users/<id>/events/`), newest-first. */
export function UserEventsPanel({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: usersQueryKeys
      .detail(userId)
      .concat("events")
      .concat(String(page)),
    queryFn: () =>
      fetchUserEvents(userId, {
        page,
        pageSize: PAGE_SIZE,
        search: "",
        sort: [],
        filters: {},
      }),
  });

  if (isLoading) {
    return (
      <Group justify="center" py="lg">
        <Loader size="sm" />
      </Group>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load activity."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  const events = data?.data ?? [];
  const hasNext = Boolean(data?.meta.next);
  const hasPrev = page > 1;

  return (
    <Stack gap="md">
      {events.length === 0 ? (
        <Text size="xs" c="dimmed">
          No recorded activity.
        </Text>
      ) : (
        <Stack gap="sm">
          {events.map((event) => (
            <Stack key={event.id} gap={0}>
              <Group gap="xs">
                <Text size="xs" fw={500}>
                  {EVENT_LABELS[event.event_type] ?? event.event_type}
                </Text>
                <Text size="xs" c={event.success ? "teal" : "red"}>
                  {event.success ? "Success" : "Failed"}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                {new Date(event.created_at).toLocaleString()}
                {event.ip_address ? ` · ${event.ip_address}` : ""}
              </Text>
              {event.reason ? (
                <Text size="xs" c="dimmed">
                  {event.reason}
                </Text>
              ) : null}
            </Stack>
          ))}
        </Stack>
      )}
      <Group justify="space-between">
        <ActionIcon
          variant="default"
          size="sm"
          disabled={!hasPrev}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          aria-label="Previous page"
        >
          <CaretLeftIcon size={14} aria-hidden />
        </ActionIcon>
        <Text size="xs" c="dimmed">
          Page {page}
        </Text>
        <ActionIcon
          variant="default"
          size="sm"
          disabled={!hasNext}
          onClick={() => setPage((p) => p + 1)}
          aria-label="Next page"
        >
          <CaretRightIcon size={14} aria-hidden />
        </ActionIcon>
      </Group>
    </Stack>
  );
}
