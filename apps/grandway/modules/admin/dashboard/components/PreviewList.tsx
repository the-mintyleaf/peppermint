"use client";

import Link from "next/link";
import { Anchor, Divider, Group, Stack, Text } from "@peppermint/ui";
import type { PreviewListProps } from "./PreviewList.types";

/**
 * One `Preview<T>` queue rendered as rows. The card's view menu chose which
 * queue this is, so this only has to be honest about the payload: the count is
 * the REAL `total` (never `items.length`, which caps at 10), the "see all" link
 * is driven by `has_more` rather than a length check, and an empty queue renders
 * its neutral "healthy" message instead of an error (INTEGRATION.md §3/§7).
 */
export function PreviewList({
  rows,
  total,
  hasMore,
  seeAllHref,
  emptyMessage,
  caption,
}: PreviewListProps) {
  return (
    <Stack gap="xs">
      {caption ? (
        <Text size="xs" c="dimmed">
          {caption}
        </Text>
      ) : null}

      {rows.length === 0 ? (
        <Text size="sm" c="dimmed" py="xs">
          {emptyMessage}
        </Text>
      ) : (
        <Stack gap={0}>
          {rows.map((row, index) => (
            // Row order is stable per fetch and each row node carries its own
            // keyed content, so the index is a safe list key here.
            <Stack key={index} gap={0}>
              {index > 0 ? <Divider /> : null}
              <div style={{ paddingBlock: 6 }}>{row}</div>
            </Stack>
          ))}
        </Stack>
      )}

      {hasMore ? (
        <Group justify="flex-start" pt={2}>
          <Anchor component={Link} href={seeAllHref} size="xs" fw={500}>
            See all {total.toLocaleString()} →
          </Anchor>
        </Group>
      ) : null}
    </Stack>
  );
}
