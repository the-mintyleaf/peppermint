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
import { TONE_COLOR, TONE_WORD } from "../dashboard.tone";
import {
  DISPLAY_TRACKING,
  TYPE_FIGURE_LG,
  TYPE_FIGURE_SM,
} from "../dashboard.typeScale";
import classes from "./StatTile.module.css";
import type { StatTileProps } from "./StatTile.types";

/**
 * One number and what it counts — the dashboard's smallest unit. It does three
 * things: name the figure, show it at a size you can read across the room, and
 * (for the alerts) take you to the rows behind it.
 *
 * Three stacked registers, so the eye lands in the same place on every tile in
 * the grid (§1.8): a tinted band carrying the icon + label, the figure, then a
 * footer pairing the caption with a state pill. The tint IS the tone, and the
 * tone is computed from the figure by the caller (`toneForAlert`), so a wall of
 * quiet tiles re-colours itself the moment one of them stops being quiet (§1.1).
 * The pill carries the same fact as a word, so nothing here is colour-only.
 *
 * A failed fetch renders `—`, never `0`: "we could not ask" and "there are none"
 * are different facts, and on an alert tile confusing them is the dangerous
 * direction.
 */
export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  caption,
  size = "lg",
  isPending = false,
  isError = false,
  onActivate,
  activateLabel,
}: StatTileProps) {
  const color = TONE_COLOR[tone];
  const word = TONE_WORD[tone];
  const isReadable = !isPending && !isError && value !== undefined;
  const figureType = size === "lg" ? TYPE_FIGURE_LG : TYPE_FIGURE_SM;

  const body = (
    <Card
      withBorder
      radius="lg"
      p={0}
      h="100%"
      shadow="xs"
      className={classes.card}
      data-interactive={Boolean(onActivate)}
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
        px="sm"
        py="xs"
        className={classes.header}
        c={`var(--mantine-color-${color}-light-color)`}
      >
        <Icon size={16} aria-hidden />
        <Text size="xs" fw={600} truncate>
          {label}
        </Text>
      </Group>

      <Stack
        gap="xs"
        px="sm"
        pt="xs"
        pb="sm"
        justify="space-between"
        style={{ flex: 1 }}
      >
        {isPending ? (
          <Skeleton height={figureType.fz} width={72} radius="sm" />
        ) : (
          <Text {...figureType} style={DISPLAY_TRACKING}>
            {isError || value === undefined ? "—" : value.toLocaleString()}
          </Text>
        )}

        <Group gap={6} justify="space-between" wrap="nowrap">
          <Text size="xs" c="dimmed" truncate>
            {isError ? "Unavailable" : caption}
          </Text>
          {isReadable && word ? (
            <Badge size="xs" radius="sm" variant="light" color={color}>
              {word}
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
