"use client";

import { Badge, Tabs, Text } from "@peppermint/ui";
import type { ProfileTabsProps } from "./ProfileTabs.types";

/**
 * The prominent, config-driven tab bar for a profile's content column. Renders
 * as filled `pills` so the active tab is an unmistakable accent chip; labels are
 * xs and bold for focus, and an optional count rides on the tab as a badge. One
 * array entry per tab — panels come along for free.
 */
export function ProfileTabs({ tabs, defaultValue }: ProfileTabsProps) {
  return (
    <Tabs
      variant="pills"
      radius="md"
      color="blue"
      defaultValue={defaultValue ?? tabs[0]?.value}
      keepMounted={false}
    >
      <Tabs.List mb="md" style={{ rowGap: "var(--mantine-spacing-xs)" }}>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            leftSection={tab.icon}
            rightSection={
              tab.count !== undefined ? (
                <Badge size="xs" variant="light" circle>
                  {tab.count}
                </Badge>
              ) : undefined
            }
          >
            <Text size="xs" fw={600} span>
              {tab.label}
            </Text>
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value}>
          {tab.panel}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
