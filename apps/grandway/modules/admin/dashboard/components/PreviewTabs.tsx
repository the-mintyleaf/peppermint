"use client";

import Link from "next/link";
import { useState } from "react";
import { Anchor, Badge, Group, Stack, Tabs, Text } from "@peppermint/ui";
import type { PreviewTabsProps } from "./PreviewTabs.types";

/**
 * The shared tabbed queue viewer for the worklist and blocker sections. Each tab
 * is one `Preview<T>` — its label carries the REAL `total` as a count badge
 * (never `items.length`), and the panel shows the ≤10 preview rows plus a "see
 * all" link driven by `has_more` (INTEGRATION.md §3). This is where the design's
 * per-tab bucket/reason chart would have gone; the API returns no such
 * aggregation, so the honest content is the preview list itself. An empty queue
 * renders its neutral "healthy" message, not an error.
 */
export function PreviewTabs({ tabs, ariaLabel }: PreviewTabsProps) {
  const [active, setActive] = useState(tabs[0]?.value);

  return (
    <Tabs
      value={active}
      onChange={(value) => setActive(value ?? tabs[0]?.value)}
      keepMounted={false}
    >
      <Tabs.List aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            rightSection={
              <Badge
                size="sm"
                variant={active === tab.value ? "filled" : "light"}
                color={active === tab.value ? "brand" : "gray"}
                circle
              >
                {tab.total}
              </Badge>
            }
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value} pt="md">
          {tab.caption ? (
            <Text size="xs" c="dimmed" pb="xs">
              {tab.caption}
            </Text>
          ) : null}
          {tab.rows.length === 0 ? (
            <Text size="sm" c="dimmed" py="xs">
              {tab.emptyMessage}
            </Text>
          ) : (
            <Stack gap="xs">
              {tab.rows.map((row, i) => (
                // Row order is stable per fetch; row nodes already carry their
                // own keyed content, so the index is a safe list key here.
                <div key={i}>{row}</div>
              ))}
            </Stack>
          )}

          {tab.hasMore ? (
            <Group justify="flex-start" pt="sm">
              <Anchor component={Link} href={tab.seeAllHref} size="xs">
                See all {tab.total} →
              </Anchor>
            </Group>
          ) : null}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
