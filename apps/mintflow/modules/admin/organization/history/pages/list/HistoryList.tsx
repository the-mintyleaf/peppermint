"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Group, Paper, Stack, Text } from "@peppermint/ui";
import { EventLogList } from "../../../_shared/EventLogList";
import type { EventLogFilters } from "../../../_shared/EventLogList";
import { useHistory } from "../../history.hooks";

const PAGE_SIZE = 20;

export function HistoryList() {
  const { id: orgId } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EventLogFilters>({});

  const { data, isFetching } = useHistory(orgId, {
    page,
    pageSize: PAGE_SIZE,
    eventType: filters.eventType || undefined,
    actingAssignment: filters.actingAssignment || undefined,
  });

  function handleFiltersChange(next: EventLogFilters) {
    setFilters(next);
    setPage(1);
  }

  return (
    <Paper
      p="md"
      withBorder
      radius="var(--mantine-radius-default)"
      style={{ minHeight: "calc(100vh - 16px)" }}
    >
      <Stack gap="md">
        <Group>
          <Text fw={600} size="lg">
            Event History
          </Text>
          <Text size="sm" c="dimmed">
            Read-only audit trail — all organisational events, newest first
          </Text>
        </Group>
        <EventLogList
          events={data?.data ?? []}
          loading={isFetching}
          total={data?.meta.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </Stack>
    </Paper>
  );
}
