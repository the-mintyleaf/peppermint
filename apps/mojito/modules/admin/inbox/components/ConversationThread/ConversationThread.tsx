"use client";

import {
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Textarea,
  Button,
  ActionIcon,
  Skeleton,
  Avatar,
  SegmentedControl,
  Divider,
  ScrollArea,
} from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useConversation, useReply, useResolveConversation, useReopenConversation } from "../../inbox.hooks";
import type { ThreadMessage } from "../../../shared/entities.types";

const MSG_TYPE_LABEL: Record<ThreadMessage["type"], string> = {
  comment: "Comment",
  reply: "Reply",
  internal_note: "Note",
};

const MSG_TYPE_COLOR: Record<ThreadMessage["type"], string> = {
  comment: "blue",
  reply: "teal",
  internal_note: "yellow",
};

interface ConversationThreadProps {
  conversationId: string;
}

export function ConversationThread({ conversationId }: ConversationThreadProps) {
  const [replyText, setReplyText] = useState("");
  const [replyType, setReplyType] = useState<"reply" | "internal_note">("reply");

  const { data: conv, isLoading } = useConversation(conversationId);
  const reply = useReply();
  const resolve = useResolveConversation();
  const reopen = useReopenConversation();

  async function handleSend() {
    if (!replyText.trim()) return;
    await reply.mutateAsync({ id: conversationId, text: replyText.trim(), type: replyType });
    setReplyText("");
    notifications.show({ message: "Reply sent", color: "green" });
  }

  if (isLoading) {
    return (
      <Stack gap="md" p="md">
        <Skeleton h={40} />
        <Skeleton h={120} />
        <Skeleton h={80} />
      </Stack>
    );
  }

  if (!conv) {
    return null;
  }

  return (
    <Stack gap={0} h="100%">
      <Paper p="md" radius={0} style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
        <Group justify="space-between">
          <Group gap="sm">
            <Avatar size="sm" radius="xl" color="blue">
              {conv.author.charAt(0).toUpperCase()}
            </Avatar>
            <Stack gap={0}>
              <Text fw={600} size="sm">{conv.author}</Text>
              <Text size="xs" c="dimmed">{conv.platform} · {conv.type}</Text>
            </Stack>
          </Group>
          <Group gap="xs">
            {conv.assignedTo && (
              <Badge size="xs" leftSection={<UserIcon size={10} />} variant="light">
                {conv.assignedTo}
              </Badge>
            )}
            {conv.status !== "done" ? (
              <ActionIcon
                size="sm"
                variant="light"
                color="green"
                onClick={() => resolve.mutate(conversationId)}
                loading={resolve.isPending}
                aria-label="Mark resolved"
              >
                <CheckIcon size={14} />
              </ActionIcon>
            ) : (
              <ActionIcon
                size="sm"
                variant="light"
                color="gray"
                onClick={() => reopen.mutate(conversationId)}
                loading={reopen.isPending}
                aria-label="Reopen conversation"
              >
                <ArrowCounterClockwiseIcon size={14} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </Paper>

      <ScrollArea style={{ flex: 1 }} p="md">
        <Stack gap="sm">
          <Paper withBorder p="sm" radius="md" bg="var(--mantine-color-default-hover)">
            <Text size="sm">{conv.text}</Text>
            <Text size="xs" c="dimmed" mt={4}>
              Original · {conv.createdAt.toLocaleString()}
            </Text>
          </Paper>

          {conv.threadMessages.length > 0 && <Divider label="Thread" labelPosition="center" />}

          {conv.threadMessages.map((msg) => (
            <Paper
              key={msg.id}
              withBorder
              p="sm"
              radius="md"
              style={{
                marginLeft: msg.author === "You" ? "auto" : 0,
                maxWidth: "85%",
                borderColor:
                  msg.type === "internal_note"
                    ? "var(--mantine-color-yellow-4)"
                    : undefined,
                background:
                  msg.type === "internal_note"
                    ? "var(--mantine-color-yellow-light)"
                    : undefined,
              }}
            >
              <Group justify="space-between" mb={4}>
                <Group gap="xs">
                  <Avatar size="xs" radius="xl" color={msg.author === "You" ? "blue" : "gray"}>
                    {msg.author.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text size="xs" fw={500}>{msg.author}</Text>
                </Group>
                <Badge size="xs" color={MSG_TYPE_COLOR[msg.type]} variant="light">
                  {MSG_TYPE_LABEL[msg.type]}
                </Badge>
              </Group>
              <Text size="sm">{msg.text}</Text>
              <Text size="xs" c="dimmed" mt={4}>{msg.createdAt.toLocaleString()}</Text>
            </Paper>
          ))}
        </Stack>
      </ScrollArea>

      {conv.status !== "done" && (
        <Paper p="md" radius={0} style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
          <Stack gap="sm">
            <SegmentedControl
              size="xs"
              value={replyType}
              onChange={(v) => setReplyType(v as "reply" | "internal_note")}
              data={[
                { label: "Reply", value: "reply" },
                { label: "Internal Note", value: "internal_note" },
              ]}
            />
            <Textarea
              placeholder={replyType === "internal_note" ? "Add internal note…" : "Write a reply…"}
              value={replyText}
              onChange={(e) => setReplyText(e.currentTarget.value)}
              minRows={2}
              autosize
              maxRows={6}
            />
            <Group justify="flex-end">
              <Button
                size="xs"
                onClick={handleSend}
                loading={reply.isPending}
                disabled={!replyText.trim()}
              >
                {replyType === "internal_note" ? "Add Note" : "Send Reply"}
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
