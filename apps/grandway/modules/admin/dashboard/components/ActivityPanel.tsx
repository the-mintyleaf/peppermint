"use client";

import { useState } from "react";
import { Badge, Divider, Group, Pagination, Stack, Text } from "@peppermint/ui";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { useDashboardActivity } from "../dashboard.hooks";
import { formatDate } from "../dashboard.utils";
import type { ActivityRow } from "../dashboard.types";
import { PanelCard } from "./PanelCard";
import { SectionState } from "./SectionState";
import type { ActivityPanelProps } from "./ActivityPanel.types";

/** Half-width card, so a page of 20 table rows would scroll horizontally; 8 event rows do not. */
const PAGE_SIZE = 8;

function EventRow({ row }: { row: ActivityRow }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="sm" py={6}>
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Text size="sm" truncate>
          {row.summary}
        </Text>
        <Text size="xs" c="dimmed" truncate>
          {row.actor_label} · {row.app_label} ·{" "}
          <Text span ff="monospace" inherit>
            {row.action}
          </Text>
        </Text>
      </Stack>
      <Stack gap={2} align="flex-end" style={{ flex: "none" }}>
        {/* Only a failure earns a badge — an "ok" pill on every row would spend
            the eye's attention on the normal case (§1.1). */}
        {row.success ? null : (
          <Badge size="xs" radius="sm" variant="light" color="red">
            Failed
          </Badge>
        )}
        <Text size="xs" c="dimmed">
          {formatDate(row.created_at, row.created_at_bs)}
        </Text>
      </Stack>
    </Group>
  );
}

/**
 * What just changed. The only paginated section, newest first, and the only one
 * that honours `fiscal_year` ALONE — the caption says so rather than letting the
 * page's country filter imply the feed is narrowed (INTEGRATION.md §7).
 *
 * Rendered as event rows rather than the six-column table it used to be: this
 * card is half the page wide, and a table that wide would scroll sideways to
 * show columns nobody scans. The design's 14-day sparkline has no daily time
 * series behind it; the honest at-a-glance figure is the real `meta.count`.
 */
export function ActivityPanel({ fiscalYear }: ActivityPanelProps) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardActivity({ fiscalYear, page, pageSize: PAGE_SIZE });

  const rows = data?.data ?? [];
  const total = data?.meta.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PanelCard
      title="Recent activity"
      subtitle="Fiscal year only — never narrowed by the destination filter"
      icon={PulseIcon}
      minBodyHeight={300}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load recent activity."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        isEmpty={!isPending && !isError && total === 0}
        emptyMessage="No recorded activity yet."
        skeletonHeight={300}
      >
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            {total.toLocaleString()} events this fiscal year
          </Text>

          {rows.length === 0 ? (
            // `total > 0` but this page is empty — the dataset shrank under a
            // stale page number. Keep the pager reachable instead of trapping
            // the reader on a blank page.
            <Text size="sm" c="dimmed" py="xs">
              No events on this page — step back a page.
            </Text>
          ) : (
            <Stack gap={0}>
              {rows.map((row, index) => (
                <Stack key={row.id} gap={0}>
                  {index > 0 ? <Divider /> : null}
                  <EventRow row={row} />
                </Stack>
              ))}
            </Stack>
          )}

          {pageCount > 1 ? (
            <Group justify="center" pt="xs">
              <Pagination
                total={pageCount}
                value={page}
                onChange={setPage}
                size="sm"
              />
            </Group>
          ) : null}
        </Stack>
      </SectionState>
    </PanelCard>
  );
}
