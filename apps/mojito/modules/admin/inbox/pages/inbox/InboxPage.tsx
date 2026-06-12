"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Grid,
  Pagination,
  Badge,
} from "@zetsel/ui";
import { useState } from "react";
import { useConversations } from "../../inbox.hooks";
import { ConversationList } from "../../components/ConversationList/ConversationList";
import { ConversationThread } from "../../components/ConversationThread/ConversationThread";
import { InboxFilters } from "../../components/InboxFilters/InboxFilters";
import type { InboxFilters as Filters } from "../../inbox.api";

export function InboxPage() {
  const [filters, setFilters] = useState<Filters>({ page: 1, pageSize: 15 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useConversations(filters);

  const conversations = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const pageCount = Math.ceil(total / (filters.pageSize ?? 15));

  const openCount = conversations.filter((c) => c.status === "open").length;

  function updateFilters(patch: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
    setSelectedId(null);
  }

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Group gap="sm">
              <Title order={3}>Inbox</Title>
              {openCount > 0 && (
                <Badge color="red" size="sm">{openCount} open</Badge>
              )}
            </Group>
            <Text c="dimmed" size="sm">Manage comments, mentions, DMs, and reviews across channels</Text>
          </Stack>
        </Group>
      </Paper>

      <Grid gutter="md" style={{ flex: 1 }}>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder radius="md" style={{ height: "calc(100vh - 240px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <InboxFilters filters={filters} onChange={updateFilters} />
            <div style={{ flex: 1, overflow: "auto" }}>
              <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={setSelectedId}
                isLoading={isLoading}
              />
            </div>
            {pageCount > 1 && (
              <div style={{ padding: "8px", borderTop: "1px solid var(--mantine-color-default-border)" }}>
                <Pagination
                  size="xs"
                  total={pageCount}
                  value={filters.page ?? 1}
                  onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
                />
              </div>
            )}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper
            withBorder
            radius="md"
            style={{ height: "calc(100vh - 240px)", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {selectedId ? (
              <ConversationThread conversationId={selectedId} />
            ) : (
              <Stack align="center" justify="center" h="100%">
                <Text c="dimmed" size="sm">Select a conversation to view the thread</Text>
              </Stack>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
