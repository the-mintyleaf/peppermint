"use client";

import { Paper, Text } from "@zetsel/ui";
import { ChatMessageProps } from "./ChatMessage.types";
import styles from "./ChatMessage.module.css";
import {
  ArrowClockwiseIcon,
  PencilIcon,
} from "@phosphor-icons/react";

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  if (isUser) {
    return (
      <div className={styles.userMessageWrapper}>
        <Paper className={styles.userBubble} p="md">
          <Text size="xs" className={styles.messageText}>
            {message.content}
          </Text>
        </Paper>
        <span className={styles.timestamp}>
          {formatTime(message.timestamp || new Date())}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.assistantMessageWrapper}>
      <Text size="xs" className={styles.assistantText}>
        {message.content}
      </Text>
      <div className={styles.hoverActions}>
        <span className={styles.timestamp}>
          {formatTime(message.timestamp || new Date())}
        </span>
        <div className={styles.actionButtons}>
          <button
            className={styles.actionButton}
            aria-label="Regenerate"
            title="Regenerate"
          >
            <ArrowClockwiseIcon size={16} weight="regular" />
          </button>
          <button
            className={styles.actionButton}
            aria-label="Edit"
            title="Edit"
          >
            <PencilIcon size={16} weight="regular" />
          </button>
        </div>
      </div>
    </div>
  );
}
