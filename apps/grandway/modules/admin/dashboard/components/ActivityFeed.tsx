"use client";

import { useState } from "react";
import { Badge, Group, Pagination, Stack, Text } from "@peppermint/ui";
import { useDashboardActivity } from "../dashboard.hooks";
import { formatDate } from "../dashboard.utils";
import { SectionState } from "./SectionState";
import type { ActivityFeedProps } from "./ActivityFeed.types";

const PAGE_SIZE = 20;

/**
 * The only paginated section, newest first. Honours ONLY `fiscal_year`
 * (INTEGRATION.md §7 "activity") — the caption below says so explicitly
 * rather than letting the page-level filter bar imply the whole page is
 * filtered by country.
 */
export function ActivityFeed({ fiscalYear }: ActivityFeedProps) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardActivity({ fiscalYear, page, pageSize: PAGE_SIZE });

  const rows = data?.data ?? [];
  const total = data?.meta.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text fw={700}>Recent activity</Text>
        <Text size="xs" c="dimmed">
          Not narrowed by the destination country filter.
        </Text>
      </Group>
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load recent activity."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        isEmpty={!isPending && !isError && rows.length === 0}
        emptyMessage="No recorded activity yet."
        skeletonHeight={280}
      >
        <Stack gap="xs">
          {rows.map((row) => (
            <Group key={row.id} justify="space-between" wrap="nowrap" gap="sm">
              <Stack gap={0}>
                <Text size="sm">{row.summary}</Text>
                <Text size="xs" c="dimmed">
                  {row.app_label} — {row.actor_label}
                </Text>
              </Stack>
              <Stack gap={2} align="flex-end">
                <Badge size="sm" color={row.success ? "green" : "red"}>
                  {row.success ? "Succeeded" : "Failed"}
                </Badge>
                <Text size="xs" c="dimmed">
                  {formatDate(row.created_at, row.created_at_bs)}
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>

        {pageCount > 1 ? (
          <Group justify="flex-end" mt="sm">
            <Pagination
              total={pageCount}
              value={page}
              onChange={setPage}
              size="sm"
            />
          </Group>
        ) : null}
      </SectionState>
    </Stack>
  );
}
