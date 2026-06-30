"use client";

import { Avatar, Group, Indicator, Menu, Text, UnstyledButton } from "@peppermint/ui";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import type { TeamMembersPanelProps } from "./TeamMembersPanel.types";

const MAX_VISIBLE = 4;

export function TeamMembersPanel({
  members,
  taskCountByMember,
  selectedMemberId,
  onSelect,
}: TeamMembersPanelProps) {
  if (!members.length) return null;

  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - MAX_VISIBLE;

  return (
    <Menu shadow="sm" width={220} position="bottom-end">
      <Menu.Target>
        <UnstyledButton style={{ display: "flex", alignItems: "center" }}>
          <Group gap={4} wrap="nowrap">
            <Avatar.Group spacing="xs">
              {visible.map((member) => (
                <Avatar
                  key={member.id}
                  size="sm"
                  color={member.color}
                  radius="xl"
                  style={
                    selectedMemberId && selectedMemberId !== member.id
                      ? { filter: "grayscale(1)", opacity: 0.4 }
                      : undefined
                  }
                >
                  {member.initials}
                </Avatar>
              ))}
              {overflow > 0 && (
                <Avatar size="sm" radius="xl" color="gray">
                  +{overflow}
                </Avatar>
              )}
            </Avatar.Group>
            <CaretDownIcon size={12} color="var(--mantine-color-gray-5)" />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Team members</Menu.Label>
        {selectedMemberId && (
          <Menu.Item
            c="dimmed"
            onClick={() => onSelect(null)}
          >
            Clear filter
          </Menu.Item>
        )}
        {members.map((member) => {
          const count = taskCountByMember[member.id] ?? 0;
          const isSelected = selectedMemberId === member.id;
          return (
            <Menu.Item
              key={member.id}
              fw={isSelected ? 600 : undefined}
              leftSection={
                <Indicator
                  color={member.online ? "green" : "gray"}
                  position="bottom-end"
                  size={7}
                  withBorder
                  processing={member.online}
                >
                  <Avatar size="xs" color={member.color} radius="xl">
                    {member.initials}
                  </Avatar>
                </Indicator>
              }
              rightSection={
                count > 0 ? (
                  <Text size="xs" c="dimmed">
                    {count}
                  </Text>
                ) : undefined
              }
              onClick={() => onSelect(isSelected ? null : member.id)}
            >
              {member.name}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
