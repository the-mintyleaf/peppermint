"use client";

import { Avatar, Group, Indicator, Text, Tooltip } from "@peppermint/ui";
import type { TeamMembersPanelProps } from "./TeamMembersPanel.types";

export function TeamMembersPanel({
  members,
  taskCountByMember,
  selectedMemberId,
  onSelect,
}: TeamMembersPanelProps) {
  return (
    <Group gap="xs" px="md" py="xs">
      {members.map((member) => {
        const isSelected = selectedMemberId === member.id;
        const count = taskCountByMember[member.id] ?? 0;

        return (
          <Tooltip
            key={member.id}
            label={
              <Text size="xs">
                {member.name}
                {count > 0 ? ` · ${count} task${count !== 1 ? "s" : ""}` : ""}
              </Text>
            }
            withArrow
          >
            <Indicator
              color={member.online ? "green" : "gray"}
              position="bottom-end"
              size={8}
              withBorder
              processing={member.online}
              style={{ cursor: "pointer" }}
              onClick={() => onSelect(isSelected ? null : member.id)}
            >
              <Avatar
                size="md"
                color={member.color}
                radius="xl"
                style={{
                  outline: isSelected
                    ? `2px solid var(--mantine-color-${member.color}-5)`
                    : "2px solid transparent",
                  outlineOffset: 2,
                  transition: "outline 0.15s ease",
                  ...(member.online
                    ? undefined
                    : { filter: "grayscale(1)", opacity: 0.55 }),
                }}
              >
                {member.initials}
              </Avatar>
            </Indicator>
          </Tooltip>
        );
      })}
    </Group>
  );
}
