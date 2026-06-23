"use client";

import {
  Avatar,
  Button,
  Group,
  MonthPickerInput,
  SegmentedControl,
  TextInput,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ANALYTICS_COLORS } from "../../taskAnalytics.styles";
import type { DashboardHeaderProps } from "./DashboardHeader.types";

const VIEW_OPTIONS = [
  { label: "Card", value: "card" },
  { label: "Block", value: "block" },
  { label: "Table", value: "table" },
];

export function DashboardHeader({
  selectedMonth,
  onMonthChange,
  view,
  onViewChange,
  search,
  onSearchChange,
  teamMembers,
}: DashboardHeaderProps) {
  return (
    <Group justify="space-between" wrap="wrap" gap="md">
      <Group gap="md" wrap="wrap">
        <MonthPickerInput
          value={selectedMonth}
          onChange={(value) => {
            if (value) onMonthChange(new Date(value));
          }}
          size="xs"
          styles={{
            input: {
              fontWeight: 600,
              fontSize: "var(--mantine-font-size-xs)",
              border: "none",
              background: "transparent",
              paddingLeft: 0,
              minWidth: 120,
              color: ANALYTICS_COLORS.textDark,
            },
          }}
        />
        <SegmentedControl
          value={view}
          onChange={(v) => onViewChange(v as DashboardHeaderProps["view"])}
          data={VIEW_OPTIONS}
          size="xs"
          radius="xl"
          styles={{
            root: { background: "var(--mantine-color-gray-1)" },
            label: { paddingInline: 12, fontSize: "var(--mantine-font-size-xs)" },
          }}
        />
      </Group>

      <Group gap="md" wrap="wrap" style={{ flex: 1, justifyContent: "flex-end" }}>
        <TextInput
          placeholder="Search event, task, or meeting..."
          leftSection={<MagnifyingGlassIcon size={14} aria-label="Search" />}
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          size="xs"
          radius="xl"
          style={{ flex: 1, maxWidth: 360, minWidth: 180 }}
          styles={{
            input: {
              background: "var(--mantine-color-gray-1)",
              border: "none",
              fontSize: "var(--mantine-font-size-xs)",
            },
          }}
        />
        <Avatar.Group spacing="sm">
          {teamMembers.map((member) => (
            <Avatar key={member.initials} radius="xl" color={member.color} size="sm">
              {member.initials}
            </Avatar>
          ))}
        </Avatar.Group>
        <Button
          size="compact-xs"
          radius="xl"
          leftSection={<PlusIcon size={12} weight="bold" aria-label="Create" />}
          styles={{
            root: {
              background: ANALYTICS_COLORS.accentYellow,
              color: ANALYTICS_COLORS.textDark,
              fontWeight: 700,
              fontSize: "var(--mantine-font-size-xs)",
              "&:hover": { background: "#e6ac00" },
            },
          }}
        >
          Create new plan
        </Button>
      </Group>
    </Group>
  );
}
