"use client";

import { Paper, Text, Loader, Group, ActionIcon } from "@zetsel/ui";
import { useEffect, useState } from "react";
import { ChatMessageProps } from "./ChatMessage.types";
import styles from "./ChatMessage.module.css";
import { ArrowClockwiseIcon, CopyIcon, FloppyDiskIcon, ThumbsUpIcon, ThumbsDownIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";
import { getRandomLoadingMessage } from "../../utils/loadingMessages";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [loadingMessage, setLoadingMessage] = useState("");
  const isLoading = !isUser && message.content === "";

  useEffect(() => {
    if (isLoading) {
      setLoadingMessage(getRandomLoadingMessage());
    }
  }, [isLoading]);

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = () => {
    // Put the message content back into the chat input for editing
    // This will be connected to your chat input state
    const event = new CustomEvent("editMessage", { detail: message.content });
    window.dispatchEvent(event);
  };

  const handleDelete = () => {
    // Delete the message
    const event = new CustomEvent("deleteMessage", { detail: message.id });
    window.dispatchEvent(event);
  };

  if (isUser) {
    return (
      <div className={styles.userMessageWrapper}>
        <Paper className={styles.userBubble} py={8} px="sm">
          <Text size="sm" className={styles.messageText}>
            {message.content}
          </Text>
        </Paper>
        <Group gap="xs" className={styles.userHoverActions}>
          <span className={styles.timestamp}>
            {formatTime(message.timestamp || new Date())}
          </span>
          <Group gap={4}>
            <ActionIcon
              variant="light"
              aria-label="Edit"
              title="Edit"
              onClick={handleEdit}
            >
              <PencilIcon size={16} weight="regular" />
            </ActionIcon>
            <ActionIcon
              variant="light"
              aria-label="Delete"
              title="Delete"
              onClick={handleDelete}
            >
              <TrashIcon size={16} weight="regular" />
            </ActionIcon>
          </Group>
        </Group>
      </div>
    );
  }

  return (
    <div className={styles.assistantMessageWrapper}>
      {isLoading ? (
        <Group gap="md" align="center">
          <Loader type="dots" size="sm" />
          <Text size="sm" className={styles.assistantText}>
            {loadingMessage}
          </Text>
        </Group>
      ) : (
        <>
          <div className={styles.markdownContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          <Group gap="xs" justify="flex-end" className={styles.hoverActions}>
            <span className={styles.timestamp}>
              {formatTime(message.timestamp || new Date())}
            </span>
            <Group gap={4}>
              <ActionIcon
                variant="light"
                aria-label="Retry"
                title="Retry"
              >
                <ArrowClockwiseIcon size={16} weight="regular" />
              </ActionIcon>
              <ActionIcon
                variant="light"
                aria-label="Copy"
                title="Copy"
              >
                <CopyIcon size={16} weight="regular" />
              </ActionIcon>
              <ActionIcon
                variant="light"
                aria-label="Save"
                title="Save"
              >
                <FloppyDiskIcon size={16} weight="regular" />
              </ActionIcon>
              <ActionIcon
                variant="light"
                aria-label="Like"
                title="Like"
              >
                <ThumbsUpIcon size={16} weight="regular" />
              </ActionIcon>
              <ActionIcon
                variant="light"
                aria-label="Dislike"
                title="Dislike"
              >
                <ThumbsDownIcon size={16} weight="regular" />
              </ActionIcon>
            </Group>
          </Group>
        </>
      )}
    </div>
  );
}
