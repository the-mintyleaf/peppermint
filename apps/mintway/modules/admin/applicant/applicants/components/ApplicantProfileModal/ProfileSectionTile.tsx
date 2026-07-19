"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { Card, Group, Stack, Text, ThemeIcon } from "@peppermint/ui";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";

import styles from "./ProfileSectionTile.module.css";
import type { ProfileSectionTileProps } from "./ProfileSectionTile.types";

/**
 * One section of the applicant's file, rendered as a launcher into its detail route.
 * A quiet link (icon + name + descriptor + chevron) — hover cue only, so it never reads
 * as a state or a primary lever.
 */
export function ProfileSectionTile({
  tile,
  onNavigate,
}: ProfileSectionTileProps) {
  const Icon = tile.icon;

  // A modifier/middle click opens the route in a new tab — leave this modal open in that
  // case; only close it when we're actually navigating away in place.
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    onNavigate();
  };

  return (
    <Card
      component={Link}
      href={tile.href}
      onClick={handleClick}
      withBorder
      radius="lg"
      padding="md"
      className={styles.tile}
    >
      <Group gap="sm" align="center" wrap="nowrap" h="100%">
        <ThemeIcon size={34} radius="md" variant="light" color="gray">
          <Icon size={18} aria-hidden />
        </ThemeIcon>
        <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
          <Text fw={600} size="sm" truncate>
            {tile.label}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {tile.description}
          </Text>
        </Stack>
        <CaretRightIcon
          size={16}
          aria-hidden
          className={styles.caret}
          weight="bold"
        />
      </Group>
    </Card>
  );
}
