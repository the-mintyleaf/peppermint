"use client";

import Link from "next/link";
import { Anchor, Card, Stack, Tabs, Text } from "@peppermint/ui";
import { useDashboardWorkload } from "../dashboard.hooks";
import { WORKLOAD_LIST_LABELS } from "../dashboard.labels";
import type {
  ChecklistWorkloadRow,
  DashboardFilters,
  LeadWorkloadRow,
  OfferWorkloadRow,
} from "../dashboard.types";
import { CategoryBarChart } from "./CategoryBarChart";
import { SectionState } from "./SectionState";
import { StackedBarChart } from "./StackedBarChart";

function LeadsPanel({ rows }: { rows: LeadWorkloadRow[] }) {
  if (rows.length === 0) {
    return <EmptyRow message="No leads on any owner's book." />;
  }
  return (
    <CategoryBarChart
      orientation="horizontal"
      color="blue"
      ariaLabel="Open leads by owner"
      items={rows.map((row) => ({
        label: row.owner_display_name,
        value: row.open_leads,
      }))}
    />
  );
}

function ChecklistPanel({ rows }: { rows: ChecklistWorkloadRow[] }) {
  if (rows.length === 0) {
    return <EmptyRow message="No open checklist items." />;
  }
  return (
    <StackedBarChart
      indexKey="owner"
      ariaLabel="Open, overdue and blocked checklist items by owner"
      data={rows.map((row) => ({
        owner: row.owner_display_name,
        open: row.open_items,
        overdue: row.overdue_items,
        blocked: row.blocked_items,
      }))}
      series={[
        { name: "open", label: "Open", color: "blue" },
        { name: "overdue", label: "Overdue", color: "red" },
        { name: "blocked", label: "Blocked", color: "grape" },
      ]}
    />
  );
}

function OffersPanel({ rows }: { rows: OfferWorkloadRow[] }) {
  if (rows.length === 0) {
    return <EmptyRow message="No offers awaiting a response." />;
  }
  return (
    <CategoryBarChart
      orientation="horizontal"
      color="violet"
      ariaLabel="Offers awaiting response by owner"
      items={rows.map((row) => ({
        label: row.owner_display_name,
        value: row.awaiting_response,
      }))}
    />
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
 * backend already decided to include (the unassigned "Unassigned" bucket stays a
 * visible bar for everyone). The three measures are NOT joinable into one row per
 * person and are never summed, so each is its own tab, never merged. "Recorded by"
 * (not an assignee) is who is counted on the offers measure.
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
