"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Pagination,
  Stack,
  Table,
  Text,
  modals,
  notifications,
} from "@peppermint/ui";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import {
  fetchUserSessions,
  revokeAllUserSessions,
} from "../../../../../../users.api";
import { usersQueryKeys } from "../../../../../../users.queryKeys";
import type { SessionsTabProps } from "./SessionsTab.types";

const PAGE_SIZE = 10;

export function SessionsTab({ userId }: SessionsTabProps) {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: usersQueryKeys.sessions(userId, page),
    queryFn: () => fetchUserSessions(userId, { page, pageSize: PAGE_SIZE }),
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => revokeAllUserSessions(userId),
    onSuccess: (result) => {
      notifications.show({
        color: "green",
        message: `Revoked ${result.revoked_count} session(s).`,
      });
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.sessionsKey(userId),
      });
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error) }),
  });

  const handleRevokeAll = () => {
    modals.openConfirmModal({
      title: "Revoke all sessions",
      children: (
        <Text size="sm">
          This immediately signs the user out on every device. Continue?
        </Text>
      ),
      labels: { confirm: "Revoke all", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => revokeAllMutation.mutate(),
    });
  };

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
        Couldn&apos;t load sessions.
      </Text>
    );
  }

  const sessions = data?.data ?? [];

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button
          size="xs"
          color="red"
          variant="light"
          leftSection={<ArrowsClockwiseIcon size={14} aria-hidden />}
          loading={revokeAllMutation.isPending}
          onClick={handleRevokeAll}
        >
          Revoke all sessions
        </Button>
      </Group>

      {sessions.length === 0 ? (
        <Text size="sm" c="dimmed">
          No sessions recorded.
        </Text>
      ) : (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Device</Table.Th>
              <Table.Th>IP</Table.Th>
              <Table.Th>Last seen</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sessions.map((session) => (
              <Table.Tr key={session.id}>
                <Table.Td>
                  <Text size="xs">{session.device_label}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs">{session.ip_address}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs">{session.last_seen_at}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge size="xs" color={session.is_active ? "green" : "gray"}>
                    {session.is_active ? "Active" : "Revoked"}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
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
