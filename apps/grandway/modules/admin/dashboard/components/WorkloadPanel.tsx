"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor, Stack, Text } from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { useDashboardWorkload } from "../dashboard.hooks";
import { WORKLOAD_LIST_LABELS } from "../dashboard.labels";
import type { DashboardWorkload } from "../dashboard.types";
import { CategoryBarChart } from "./CategoryBarChart";
import { PanelCard } from "./PanelCard";
import { SectionState } from "./SectionState";
import { StackedBarChart } from "./StackedBarChart";
import type { WorkloadPanelProps } from "./WorkloadPanel.types";

const VIEWS = [
  {
    value: "leads",
    label: WORKLOAD_LIST_LABELS.leads,
    description: "Open leads on each owner's book",
    href: "/admin/lead-management",
  },
  {
    value: "checklist",
    label: WORKLOAD_LIST_LABELS.checklist_items,
    description: "Open, overdue and blocked items per owner",
    href: "/admin/checklists",
  },
  {
    value: "offers",
    label: WORKLOAD_LIST_LABELS.offers,
    description: "Counted by who recorded the offer, not an assignee",
    href: "/admin/offers",
  },
];

function WorkloadView({
  view,
  data,
}: {
  view: string;
  data: DashboardWorkload;
}) {
  if (view === "leads") {
    return data.leads.length === 0 ? (
      <Empty message="No leads on any owner's book." />
    ) : (
      <CategoryBarChart
        orientation="horizontal"
        color="blue"
        ariaLabel="Open leads by owner"
        items={data.leads.map((row) => ({
          label: row.owner_display_name,
          value: row.open_leads,
        }))}
      />
    );
  }

  if (view === "checklist") {
    return data.checklist_items.length === 0 ? (
      <Empty message="No open checklist items." />
    ) : (
      <StackedBarChart
        indexKey="owner"
        ariaLabel="Open, overdue and blocked checklist items by owner"
        data={data.checklist_items.map((row) => ({
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

  return data.offers.length === 0 ? (
    <Empty message="No offers awaiting a response." />
  ) : (
    <CategoryBarChart
      orientation="horizontal"
      color="violet"
      ariaLabel="Offers awaiting response by owner"
      items={data.offers.map((row) => ({
        label: row.owner_display_name,
        value: row.awaiting_response,
      }))}
    />
  );
}

function Empty({ message }: { message: string }) {
  return (
    <Text size="sm" c="dimmed" py="xs">
      {message}
    </Text>
  );
}

/**
 * Who is carrying what. `is_scoped_to_caller` drives the CAPTION only
 * (INTEGRATION.md §7) — never infer team size from row count, and never
 * re-filter rows the backend chose to include: the "Unassigned" bucket stays a
 * visible bar for everyone, because unowned work is the work most likely to be
 * dropped.
 *
 * The three measures are not joinable into one row per person and must never be
 * summed, which is exactly why they are three views of one card rather than
 * three series of one chart.
 */
export function WorkloadPanel({ filters }: WorkloadPanelProps) {
  const [view, setView] = useState("leads");
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardWorkload(filters);
  const active = VIEWS.find((entry) => entry.value === view);

  return (
    <PanelCard
      title="Workload"
      subtitle={active?.description}
      icon={UsersThreeIcon}
      views={VIEWS}
      activeView={view}
      onViewChange={setView}
      actions={
        active ? (
          <Anchor component={Link} href={active.href} size="xs" fw={500}>
            View list <ArrowRightIcon size={11} aria-hidden />
          </Anchor>
        ) : null
      }
      minBodyHeight={300}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load workload."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={300}
      >
        {data ? (
          <Stack gap="sm">
            {data.is_scoped_to_caller ? (
              <Text size="xs" c="dimmed" fs="italic">
                Scoped to you — the leads measure shows only your own book;
                checklist items are never owner-scoped, so the unassigned bucket
                stays visible.
              </Text>
            ) : null}
            <WorkloadView view={view} data={data} />
          </Stack>
        ) : null}
      </SectionState>
    </PanelCard>
  );
}
