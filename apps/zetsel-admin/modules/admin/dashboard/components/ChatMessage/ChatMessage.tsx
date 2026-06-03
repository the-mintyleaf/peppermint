'use client';

import { Paper, Text, Group, Avatar } from '@zetsel/ui';
import { ChatMessageProps } from './ChatMessage.types';
import styles from './ChatMessage.module.css';

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <Group
      gap="sm"
      justify={isUser ? 'flex-end' : 'flex-start'}
      className={styles.messageGroup}
    >
      {!isUser && (
        <Avatar
          size="sm"
          name="GA"
          color="blue"
          className={styles.avatar}
        />
      )}

      <Paper
        className={`${styles.messageBubble} ${
          isUser ? styles.userMessage : styles.assistantMessage
        }`}
      >
        <Text size="sm" className={styles.messageText}>
          {message.content}
        </Text>
        <Text size="xs" className={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Paper>

      {isUser && (
        <Avatar
          size="sm"
          name="You"
          color="gray"
          className={styles.avatar}
        />
      )}
    </Group>
  );
}
