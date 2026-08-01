"use client";

import {
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@peppermint/ui";
import type { StatTileProps, StatTileTone } from "./StatTile.types";

/** Severity is carried by the tile's colour AND its label — never colour alone. */
const TONE_COLOR: Record<StatTileTone, string> = {
  volume: "gray",
  critical: "red",
  warning: "orange",
  routine: "gray",
};

/**
 * One number and what it counts. The dashboard's smallest unit and the whole of
 * the first band, so it does exactly three things: name the figure, show it at a
 * size you can read across the room, and — for the alerts — take you to the rows
 * behind it.
 *
 * The icon names the ENTITY (leads, journeys, checklist items) and is the same
 * glyph that entity wears in the nav rail; urgency is the tone colour plus the
 * label ("Overdue" vs "Due soon"), so three checklist tiles legitimately share
 * one icon rather than inventing three (DESIGN.md §1.8 — one icon per concept).
 *
 * A failed fetch renders `—`, never `0`: "we could not ask" and "there are none"
 * are different facts, and on an alert tile confusing them is the dangerous
 * direction.
 */
export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "volume",
  isPending = false,
  isError = false,
  onActivate,
  activateLabel,
}: StatTileProps) {
  const color = TONE_COLOR[tone];
  const isAlerting = !isError && (value ?? 0) > 0 && tone !== "volume";

  const body = (
    <Card
      withBorder
      radius="md"
      p="md"
      h="100%"
      // A raised alert reads first: a tinted left edge on the tiles that are
      // actually non-zero, so a wall of quiet zeros can't hide the one that isn't.
      style={{
        borderLeft: isAlerting
          ? `3px solid var(--mantine-color-${color}-6)`
          : undefined,
      }}
    >
      <Group gap="sm" wrap="nowrap" align="center">
        <ThemeIcon
          size={36}
          radius="md"
          variant="light"
          color={isAlerting ? color : "gray"}
        >
          <Icon size={18} />
        </ThemeIcon>
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" truncate>
            {label}
          </Text>
          {isPending ? (
            <Skeleton height={22} width={56} radius="sm" />
          ) : (
            <Text
              fz={22}
              fw={700}
              lh={1.1}
              c={isAlerting ? color : undefined}
              style={{ letterSpacing: "-0.02em" }}
            >
              {isError || value === undefined ? "—" : value.toLocaleString()}
            </Text>
          )}
        </Stack>
      </Group>
    </Card>
  );

  if (!onActivate) return body;

  return (
    <UnstyledButton
      onClick={onActivate}
      aria-label={activateLabel}
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      {body}
    </UnstyledButton>
  );
}
