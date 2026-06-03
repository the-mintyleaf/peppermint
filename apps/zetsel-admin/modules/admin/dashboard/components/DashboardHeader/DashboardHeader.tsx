'use client';

import { Button, Group, Stack, Text, ActionIcon, Tooltip } from '@zetsel/ui';
import {
  Plus,
  Clock,
  Trash,
} from '@phosphor-icons/react';
import { PageBreadcrumb } from '@zetsel/ui';
import type { DashboardHeaderProps } from './DashboardHeader.types';
import styles from './DashboardHeader.module.css';

export function DashboardHeader({
  onNewChat,
  onHistory,
  onClearHistory,
}: DashboardHeaderProps) {
  const breadcrumbItems = [
    { label: 'Home', href: '/admin' },
    { label: 'Chat Dashboard', href: '/admin' },
  ];

  return (
    <Stack gap={2} className={styles.headerContainer}>
      <PageBreadcrumb items={breadcrumbItems} />

      <Group justify="space-between" h={60} align="center">
        <div>
          <Text size="xl" fw={500}>
            Chat Assistant
          </Text>
        </div>

        <Group gap="xs">
          <Tooltip label="Chat history" withArrow position="bottom">
            <ActionIcon
              variant="subtle"
              onClick={onHistory}
              size="lg"
              aria-label="View chat history"
            >
              <Clock size={20} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Clear history" withArrow position="bottom">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={onClearHistory}
              size="lg"
              aria-label="Clear chat history"
            >
              <Trash size={20} />
            </ActionIcon>
          </Tooltip>

          <Button
            leftSection={<Plus size={16} />}
            size="sm"
            onClick={onNewChat}
          >
            New Chat
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
