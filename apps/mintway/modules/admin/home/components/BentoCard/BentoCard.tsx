"use client";

import { Card, Group, Stack, Text, ThemeIcon } from "@peppermint/ui";

import styles from "./BentoCard.module.css";
import type { BentoCardProps } from "./BentoCard.types";

export function BentoCard({
  title,
  icon,
  color = "gray",
  action,
  className,
  children,
}: BentoCardProps) {
  const classes = [styles.card, className].filter(Boolean).join(" ");
  return (
    <Card withBorder radius="lg" padding="md" className={classes}>
      <Stack gap="sm" h="100%">
        <Group justify="space-between" align="center" gap="sm" wrap="nowrap">
          <Group gap="xs" align="center" wrap="nowrap" style={{ minWidth: 0 }}>
            {icon ? (
              <ThemeIcon size={30} radius="md" variant="light" color={color}>
                {icon}
              </ThemeIcon>
            ) : null}
            <Text fw={600} size="sm" truncate>
              {title}
            </Text>
          </Group>
          {action}
        </Group>
        <div className={styles.body}>{children}</div>
      </Stack>
    </Card>
  );
}
