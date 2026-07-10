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
  useQueryClient,
} from "@peppermint/ui";
import { formatRelative } from "@peppermint/utils";
import { DesktopIcon } from "@phosphor-icons/react/dist/csr/Desktop";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { QueryErrorState } from "@/components/QueryErrorState";
import {
  fetchSessions,
  revokeAllSessions,
  revokeSession,
} from "../account-settings.api";
import type { UserSession } from "../account-settings.types";

const SESSIONS_QUERY_KEY = ["auth", "sessions"];

function SessionRow({
  session,
  onRevoke,
  isRevoking,
}: {
  session: UserSession;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}) {
  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start">
      <Group gap="sm" wrap="nowrap" align="flex-start">
        <DesktopIcon size={16} aria-hidden />
        <Stack gap={2}>
          <Group gap="xs">
            <Text size="xs" fw={500}>
              {session.device_label ?? "Unknown device"}
            </Text>
            {!session.is_active && (
              <Badge size="xs" color="gray" variant="light">
                Inactive
              </Badge>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            {session.ip_address ?? "No IP recorded"} · Last seen{" "}
            {session.last_seen_at
              ? formatRelative(session.last_seen_at)
              : "never"}
          </Text>
          <Text size="xs" c="dimmed">
            Signed in {formatRelative(session.issued_at)} · Expires{" "}
            {formatRelative(session.expires_at)}
          </Text>
        </Stack>
      </Group>
      <Button
        size="compact-xs"
        variant="light"
        color="red"
        onClick={() => onRevoke(session.id)}
        disabled={isRevoking}
      >
        Revoke
      </Button>
    </Group>
  );
}

export function SessionsTab() {
  const queryClient = useQueryClient();

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

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      notifications.show({
        color: "green",
        title: "Session revoked",
        message: "That session has been signed out.",
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't revoke session",
        message: getApiErrorMessage(error),
      });
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      notifications.show({
        color: "green",
        title: "Sessions revoked",
        message: `${result.revoked_count} session${
          result.revoked_count === 1 ? "" : "s"
        } signed out. You may be asked to sign in again.`,
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't revoke sessions",
        message: getApiErrorMessage(error),
      });
    },
  });

  const requestRevoke = (id: string) =>
    modals.openConfirmModal({
      title: "Revoke session",
      children: "This device will be signed out. Continue?",
      labels: { confirm: "Revoke", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => revokeMutation.mutate(id),
    });

  const requestRevokeAll = () =>
    modals.openConfirmModal({
      title: "Revoke all other sessions",
      children:
        "This signs out every session on your account, which may include this one. Continue?",
      labels: { confirm: "Revoke all", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => revokeAllMutation.mutate(),
    });

  const hasSessions = Boolean(sessions && sessions.length > 0);

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button
          size="compact-xs"
          variant="light"
          color="red"
          onClick={requestRevokeAll}
          loading={revokeAllMutation.isPending}
          disabled={!hasSessions}
        >
          Revoke all other sessions
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
        <Stack gap="sm">
          {sessions!.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onRevoke={requestRevoke}
              isRevoking={revokeMutation.isPending}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
