"use client";

import {
  Badge,
  Button,
  Group,
  Loader,
  Stack,
  Text,
  modals,
  notifications,
  useMutation,
  useQuery,
} from "@peppermint/ui";
import { formatRelative } from "@peppermint/utils";
import { DesktopIcon } from "@phosphor-icons/react/dist/csr/Desktop";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { QueryErrorState } from "@/components/QueryErrorState";
import { fetchSessions, logoutAllSessions } from "../account-settings.api";
import type {
  SessionDevice,
  SettingsTabProps,
} from "../account-settings.types";
import { SettingsHeader } from "./SettingsHeader";

const SESSIONS_QUERY_KEY = ["auth", "sessions"];

function SessionRow({ session }: { session: SessionDevice }) {
  return (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      <DesktopIcon size={16} aria-hidden />
      <Stack gap={2}>
        <Group gap="xs">
          <Text size="xs" fw={500}>
            {session.ua_summary || "Unknown device"}
          </Text>
          {session.is_current ? (
            <Badge size="xs" color="teal" variant="light">
              This device
            </Badge>
          ) : null}
        </Group>
        <Text size="xs" c="dimmed">
          {session.last_ip ?? "No IP recorded"} · Last seen{" "}
          {formatRelative(session.last_seen_at)}
        </Text>
        <Text size="xs" c="dimmed">
          First seen {formatRelative(session.first_seen_at)}
        </Text>
      </Stack>
    </Group>
  );
}

/**
 * The signed-in user's device sessions. Individual revocation isn't exposed for own
 * sessions — the only lever is "log out all other devices" (grandway `logout-all/`),
 * which revokes everything and sends the user back to sign-in.
 */
export function SessionsTab({ title, description }: SettingsTabProps) {
  const {
    data: sessions,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: fetchSessions,
  });

  const logoutAllMutation = useMutation({
    mutationFn: logoutAllSessions,
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Signed out everywhere",
        message: "All sessions were revoked. Please sign in again.",
      });
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      }
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't sign out sessions",
        message: getApiErrorMessage(error),
      });
    },
  });

  const requestLogoutAll = () =>
    modals.openConfirmModal({
      title: "Log out all devices",
      children:
        "This signs out every session on your account, including this one. You'll need to sign in again. Continue?",
      labels: { confirm: "Log out everywhere", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => logoutAllMutation.mutate(),
    });

  const hasSessions = Boolean(sessions && sessions.length > 0);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <SettingsHeader title={title} description={description} />
        <Button
          size="compact-xs"
          variant="light"
          color="red"
          onClick={requestLogoutAll}
          loading={logoutAllMutation.isPending}
          disabled={!hasSessions}
          style={{ flexShrink: 0 }}
        >
          Log out all devices
        </Button>
      </Group>

      {isLoading ? (
        <Group justify="center" py="lg">
          <Loader size="sm" />
        </Group>
      ) : isError ? (
        <QueryErrorState
          message="Couldn't load your sessions."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : !hasSessions ? (
        <Text size="xs" c="dimmed">
          No active sessions found.
        </Text>
      ) : (
        <Stack gap="md">
          {sessions!.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
