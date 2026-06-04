'use client';

import { Paper, Text } from '@zetsel/ui';
import { ChatMessageProps } from './ChatMessage.types';
import styles from './ChatMessage.module.css';

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className={styles.userMessageContainer}>
        <Paper className={styles.userBubble}>
          <Text size="xs" className={styles.messageText}>
            {message.content}
          </Text>
        </Paper>
      </div>
    );
  }

  return (
    <div className={styles.assistantMessageContainer}>
      <Text size="xs" className={styles.assistantText}>
        {message.content}
      </Text>
    </div>
  );
}
