"use client";

import {
  ActionIcon,
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
import { DesktopIcon } from "@phosphor-icons/react/dist/csr/Desktop";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { getDeviceId } from "@/lib/deviceId";
import { clearAuthTokens } from "@/lib/authTokens";
import { QueryErrorState } from "@/components/QueryErrorState";
import { fetchSessions, revokeSessions } from "../account-settings.api";
import type { Session } from "@/modules/admin/authenticate/_shared/authenticate.types";
import type { SettingsTabProps } from "../account-settings.types";
import { SettingsHeader } from "./SettingsHeader";

const SESSIONS_QUERY_KEY = ["auth", "sessions"];

function SessionRow({
  session,
  isCurrent,
  onRevoke,
  isRevoking,
}: {
  session: Session;
  isCurrent: boolean;
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}) {
  return (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      <DesktopIcon size={16} aria-hidden />
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Group gap="xs">
          <Text size="xs" fw={500}>
            {session.device_name || session.user_agent || "Unknown device"}
          </Text>
          {isCurrent ? (
            <Badge size="xs" color="teal" variant="light">
              This device
            </Badge>
          ) : null}
        </Group>
        <Text size="xs" c="dimmed">
          {session.ip_address ?? "No IP recorded"} · Last used{" "}
          {new Date(session.last_used_at).toLocaleString()}
        </Text>
      </Stack>
      {!isCurrent ? (
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          aria-label="Sign out this device"
          loading={isRevoking}
          onClick={() => onRevoke(session.id)}
        >
          <SignOutIcon size={16} aria-hidden />
        </ActionIcon>
      ) : null}
    </Group>
  );
}

/**
 * The signed-in user's device sessions (`GET /sessions/` /
 * `POST /sessions/revoke/` — `authenticate/docs/INTEGRATION.md` §7). "This device" is
 * inferred by matching `device_id` against the locally persisted id — the Session model
 * has no `is_current` flag.
 */
export function SessionsTab({ title, description }: SettingsTabProps) {
  const queryClient = useQueryClient();
  const deviceId = getDeviceId();
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

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });

  const revokeOneMutation = useMutation({
    mutationFn: (session_id: string) => revokeSessions({ session_id }),
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Device signed out",
        message: "That session has been revoked.",
      });
      invalidate();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't sign out that device",
        message: getApiErrorMessage(error),
      });
    },
  });

  const revokeOthersMutation = useMutation({
    mutationFn: () => revokeSessions({ others_only: true }),
    onSuccess: (result) => {
      notifications.show({
        color: "green",
        title: "Other devices signed out",
        message: `${result.revoked} session${result.revoked === 1 ? "" : "s"} revoked.`,
      });
      invalidate();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't sign out other devices",
        message: getApiErrorMessage(error),
      });
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => revokeSessions(),
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Signed out everywhere",
        message: "All sessions were revoked. Please sign in again.",
      });
      clearAuthTokens();
      if (typeof window !== "undefined") window.location.href = "/";
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't sign out sessions",
        message: getApiErrorMessage(error),
      });
    },
  });

  const requestRevokeOthers = () =>
    modals.openConfirmModal({
      title: "Sign out other devices",
      children: "This signs out every device except this one. Continue?",
      labels: { confirm: "Sign out others", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => revokeOthersMutation.mutate(),
    });

  const requestRevokeAll = () =>
    modals.openConfirmModal({
      title: "Sign out everywhere",
      children:
        "This signs out every session on your account, including this one. You'll need to sign in again. Continue?",
      labels: { confirm: "Sign out everywhere", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => revokeAllMutation.mutate(),
    });

  const hasSessions = Boolean(sessions && sessions.length > 0);
  const hasOtherSessions = Boolean(
    sessions && sessions.some((s) => s.device_id !== deviceId),
  );

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <SettingsHeader title={title} description={description} />
        <Group gap="xs" style={{ flexShrink: 0 }}>
          <Button
            size="compact-xs"
            variant="light"
            onClick={requestRevokeOthers}
            loading={revokeOthersMutation.isPending}
            disabled={!hasOtherSessions}
          >
            Sign out others
          </Button>
          <Button
            size="compact-xs"
            variant="light"
            color="red"
            onClick={requestRevokeAll}
            loading={revokeAllMutation.isPending}
            disabled={!hasSessions}
          >
            Sign out everywhere
          </Button>
        </Group>
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
            <SessionRow
              key={session.id}
              session={session}
              isCurrent={session.device_id === deviceId}
              onRevoke={(sessionId) => revokeOneMutation.mutate(sessionId)}
              isRevoking={
                revokeOneMutation.isPending &&
                revokeOneMutation.variables === session.id
              }
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
