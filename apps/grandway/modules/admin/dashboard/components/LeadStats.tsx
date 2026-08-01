"use client";

import { Group, Stack, Text } from "@peppermint/ui";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import {
  STAGE_COLORS,
  STAGE_LABELS,
} from "@/modules/admin/lead-management/leadCategory.utils";
import { useDashboardPipeline } from "../dashboard.hooks";
import type { LeadStageKey } from "../dashboard.types";
import { DonutStat } from "./DonutStat";
import { PanelCard } from "./PanelCard";
import { SectionState } from "./SectionState";
import type { LeadStatsProps } from "./LeadStats.types";

/**
 * The stages a lead can still be worked in. `converted` and `lost` are terminal
 * and are deliberately NOT slices: the ring answers "where are my live leads",
 * and folding two settled outcomes into it would make the live pipeline look
 * larger than it is. Both are reported as words underneath instead.
 */
const LIVE_STAGES: LeadStageKey[] = [
  "new",
  "contact_attempted",
  "contacted",
  "counselling",
  "follow_up",
  "ready_for_conversion",
];

/**
 * Every lead figure that can honestly be one figure, grouped into one card:
 * the live total in the ring's centre, the stage split as its slices, and the
 * two settled outcomes as a quiet footer.
 *
 * Counts come from `pipeline.leads_by_stage` — backend-computed and zero-filled,
 * so no stage silently disappears when it empties, and the ring total can never
 * disagree with its own slices. Stage colours and labels are imported from
 * lead-management, so a stage means the same thing here as it does on the board.
 */
export function LeadStats({ filters }: LeadStatsProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardPipeline(filters);

  const byStage = data?.leads_by_stage;
  const items = LIVE_STAGES.map((stage) => ({
    label: STAGE_LABELS[stage],
    value: byStage?.[stage] ?? 0,
    color: STAGE_COLORS[stage],
  }));
  const liveTotal = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <PanelCard
      title="Leads"
      subtitle="Where the live pipeline sits right now"
      icon={AddressBookIcon}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load the lead pipeline."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={260}
      >
        {byStage ? (
          <Stack gap="sm">
            <DonutStat
              items={items}
              centerValue={liveTotal.toLocaleString()}
              centerLabel="live leads"
              layout="vertical"
              size={148}
            />
            {/* Settled outcomes, reported as words rather than slices — they are
                not part of the live total the ring is showing. */}
            <Group gap="lg" wrap="nowrap">
              <Text size="xs" c="dimmed">
                Converted{" "}
                <Text span fw={700} c="teal">
                  {byStage.converted.toLocaleString()}
                </Text>
              </Text>
              <Text size="xs" c="dimmed">
                Lost{" "}
                <Text span fw={700}>
                  {byStage.lost.toLocaleString()}
                </Text>
              </Text>
            </Group>
          </Stack>
        ) : null}
      </SectionState>
    </PanelCard>
  );
}
