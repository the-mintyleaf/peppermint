"use client";

import {
  Box,
  Button,
  Card,
  Divider,
  Group,
  Menu,
  Stack,
  Text,
  ThemeIcon,
} from "@peppermint/ui";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { TYPE_CARD_TITLE } from "../dashboard.typeScale";
import type { PanelCardProps } from "./PanelCard.types";

/**
 * The shell every large card on the dashboard wears: title on the left, the
 * card's views behind ONE dropdown on the right. The dropdown is deliberate —
 * a tab bar spends horizontal room proportional to the number of views and
 * makes six views look like six things to read, where a menu makes them one
 * thing to choose. The trigger always names the OPEN view, so the card says
 * what you are looking at without opening anything (DESIGN.md §1.4).
 *
 * Only the selected view is rendered, so a card with six views costs one view's
 * queries — the property the old tab bar had, kept after the tabs went away.
 */
export function PanelCard({
  title,
  subtitle,
  icon: Icon,
  views,
  activeView,
  onViewChange,
  actions,
  minBodyHeight,
  children,
}: PanelCardProps) {
  const active = views?.find((view) => view.value === activeView);
  const hasMenu = Boolean(views && views.length > 1 && onViewChange);

  return (
    <Card withBorder radius="lg" p="md" h="100%" shadow="xs">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <Group
          gap="sm"
          wrap="nowrap"
          align="flex-start"
          style={{ minWidth: 0 }}
        >
          {Icon ? (
            <ThemeIcon size={32} radius="md" variant="light" color="gray">
              <Icon size={17} />
            </ThemeIcon>
          ) : null}
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text {...TYPE_CARD_TITLE} truncate>
              {title}
            </Text>
            {subtitle ? (
              <Text size="xs" c="dimmed">
                {subtitle}
              </Text>
            ) : null}
          </Stack>
        </Group>

        <Group gap="xs" wrap="nowrap" style={{ flex: "none" }}>
          {actions}
          {hasMenu ? (
            <Menu position="bottom-end" width={260} withinPortal>
              <Menu.Target>
                <Button
                  variant="default"
                  size="compact-sm"
                  rightSection={<CaretDownIcon size={13} aria-hidden />}
                  aria-label={`Change view. Showing ${active?.label ?? "—"}.`}
                >
                  {active?.label ?? "Select a view"}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Show</Menu.Label>
                {views?.map((view) => (
                  <Menu.Item
                    key={view.value}
                    onClick={() => onViewChange?.(view.value)}
                    rightSection={
                      view.value === activeView ? (
                        <CheckIcon size={13} aria-hidden />
                      ) : typeof view.count === "number" ? (
                        <Text size="xs" c="dimmed">
                          {view.count.toLocaleString()}
                        </Text>
                      ) : null
                    }
                  >
                    <Text size="sm">{view.label}</Text>
                    {view.description ? (
                      <Text size="xs" c="dimmed">
                        {view.description}
                      </Text>
                    ) : null}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          ) : null}
        </Group>
      </Group>

      <Divider my="sm" />

      <Box style={{ flex: 1, minHeight: minBodyHeight }}>{children}</Box>
    </Card>
  );
}
