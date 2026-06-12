"use client";

import {
  Stack,
  Text,
  Badge,
  UnstyledButton,
  Skeleton,
  Center,
  Avatar,
  Group,
} from "@zetsel/ui";
import type { Conversation } from "../../../shared/entities.types";

const TYPE_COLOR: Record<Conversation["type"], string> = {
  comment: "blue",
  mention: "violet",
  dm: "teal",
  review: "orange",
};

const STATUS_COLOR: Record<Conversation["status"], string> = {
  open: "red",
  assigned: "yellow",
  done: "green",
};

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <Stack gap="xs" p="sm">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} h={64} radius="md" />
        ))}
      </Stack>
    );
  }

  if (conversations.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed" size="sm">No conversations</Text>
      </Center>
    );
  }

  return (
    <Stack gap={2} p="xs">
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId;
        return (
          <UnstyledButton
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            p="sm"
            style={{
              borderRadius: 8,
              background: isSelected ? "var(--mantine-color-blue-light)" : "transparent",
              border: isSelected ? "1px solid var(--mantine-color-blue-3)" : "1px solid transparent",
            }}
          >
            <Group gap="sm" wrap="nowrap">
              <Avatar size="sm" radius="xl" color="blue">
                {conv.author.charAt(0).toUpperCase()}
              </Avatar>
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Group justify="space-between" wrap="nowrap">
                  <Text size="sm" fw={500} truncate>{conv.author}</Text>
                  <Group gap={4} wrap="nowrap">
                    <Badge size="xs" color={TYPE_COLOR[conv.type]} variant="light">
                      {conv.type}
                    </Badge>
                    <Badge size="xs" color={STATUS_COLOR[conv.status]} variant="dot">
                      {conv.status}
                    </Badge>
                  </Group>
                </Group>
                <Text size="xs" c="dimmed" truncate>{conv.text}</Text>
              </Stack>
            </Group>
          </UnstyledButton>
        );
      })}
    </Stack>
  );
}
