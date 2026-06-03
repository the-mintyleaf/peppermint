'use client';

import {
  Button,
  Group,
  Paper,
  Select,
  Textarea,
  ActionIcon,
  Tooltip,
} from '@zetsel/ui';
import { Paperclip, ArrowRight } from '@phosphor-icons/react';
import { useState } from 'react';
import { ChatInputProps } from './ChatInput.types';
import styles from './ChatInput.module.css';

export function ChatInput({
  onSendMessage,
  isLoading,
  responseMode,
  onResponseModeChange,
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper className={styles.inputContainer} p="md" radius="lg">
      <div className={styles.labelSection}>
        <span className={styles.label}>Ask Griha AI anything or tell it to do something for you</span>
        <Group gap="xs" justify="flex-end">
          <span className={styles.poweredBy}>Powered by Griha.Brain 1.0</span>
        </Group>
      </div>

      <Textarea
        placeholder="Type your prompt here..."
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        minRows={4}
        maxRows={6}
        className={styles.textarea}
        disabled={isLoading}
      />

      <Group justify="space-between" mt="md">
        <Button
          variant="subtle"
          leftSection={<Paperclip size={16} />}
        >
          Attach
        </Button>

        <Group gap="sm">
          <Select
            data={[
              { value: 'FastResponse', label: 'Fast Response' },
              { value: 'SlowResponse', label: 'Slow Response' },
            ]}
            value={responseMode}
            onChange={(val) => onResponseModeChange(val as 'FastResponse' | 'SlowResponse')}
            w={150}
            size="sm"
            variant="subtle"
            className={styles.select}
          />

          <Tooltip label="Send message" withArrow position="top">
            <ActionIcon
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              size="lg"
              radius="md"
              className={styles.sendButton}
            >
              <ArrowRight size={20} weight="bold" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}
