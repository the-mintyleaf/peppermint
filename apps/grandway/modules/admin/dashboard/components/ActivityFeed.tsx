"use client";

import { useState } from "react";
import {
  Badge,
  Card,
  Group,
  Pagination,
  Stack,
  Table,
  Text,
} from "@peppermint/ui";
import { useDashboardActivity } from "../dashboard.hooks";
import { formatDate } from "../dashboard.utils";
import { SectionState } from "./SectionState";
import type { ActivityFeedProps } from "./ActivityFeed.types";

const PAGE_SIZE = 20;

/**
 * The only paginated section, newest first. Honours ONLY `fiscal_year`
 * (INTEGRATION.md §7 "activity") — the caption says so explicitly rather than
 * letting the page-level country filter imply the feed is narrowed. The design's
 * 14-day sparkline has no daily time series behind it; the honest at-a-glance
 * figure is the real total from `meta.count`, shown in the header.
 */
export function ActivityFeed({ fiscalYear }: ActivityFeedProps) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardActivity({ fiscalYear, page, pageSize: PAGE_SIZE });

  const rows = data?.data ?? [];
  const total = data?.meta.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = (page - 1) * PAGE_SIZE + rows.length;

  return (
    <Card withBorder radius="lg" p="lg">
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load recent activity."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        isEmpty={!isPending && !isError && rows.length === 0}
        emptyMessage="No recorded activity yet."
        skeletonHeight={320}
      >
        <Stack gap="md">
          <Group justify="space-between" align="baseline">
            <Text size="sm" c="dimmed">
              {total.toLocaleString()} events this fiscal year
            </Text>
            <Text size="xs" c="dimmed">
              Not narrowed by the destination country filter.
            </Text>
          </Group>

          <Table.ScrollContainer minWidth={720}>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>App</Table.Th>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Actor</Table.Th>
                  <Table.Th>Summary</Table.Th>
                  <Table.Th>Result</Table.Th>
                  <Table.Th ta="right">When</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => (
                  <Table.Tr key={row.id}>
                    <Table.Td>
                      <Text size="xs">{row.app_label}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" ff="monospace" c="dimmed">
                        {row.action}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{row.actor_label}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{row.summary}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="sm"
                        variant="light"
                        color={row.success ? "green" : "red"}
                      >
                        {row.success ? "ok" : "failed"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed" ff="monospace" ta="right">
                        {formatDate(row.created_at, row.created_at_bs)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              Showing {rangeStart}–{rangeEnd} of {total.toLocaleString()} events
            </Text>
            {pageCount > 1 ? (
              <Pagination
                total={pageCount}
                value={page}
                onChange={setPage}
                size="sm"
              />
            ) : null}
          </Group>
        </Stack>
      </SectionState>
    </Card>
  );
}
