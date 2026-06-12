"use client";

import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Table,
  Badge,
  ActionIcon,
  Skeleton,
  Center,
  Pagination,
} from "@zetsel/ui";
import { PenNibIcon } from "@phosphor-icons/react/dist/csr/PenNib";
import { CopySimpleIcon } from "@phosphor-icons/react/dist/csr/CopySimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDrafts, useDeleteDraft, useDuplicateDraft } from "../../drafts.hooks";
import type { ContentItem } from "@/modules/admin/shared/domain.types";

export function DraftsList() {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { data, isLoading, isError } = useDrafts(page, 20);
  const deleteDraft = useDeleteDraft();
  const duplicateDraft = useDuplicateDraft();

  const items = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Drafts</Title>
            <Text c="dimmed" size="sm">
              Review and manage your draft content
            </Text>
          </Stack>
        </Group>
      </Paper>

      <Paper radius="md" withBorder style={{ overflow: "hidden" }}>
        {isLoading && (
          <Stack gap="xs" p="md">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={48} radius="sm" />)}
          </Stack>
        )}

        {isError && (
          <Center py="xl">
            <Text c="red" size="sm">Failed to load drafts</Text>
          </Center>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <Text size="sm" c="dimmed">No drafts yet</Text>
              <Button
                size="sm"
                variant="light"
                leftSection={<PenNibIcon size={14} />}
                onClick={() => router.push("/admin/create")}
              >
                Create Content
              </Button>
            </Stack>
          </Center>
        )}

        {!isLoading && items.length > 0 && (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Source</Table.Th>
                <Table.Th>Platforms</Table.Th>
                <Table.Th>Updated</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item: ContentItem) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text size="sm" fw={500} lineClamp={1}>{item.title}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" variant="light" color={item.source === "agent" ? "violet" : "gray"}>
                      {item.source}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {item.variants.slice(0, 3).map((v) => (
                        <Badge key={v.platform} size="xs" variant="dot">{v.platform}</Badge>
                      ))}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">{new Date(item.updatedAt).toLocaleDateString()}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<PenNibIcon size={12} />}
                        onClick={() => router.push(`/admin/create?id=${item.id}`)}
                      >
                        Resume
                      </Button>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => duplicateDraft.mutate(item.id)}
                        aria-label="Duplicate draft"
                      >
                        <CopySimpleIcon size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => deleteDraft.mutate(item.id)}
                        aria-label="Delete draft"
                      >
                        <TrashIcon size={14} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        {totalPages > 1 && (
          <Group justify="center" p="md">
            <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
          </Group>
        )}
      </Paper>
    </Stack>
  );
}
