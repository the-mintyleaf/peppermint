"use client";

import Link from "next/link";
import { Anchor, Card, Group, Stack, Text } from "@peppermint/ui";
import type { WorklistPreviewCardProps } from "./WorklistPreviewCard.types";

/**
 * One worklist preview: title + total, up to 10 rows, and a "see all" link
 * driven by `has_more` — NEVER by comparing `items.length` to `total`
 * (INTEGRATION.md §3 "Worklist previews"). Reused by `TodayWorklists` (6x)
 * and `Blockers` (5x) so this rule only has one place to get wrong.
 */
export function WorklistPreviewCard<TRow>({
  title,
  preview,
  getRowKey,
  renderRow,
  emptyMessage,
  seeAllHref,
  caption,
}: WorklistPreviewCardProps<TRow>) {
  return (
    <Card withBorder radius="md" p="md">
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Stack gap={0}>
            <Text fw={600} size="sm">
              {title} ({preview.total})
            </Text>
            {caption ? (
              <Text size="xs" c="dimmed">
                {caption}
              </Text>
            ) : null}
          </Stack>
          {preview.has_more && seeAllHref ? (
            <Anchor component={Link} href={seeAllHref} size="xs">
              See all {preview.total}
            </Anchor>
          ) : null}
        </Group>

        {preview.items.length === 0 ? (
          <Text size="sm" c="dimmed">
            {emptyMessage}
          </Text>
        ) : (
          <Stack gap="xs">
            {preview.items.map((row) => (
              <div key={getRowKey(row)}>{renderRow(row)}</div>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
