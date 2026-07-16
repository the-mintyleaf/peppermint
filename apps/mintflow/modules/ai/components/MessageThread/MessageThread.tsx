"use client";

import { Box, Group, Stack, Text } from "@peppermint/ui";

import { tokens } from "@/config/design";

import { AiAvatar } from "../AiAvatar";
import type { ChatMessage } from "../../AskAi.types";
import type { MessageThreadProps } from "./MessageThread.types";
import classes from "../../AskAi.module.css";

/** The message list: user bubbles, assistant text, and the typing indicator. */
export function MessageThread({ messages, pending }: MessageThreadProps) {
  return (
    <Stack gap={18}>
      {messages.map((message) =>
        message.role === "user" ? (
          <UserBubble key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} />
        ),
      )}

      {pending ? <TypingIndicator /> : null}
    </Stack>
  );
}

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <Box style={{ display: "flex", justifyContent: "flex-end" }}>
      <Text
        fz="14px"
        fw={500}
        c="#fff"
        style={{
          maxWidth: "82%",
          background: tokens.ink,
          padding: "12px 15px",
          borderRadius: "16px 16px 5px 16px",
          whiteSpace: "pre-wrap",
          lineHeight: 1.45,
        }}
      >
        {message.content}
      </Text>
    </Box>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  return (
    <Group gap={10} align="flex-start" wrap="nowrap">
      <AiAvatar size={26} radius={8} iconSize={14} />
      <Text
        fz="14px"
        fw={500}
        c={tokens.ink}
        style={{ maxWidth: "88%", lineHeight: 1.55, whiteSpace: "pre-wrap" }}
      >
        {message.content}
      </Text>
    </Group>
  );
}

function TypingIndicator() {
  return (
    <Group
      gap={10}
      align="center"
      wrap="nowrap"
      aria-label="Kamban AI is typing"
    >
      <AiAvatar size={26} radius={8} iconSize={14} />
      <Group gap={5} align="center">
        <Box className={classes.typingDot} />
        <Box className={classes.typingDot} />
        <Box className={classes.typingDot} />
      </Group>
    </Group>
  );
}
