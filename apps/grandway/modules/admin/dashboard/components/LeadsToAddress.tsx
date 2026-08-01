"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Anchor, Divider, Stack, Text } from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { UserListIcon } from "@phosphor-icons/react/dist/csr/UserList";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from "@/modules/admin/lead-management/leadCategory.utils";
import { useLeadBoardData } from "@/modules/admin/lead-management/leadManagement.hooks";
import type {
  LeadBoardRow,
  LeadCategory,
} from "@/modules/admin/lead-management/leadManagement.types";
import { LeadRowView } from "./LeadRowView";
import { PanelCard } from "./PanelCard";
import { SectionState } from "./SectionState";
import type { LeadsToAddressProps } from "./LeadsToAddress.types";

/** Enough rows to see the shape of the queue; the board is one click away for the rest. */
const VISIBLE_ROWS = 6;

/** What each category means, so the menu explains the choice rather than just naming it. */
const CATEGORY_DESCRIPTIONS: Record<LeadCategory, string> = {
  needs_attention: "Untouched past the follow-up window",
  upcoming: "Progressing — counselling, follow-ups, ready to convert",
  active: "Alive and recently touched",
  dead: "Lost or already converted",
};

/** Oldest touch first: the row that has waited longest is the one to call first. */
function byStalest(a: LeadBoardRow, b: LeadBoardRow): number {
  const left = a.last_followed_up_at ?? a.created_at;
  const right = b.last_followed_up_at ?? b.created_at;
  return new Date(left).getTime() - new Date(right).getTime();
}

/**
 * The day's lead queue — the working half of the leads band, and the reason the
 * band leads the page: of everything on this dashboard, an untouched lead is
 * the thing that decays fastest.
 *
 * Rows are bucketed by `categorizeLead`, the lead board's own heuristic, read
 * from the board's own cached query — so the categories, their counts and the
 * board itself are the same four buckets and can never drift into two versions
 * of "needs attention". The buckets are mutually exclusive, so the menu's counts
 * sum to the lead total rather than overlapping.
 *
 * The queue opens on "Needs attention today" because a queue should open on the
 * rows that are actually late, not on the largest bucket.
 */
export function LeadsToAddress({ filters }: LeadsToAddressProps) {
  const [category, setCategory] = useState<LeadCategory>("needs_attention");
  const board = useLeadBoardData(filters.fiscalYear || null);

  const rows = useMemo(
    () =>
      board.rows
        .filter((row) => row.category === category)
        .sort(byStalest)
        .slice(0, VISIBLE_ROWS),
    [board.rows, category],
  );

  const total = board.counts[category];
  const views = CATEGORY_ORDER.map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
    description: CATEGORY_DESCRIPTIONS[value],
    count: board.isLoading ? undefined : board.counts[value],
  }));

  return (
    <PanelCard
      title="Leads to address today"
      subtitle={CATEGORY_DESCRIPTIONS[category]}
      icon={UserListIcon}
      views={views}
      activeView={category}
      onViewChange={(value) => setCategory(value as LeadCategory)}
      actions={
        <Anchor
          component={Link}
          href="/admin/lead-management"
          size="xs"
          fw={500}
        >
          Open board <ArrowRightIcon size={11} aria-hidden />
        </Anchor>
      }
      minBodyHeight={300}
    >
      <SectionState
        isPending={board.isLoading}
        isError={board.isError}
        errorMessage="Couldn't load leads."
        onRetry={board.refetch}
        isEmpty={rows.length === 0}
        emptyMessage={`Nothing in "${CATEGORY_LABELS[category]}" right now.`}
        skeletonHeight={300}
      >
        <Stack gap={0}>
          {rows.map((lead, index) => (
            <Stack key={lead.id} gap={0}>
              {index > 0 ? <Divider /> : null}
              <LeadRowView lead={lead} />
            </Stack>
          ))}

          {total > rows.length ? (
            <Text size="xs" c="dimmed" pt="xs">
              Showing the {rows.length} longest-waiting of{" "}
              {total.toLocaleString()}.
            </Text>
          ) : null}

          {/* The board caps its own fetch; saying so is the difference between
              "these are all of them" and "these are the ones we could see". */}
          {board.capped ? (
            <Text size="xs" c="dimmed" pt={4}>
              Counted over the first 1,000 leads in scope.
            </Text>
          ) : null}
        </Stack>
      </SectionState>
    </PanelCard>
  );
}
