"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Pagination,
  Stack,
  Table,
  Text,
  Tooltip,
  modals,
  notifications,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";

import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { OneTimeSecretModal } from "@/modules/admin/authenticate/_shared/OneTimeSecretModal";
import { QueryErrorState } from "@/components/QueryErrorState";

import {
  fetchUserServiceAccountCredentials,
  revokeServiceAccountCredential,
} from "../../../../../../users.api";
import { usersQueryKeys } from "../../../../../../users.queryKeys";
import { CreateServiceAccountCredentialModalContent } from "../../../CreateServiceAccountCredentialModalContent";
import type { ServiceAccountsTabProps } from "./ServiceAccountsTab.types";

const PAGE_SIZE = 10;

export function ServiceAccountsTab({ userId }: ServiceAccountsTabProps) {
  const [page, setPage] = useState(1);
  const [newToken, setNewToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: usersQueryKeys.serviceAccountCredentials(userId, page),
    queryFn: () =>
      fetchUserServiceAccountCredentials(userId, {
        page,
        pageSize: PAGE_SIZE,
      }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: usersQueryKeys.serviceAccountCredentialsKey(userId),
    });

  const handleNewCredential = () => {
    modals.open({
      title: "New service account credential",
      children: (
        <CreateServiceAccountCredentialModalContent
          userId={userId}
          onCreated={setNewToken}
        />
      ),
    });
  };

  const revokeMutation = useMutation({
    mutationFn: (credentialId: string) =>
      revokeServiceAccountCredential(userId, credentialId),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Credential revoked." });
      invalidate();
    },
    onError: (error) =>
      notifications.show({ color: "red", message: getApiErrorMessage(error) }),
  });

  const handleRevoke = (credentialId: string) => {
    modals.openConfirmModal({
      title: "Revoke credential",
      children: (
        <Text size="sm">
          This credential will stop working immediately. Continue?
        </Text>
      ),
      labels: { confirm: "Revoke", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => revokeMutation.mutate(credentialId),
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
      <QueryErrorState
        message="Couldn't load service account credentials."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  const credentials = data?.data ?? [];

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button
          size="xs"
          leftSection={<PlusIcon size={14} aria-hidden />}
          onClick={handleNewCredential}
        >
          New credential
        </Button>
      </Group>

      {credentials.length === 0 ? (
        <Text size="sm" c="dimmed">
          No service account credentials yet.
        </Text>
      ) : (
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Key ID</Table.Th>
              <Table.Th>Last used</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {credentials.map((credential) => (
              <Table.Tr key={credential.id}>
                <Table.Td>
                  <Text size="xs">{credential.name ?? "—"}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" ff="monospace">
                    {credential.key_id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs">{credential.last_used_at ?? "Never"}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    size="xs"
                    color={credential.is_active ? "green" : "gray"}
                  >
                    {credential.is_active ? "Active" : "Revoked"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Tooltip label="Revoke" disabled={!credential.is_active}>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label="Revoke credential"
                      disabled={!credential.is_active}
                      onClick={() => handleRevoke(credential.id)}
                    >
                      <TrashIcon size={14} aria-hidden />
                    </ActionIcon>
                  </Tooltip>
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

      <OneTimeSecretModal
        opened={Boolean(newToken)}
        onClose={() => setNewToken(null)}
        title="Service account credential created"
        description="Store this token securely — it won't be shown again."
        secrets={newToken ? [newToken] : []}
      />
    </Stack>
  );
}
