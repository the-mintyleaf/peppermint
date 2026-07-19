"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ActionIcon,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@peppermint/ui";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";

import styles from "./StatTile.module.css";
import type { StatTileProps } from "./StatTile.types";

export function StatTile({
  label,
  value,
  icon,
  color = "gray",
  hint,
  href,
  isLoading,
  isError,
  onRetry,
}: StatTileProps) {
  // Dynamic Mantine color name → CSS vars so the soft tint + hover live in the module.
  const accent = {
    "--tile-bg": `var(--mantine-color-${color}-light)`,
    "--tile-bg-hover": `var(--mantine-color-${color}-light-hover)`,
    "--tile-value": `var(--mantine-color-${color}-light-color)`,
  } as CSSProperties;

  const body = (
    <Stack gap="xs" justify="space-between" h="100%">
      <Group justify="space-between" align="flex-start" gap="xs" wrap="nowrap">
        <Text
          size="xs"
          c="dimmed"
          fw={600}
          tt="uppercase"
          lh={1.2}
          style={{ letterSpacing: "0.03em" }}
        >
          {label}
        </Text>
        <ThemeIcon size={30} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>

      {isLoading ? (
        <Skeleton height={30} width={52} radius="sm" />
      ) : isError ? (
        <Group gap={6} align="center" wrap="nowrap">
          <WarningIcon size={16} weight="fill" aria-hidden />
          <Text size="sm" c="dimmed">
            Unavailable
          </Text>
          {onRetry ? (
            <Tooltip label="Retry" withArrow>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                aria-label={`Retry loading ${label}`}
                onClick={(e) => {
                  e.preventDefault();
                  onRetry();
                }}
              >
                <ArrowClockwiseIcon size={14} aria-hidden />
              </ActionIcon>
            </Tooltip>
          ) : null}
        </Group>
      ) : (
        <Stack gap={2}>
          <Text fz={30} fw={700} lh={1} className={styles.value}>
            {value ?? 0}
          </Text>
          {hint ? (
            <Text size="xs" c="dimmed" lh={1.2}>
              {hint}
            </Text>
          ) : null}
        </Stack>
      )}
    </Stack>
  );

  // A tile with a destination is a quiet link, not a button — a hover cue only, never an
  // elevated affordance (DESIGN.md 1.9). Non-navigational or errored tiles are plain cards.
  if (href && !isError) {
    return (
      <Card
        component={Link}
        href={href}
        radius="lg"
        padding="md"
        style={accent}
        className={`${styles.tile} ${styles.linkTile}`}
      >
        {body}
      </Card>
    );
  }

  return (
    <Card radius="lg" padding="md" style={accent} className={styles.tile}>
      {body}
    </Card>
  );
}
