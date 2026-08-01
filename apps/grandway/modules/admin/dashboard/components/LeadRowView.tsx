"use client";

import { Badge, Group, Stack, Text } from "@peppermint/ui";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import {
  STAGE_COLORS,
  STAGE_LABELS,
} from "@/modules/admin/lead-management/leadCategory.utils";
import { formatSince } from "../dashboard.utils";
import type { LeadRowViewProps } from "./LeadRowView.types";

/**
 * One lead in a dashboard queue. The row is built around the single question
 * "why is this here" — so the age of the last touch sits directly under the
 * name, in the same line of sight, rather than in a right-hand column the eye
 * has to travel to.
 *
 * The stage is a Badge: a fact, never something to click (§1.9). Nothing in the
 * row is a link — there is no per-lead route in this app, so a row that looked
 * clickable would promise a destination that does not exist; the card's header
 * carries the one real destination instead.
 */
export function LeadRowView({ lead }: LeadRowViewProps) {
  const name = lead.full_name?.trim() || lead.full_name_en || "Unnamed lead";
  const lastTouched = lead.last_followed_up_at;

  return (
    <Group justify="space-between" wrap="nowrap" gap="sm" py={6}>
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Text size="sm" fw={500} truncate>
          {name}
        </Text>
        <Group gap={5} wrap="nowrap">
          <ClockCounterClockwiseIcon size={12} aria-hidden />
          <Text size="xs" c="dimmed" truncate>
            {lastTouched
              ? `Followed up ${formatSince(lastTouched)}`
              : `Never followed up · added ${formatSince(lead.created_at)}`}
          </Text>
        </Group>
      </Stack>

      <Group gap="xs" wrap="nowrap" style={{ flex: "none" }}>
        <Text size="xs" c="dimmed" visibleFrom="sm" maw={110} truncate>
          {lead.created_by?.display_name}
        </Text>
        <Badge
          size="xs"
          radius="sm"
          variant="light"
          color={STAGE_COLORS[lead.stage]}
        >
          {STAGE_LABELS[lead.stage]}
        </Badge>
      </Group>
    </Group>
  );
}
