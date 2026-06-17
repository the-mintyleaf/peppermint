"use client";

import {
  Stack,
  Group,
  Text,
  Paper,
  Grid,
  Pagination,
  Badge,
} from "@peppermint/ui";
import { useState } from "react";
import { useConversations } from "../../inbox.hooks";
import { ConversationList } from "../../components/ConversationList/ConversationList";
import { ConversationThread } from "../../components/ConversationThread/ConversationThread";
import { InboxFilters } from "../../components/InboxFilters/InboxFilters";
import type { InboxFilters as Filters } from "../../inbox.api";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/engage/inbox";
const MODULE_INFO = { name: "inbox", label: "Inbox" };

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
    <ModulePageShell
      basePath={BASE_PATH}
      moduleInfo={MODULE_INFO}
      disableCreateButton
      actions={
        openCount > 0 ? <Badge color="red" size="sm">{openCount} open</Badge> : undefined
      }
    >
      <Grid gutter={0} style={{ height: "calc(100vh - 160px)" }}>
        <Grid.Col
          span={{ base: 12, md: 4 }}
          style={{
            borderRight: "1px solid var(--mantine-color-default-border)",
            display: "flex",
            flexDirection: "column",
          }}
        >
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
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }} style={{ display: "flex", flexDirection: "column" }}>
          {selectedId ? (
            <ConversationThread conversationId={selectedId} />
          ) : (
            <Stack align="center" justify="center" h="100%">
              <Text c="dimmed" size="sm">Select a conversation to view the thread</Text>
            </Stack>
          )}
        </Grid.Col>
      </Grid>
    </ModulePageShell>
  );
}
