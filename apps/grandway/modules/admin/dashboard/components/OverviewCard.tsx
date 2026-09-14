"use client";

import type { CSSProperties } from "react";
import {
  Badge,
  Box,
  Card,
  Group,
  Progress,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";
import { TONE_COLOR, TONE_WORD } from "../dashboard.tone";
import { DISPLAY_TRACKING, TYPE_FIGURE_LG } from "../dashboard.typeScale";
import classes from "./OverviewCard.module.css";
import type {
  OverviewCardProps,
  OverviewFigureProps,
} from "./OverviewCard.types";

/**
 * Every card in the headline grid is this height, whatever its body holds. A
 * figure, three meters and a donut are different KINDS of answer, not different
 * sizes of one — letting the tallest body set the row would make "we happen to
 * have three statuses here" look like importance (§1.1: hierarchy is earned, and
 * a uniform grid is what earns the right to break it elsewhere).
 *
 * Tuned against the TALLEST body (the donut plus its legend) and then pulled in
 * until a lone figure stopped floating in dead space — measured on the rendered
 * page at 1440 and 390, not guessed.
 */
const BODY_HEIGHT = 88;

/**
 * One card in the headline grid: a tone hairline, a tinted strip naming the
 * subject, a fixed-height body, and a footer pairing the caption with the tone's
 * word.
 *
 * Three stacked registers, so the eye lands in the same place on every card
 * (§1.8). The tint IS the tone and the tone is computed from the figures by the
 * caller (`toneForAlert` / `worstTone`), so a wall of quiet cards re-colours
 * itself the moment one of them stops being quiet (§1.1). The footer pill
 * carries the same fact as a word, so nothing here is colour-only.
 *
 * The body is a slot on purpose: the grid holds bare figures, meter groups and a
 * donut side by side, and a card is not obliged to be a number. What it IS
 * obliged to be is the same size as its neighbours.
 */
export function OverviewCard({
  label,
  icon: Icon,
  tone = "neutral",
  caption,
  children,
  isPending = false,
  isError = false,
  onActivate,
  activateLabel,
}: OverviewCardProps) {
  const color = TONE_COLOR[tone];
  const word = TONE_WORD[tone];
  const isReadable = !isPending && !isError;

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
          "--card-tint": `var(--mantine-color-${color}-light)`,
          "--card-accent": `var(--mantine-color-${color}-filled)`,
        } as CSSProperties
      }
    >
      <Box className={classes.accent} aria-hidden />

      <Group
        gap="xs"
        wrap="nowrap"
        align="center"
        px="sm"
        py="xs"
        className={classes.header}
        c={`var(--mantine-color-${color}-light-color)`}
      >
        <Icon size={15} aria-hidden />
        <Text
          size="xs"
          fw={700}
          tt="uppercase"
          truncate
          style={{ letterSpacing: "0.05em" }}
        >
          {label}
        </Text>
      </Group>

      <Stack gap="xs" px="sm" pt="sm" pb="xs" style={{ flex: 1 }}>
        <Box
          style={{
            height: BODY_HEIGHT,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          {children}
        </Box>

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

/**
 * The bare-number body: one figure at display size, optionally over a thin share
 * track that says what it is a share OF.
 *
 * The track is context, never a second signal — it stays neutral gray and the
 * card's tone is still decided by the figure's own band. Twenty-one stale leads
 * is a breach whether the office holds forty leads or twelve hundred; the track
 * only tells you which of those you are looking at.
 *
 * A failed fetch renders `—`, never `0`: "we could not ask" and "there are none"
 * are different facts, and on an alert card confusing them is the dangerous
 * direction.
 */
/**
 * A share reads to one decimal below 10% and whole numbers above it: at 1.7% the
 * track is visually empty, so the text is the only thing actually carrying the
 * fraction, and rounding it to "2%" would throw away the part that matters.
 */
function formatShare(percent: number): string {
  return percent > 0 && percent < 10
    ? `${percent.toFixed(1)}%`
    : `${Math.round(percent)}%`;
}

export function OverviewFigure({
  value,
  isPending = false,
  isError = false,
  share,
}: OverviewFigureProps) {
  if (isPending) {
    return <Skeleton height={TYPE_FIGURE_LG.fz} width={96} radius="sm" />;
  }

  const unreadable = isError || value === undefined;
  const denominator = share?.of;
  // A share needs both halves and a non-zero denominator to mean anything.
  const percent =
    !unreadable && denominator
      ? Math.min(100, (value / denominator) * 100)
      : null;

  return (
    <Stack gap="xs">
      <Text {...TYPE_FIGURE_LG} style={DISPLAY_TRACKING}>
        {unreadable ? "—" : value.toLocaleString()}
      </Text>
      {percent !== null && share ? (
        <Stack gap={4}>
          <Progress
            value={percent}
            color="gray"
            size="sm"
            radius="sm"
            aria-hidden
          />
          <Text size="xs" c="dimmed">
            {formatShare(percent)} of {denominator?.toLocaleString()}{" "}
            {share.label}
          </Text>
        </Stack>
      ) : null}
    </Stack>
  );
}
