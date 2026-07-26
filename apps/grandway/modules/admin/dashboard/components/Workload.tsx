"use client";

import Link from "next/link";
import { Anchor, Box, Card, Group, Stack, Tabs, Text } from "@peppermint/ui";
import { useDashboardWorkload } from "../dashboard.hooks";
import { WORKLOAD_LIST_LABELS } from "../dashboard.labels";
import type {
  ChecklistWorkloadRow,
  DashboardFilters,
  LeadWorkloadRow,
  OfferWorkloadRow,
  OwnerRow,
} from "../dashboard.types";
import { MeterBar } from "./MeterBar";
import { SectionState } from "./SectionState";
import { StackedMeter } from "./StackedMeter";

function OwnerLabel({ row }: { row: OwnerRow }) {
  // The unassigned bucket is the work most likely to be missed — kept visible
  // and dimmed-but-present, never filtered out.
  const unassigned = row.owner_id == null;
  return (
    <Text
      size="xs"
      c={unassigned ? "dimmed" : undefined}
      fs={unassigned ? "italic" : undefined}
      truncate
    >
      {row.owner_display_name}
    </Text>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Group gap={6} wrap="nowrap">
      <Box
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: `var(--mantine-color-${color}-6)`,
        }}
      />
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    </Group>
  );
}

function MetricText({ label, value }: { label: string; value: number }) {
  return (
    <Text size="xs" ff="monospace" c="dimmed" style={{ whiteSpace: "nowrap" }}>
      {label} {value}
    </Text>
  );
}

function LeadsPanel({ rows }: { rows: LeadWorkloadRow[] }) {
  if (rows.length === 0) {
    return <EmptyRow message="No leads on any owner's book." />;
  }
  const max = Math.max(1, ...rows.map((r) => r.open_leads));
  return (
    <Stack gap="xs">
      {rows.map((row) => (
        <MeterBar
          key={row.owner_id ?? "unassigned"}
          label={<OwnerLabel row={row} />}
          value={row.open_leads}
          max={max}
          color="blue"
          labelWidth={150}
        />
      ))}
    </Stack>
  );
}

function ChecklistPanel({ rows }: { rows: ChecklistWorkloadRow[] }) {
  if (rows.length === 0) {
    return <EmptyRow message="No open checklist items." />;
  }
  const max = Math.max(
    1,
    ...rows.map((r) => r.open_items + r.overdue_items + r.blocked_items),
  );
  return (
    <Stack gap="sm">
      <Group gap="md" wrap="wrap">
        <LegendItem color="blue" label="Open" />
        <LegendItem color="red" label="Overdue" />
        <LegendItem color="grape" label="Blocked" />
      </Group>
      <Stack gap="xs">
        {rows.map((row) => (
          <StackedMeter
            key={row.owner_id ?? "unassigned"}
            label={<OwnerLabel row={row} />}
            max={max}
            labelWidth={150}
            segments={[
              { label: "Open", color: "blue", value: row.open_items },
              { label: "Overdue", color: "red", value: row.overdue_items },
              { label: "Blocked", color: "grape", value: row.blocked_items },
            ]}
            trailing={
              <Group gap="sm" wrap="nowrap" w={190} justify="flex-end">
                <MetricText label="open" value={row.open_items} />
                <MetricText label="overdue" value={row.overdue_items} />
                <MetricText label="blocked" value={row.blocked_items} />
              </Group>
            }
          />
        ))}
      </Stack>
    </Stack>
  );
}

function OffersPanel({ rows }: { rows: OfferWorkloadRow[] }) {
  if (rows.length === 0) {
    return <EmptyRow message="No offers awaiting a response." />;
  }
  const max = Math.max(1, ...rows.map((r) => r.awaiting_response));
  return (
    <Stack gap="xs">
      {rows.map((row) => (
        <MeterBar
          key={row.owner_id ?? "unassigned"}
          label={<OwnerLabel row={row} />}
          value={row.awaiting_response}
          max={max}
          color="violet"
          labelWidth={150}
        />
      ))}
    </Stack>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <Text size="sm" c="dimmed" py="xs">
      {message}
    </Text>
  );
}

/**
 * Branch on `is_scoped_to_caller` for the caption only (INTEGRATION.md §7
 * "workload") — never infer team size from row count, never re-filter rows the
 * backend already decided to include (the unassigned bucket must stay visible to
 * everyone). The three measures are NOT joinable into one row per person and are
 * never summed, so each is its own tab, never merged. "Recorded by" (not an
 * assignee) is who is counted on the offers measure.
 */
export function Workload({ filters }: { filters: DashboardFilters }) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardWorkload(filters);

  return (
    <Card withBorder radius="lg" p="lg">
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load workload."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={280}
      >
        {data ? (
          <Stack gap="md">
            {data.is_scoped_to_caller ? (
              <Text size="xs" c="dimmed" fs="italic">
                Scoped to you — the leads measure shows only your own book;
                checklist items are never owner-scoped, so the unassigned bucket
                stays visible.
              </Text>
            ) : null}
            <Tabs defaultValue="leads" keepMounted={false}>
              <Tabs.List aria-label="Workload measures">
                <Tabs.Tab value="leads">{WORKLOAD_LIST_LABELS.leads}</Tabs.Tab>
                <Tabs.Tab value="checklist">
                  {WORKLOAD_LIST_LABELS.checklist_items}
                </Tabs.Tab>
                <Tabs.Tab value="offers">
                  {WORKLOAD_LIST_LABELS.offers}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="leads" pt="md">
                <Stack gap="sm">
                  <LeadsPanel rows={data.leads} />
                  <Anchor
                    component={Link}
                    href="/admin/lead-management"
                    size="xs"
                  >
                    View leads →
                  </Anchor>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="checklist" pt="md">
                <Stack gap="sm">
                  <ChecklistPanel rows={data.checklist_items} />
                  <Anchor component={Link} href="/admin/checklists" size="xs">
                    View checklists →
                  </Anchor>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="offers" pt="md">
                <Stack gap="sm">
                  <Text size="xs" c="dimmed">
                    Counted by who recorded the offer, not an assignee.
                  </Text>
                  <OffersPanel rows={data.offers} />
                  <Anchor component={Link} href="/admin/offers" size="xs">
                    View offers →
                  </Anchor>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        ) : null}
      </SectionState>
    </Card>
  );
}
