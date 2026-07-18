"use client";

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
  const body = (
    <Group wrap="nowrap" gap="sm" align="center">
      <ThemeIcon size={40} radius="md" variant="light" color={color}>
        {icon}
      </ThemeIcon>
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Text size="xs" c="dimmed" fw={500} tt="uppercase" lh={1}>
          {label}
        </Text>
        {isLoading ? (
          <Skeleton height={26} width={44} radius="sm" mt={4} />
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
          <Text fz={26} fw={700} lh={1.1}>
            {value ?? 0}
          </Text>
        )}
        {hint && !isLoading && !isError ? (
          <Text size="xs" c="dimmed" lh={1}>
            {hint}
          </Text>
        ) : null}
      </Stack>
    </Group>
  );

  // A tile with a destination is a quiet link, not a button — no elevated affordance,
  // just a hover cue. Non-navigational tiles render as a plain card.
  if (href && !isError) {
    return (
      <Card
        component={Link}
        href={href}
        withBorder
        radius="md"
        padding="md"
        className={styles.linkTile}
      >
        {body}
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" padding="md">
      {body}
    </Card>
  );
}
