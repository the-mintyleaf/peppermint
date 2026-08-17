"use client";

import { Badge, Tabs, Text } from "@peppermint/ui";
import type { ProfileTabsProps } from "./ProfileTabs.types";

/**
 * The config-driven tab bar for a profile's content column. Default Mantine
 * `Tabs` (the underline variant — the active tab's accent underline is the only
 * separator, no card/pills). Labels are always xs / 700; an optional count rides
 * on the tab as a badge. One array entry per tab — panels come along for free.
 *
 * **Text only — no tab icons.** A profile's tabs are a short list of nouns read
 * left to right; an icon per tab adds a second thing to scan for no gain, and at
 * 14px most of them are indistinguishable anyway. The count badge is the one
 * decoration a tab earns, because it carries information the label cannot.
 * `ProfileTab` deliberately has no `icon` field so this cannot drift back.
 */
export function ProfileTabs({ tabs, defaultValue }: ProfileTabsProps) {
  return (
    <Tabs
      color="blue"
      defaultValue={defaultValue ?? tabs[0]?.value}
      keepMounted={false}
    >
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            rightSection={
              tab.count !== undefined ? (
                <Badge size="xs" variant="light" circle>
                  {tab.count}
                </Badge>
              ) : undefined
            }
          >
            <Text size="xs" fw={700} span>
              {tab.label}
            </Text>
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {/* Tab strip is flush; padding lives on the inner panel content. */}
      {tabs.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value} p="md">
          {tab.panel}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
