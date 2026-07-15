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
import { fetchUserSessions, revokeUserSessions } from "../../../../users.api";
import { usersQueryKeys } from "../../../../users.queryKeys";

interface UserSessionsPanelProps {
  userId: string;
  username: string;
}

/** Superadmin view of a target account's active device sessions, with revoke-all. */
export function UserSessionsPanel({
  userId,
  username,
}: UserSessionsPanelProps) {
  const {
    data: sessions,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: usersQueryKeys.detail(userId).concat("sessions"),
    queryFn: () => fetchUserSessions(userId),
  });

  const revokeMutation = useMutation({
    mutationFn: () => revokeUserSessions(userId),
    onSuccess: (result) => {
      refetch();
      notifications.show({
        color: "green",
        title: "Sessions revoked",
        message: `${result.sessions_revoked} session${
          result.sessions_revoked === 1 ? "" : "s"
        } revoked.`,
      });
    },
    onError: (error) =>
      notifications.show({
        color: "red",
        title: "Couldn't revoke sessions",
        message: getApiErrorMessage(error),
      }),
  });

  const requestRevoke = () =>
    modals.openConfirmModal({
      title: "Revoke sessions",
      children: `Sign ${username} out of every device?`,
      labels: { confirm: "Revoke", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => revokeMutation.mutate(),
    });

  const hasSessions = Boolean(sessions && sessions.length > 0);

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
        message="Couldn't load sessions."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button
          size="compact-xs"
          variant="light"
          color="red"
          onClick={requestRevoke}
          loading={revokeMutation.isPending}
          disabled={!hasSessions}
        >
          Revoke all sessions
        </Button>
      </Group>
      {!hasSessions ? (
        <Text size="xs" c="dimmed">
          No active sessions.
        </Text>
      ) : (
        sessions!.map((session) => (
          <Group key={session.id} gap="sm" wrap="nowrap" align="flex-start">
            <DesktopIcon size={16} aria-hidden />
            <Stack gap={2}>
              <Group gap="xs">
                <Text size="xs" fw={500}>
                  {session.ua_summary || "Unknown device"}
                </Text>
                {session.is_current ? (
                  <Badge size="xs" color="teal" variant="light">
                    Current
                  </Badge>
                ) : null}
              </Group>
              <Text size="xs" c="dimmed">
                {session.last_ip ?? "No IP"} · Last seen{" "}
                {formatRelative(session.last_seen_at)}
              </Text>
            </Stack>
          </Group>
        ))
      )}
    </Stack>
  );
}
