"use client";

import type { CSSProperties } from "react";
import {
  Badge,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";
import classes from "./StatTile.module.css";
import type { StatTileProps, StatTileTone } from "./StatTile.types";

/** Severity is carried by the tile's colour AND its label — never colour alone. */
const TONE_COLOR: Record<StatTileTone, string> = {
  volume: "teal",
  critical: "red",
  warning: "orange",
  routine: "violet",
};

/**
 * The word in the footer pill when the tile is non-zero. It names the BAND, not
 * the count, so the pill never restates the figure sitting above it.
 */
const TONE_STATE: Record<StatTileTone, string> = {
  volume: "",
  critical: "Breached",
  warning: "At risk",
  routine: "Queued",
};

/**
 * One number and what it counts. The dashboard's smallest unit and the whole of
 * the first band, so it does exactly three things: name the figure, show it at a
 * size you can read across the room, and — for the alerts — take you to the rows
 * behind it.
 *
 * Layout is three stacked registers, so the eye lands in the same place on every
 * tile in the grid (1.8): a tinted band carrying the icon + label, the figure at
 * display size, then a footer pairing the caption with a state pill. The tint is
 * the tone, which is why a wall of quiet volumes can't hide the one alert that
 * isn't quiet — the band colour differs pre-attentively (1.1).
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
  caption,
  isPending = false,
  isError = false,
  onActivate,
  activateLabel,
}: StatTileProps) {
  const color = TONE_COLOR[tone];
  const isAlerting = !isError && (value ?? 0) > 0 && tone !== "volume";
  const isInteractive = Boolean(onActivate);

  // A resolved alert is worth saying out loud — "Clear" is a different fact from
  // an empty footer, and it is the one state an operator is glad to see.
  const pill =
    tone === "volume" || isError || isPending || value === undefined
      ? null
      : isAlerting
        ? { label: TONE_STATE[tone], color }
        : { label: "Clear", color: "teal" };

  const body = (
    <Card
      withBorder
      radius="lg"
      p={0}
      h="100%"
      shadow="xs"
      className={classes.card}
      data-interactive={isInteractive}
      style={
        {
          "--tile-tint": `var(--mantine-color-${color}-light)`,
        } as CSSProperties
      }
    >
      <Group
        gap="xs"
        wrap="nowrap"
        align="center"
        px="md"
        py="sm"
        className={classes.header}
        c={`var(--mantine-color-${color}-light-color)`}
      >
        <Icon size={18} aria-hidden />
        <Text size="sm" fw={500} truncate>
          {label}
        </Text>
      </Group>

      <Stack
        gap="xs"
        px="md"
        pt="sm"
        pb="md"
        justify="space-between"
        style={{ flex: 1 }}
      >
        {isPending ? (
          <Skeleton height={34} width={88} radius="sm" />
        ) : (
          <Text fz={34} fw={700} lh={1.05} style={{ letterSpacing: "-0.03em" }}>
            {isError || value === undefined ? "—" : value.toLocaleString()}
          </Text>
        )}

        <Group gap="xs" justify="space-between" wrap="nowrap">
          <Text size="xs" c="dimmed" truncate>
            {isError ? "Unavailable" : caption}
          </Text>
          {pill ? (
            <Badge size="sm" radius="sm" variant="light" color={pill.color}>
              {pill.label}
            </Badge>
          ) : null}
        </Group>
      </Stack>
    </Card>
  );

  if (!onActivate) return body;

  return (
    <UnstyledButton
      onClick={onActivate}
      aria-label={activateLabel}
      className={classes.trigger}
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      {body}
    </UnstyledButton>
  );
}
