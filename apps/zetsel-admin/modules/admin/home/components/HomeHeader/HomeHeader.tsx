"use client";

import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Text,
  Tooltip,
  UnstyledButton,
} from "@zetsel/ui";
import {
  CaretDownIcon as CaretDown,
  PlusIcon as Plus,
  TrashIcon as Trash,
} from "@phosphor-icons/react";
import { PageBreadcrumb } from "@zetsel/ui";
import type { HomeHeaderProps } from "./HomeHeader.types";
import styles from "./HomeHeader.module.css";

const defaultBreadcrumbItems = [{ label: "Home", href: "/admin" }];

export function HomeHeader({
  breadcrumbItems = defaultBreadcrumbItems,
  currentChatTitle,
  pastChats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onClearHistory,
}: HomeHeaderProps) {
  return (
    <header
      className={styles.headerContainer}
      style={{ height: 40, paddingInline: "var(--mantine-spacing-md)" }}
    >
      <div className={styles.breadcrumbSection}>
        <PageBreadcrumb items={breadcrumbItems} />
      </div>

      <div className={styles.chatSection}>
        <Menu shadow="md" position="bottom" withArrow offset={4} width={280}>
          <Menu.Target>
            <UnstyledButton
              className={styles.chatSelector}
              aria-label="Select chat"
              bg="gray.1"
              miw={400}
              h={30}
              px="md"
            >
              <Text
                size="xs"
                fw={600}
                truncate
                className={styles.chatSelectorLabel}
              >
                {currentChatTitle}
              </Text>
              <CaretDown size={14} weight="bold" aria-hidden />
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Recent chats</Menu.Label>
            {pastChats.length === 0 ? (
              <Menu.Item disabled>No previous chats</Menu.Item>
            ) : (
              pastChats.map((chat) => (
                <Menu.Item
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  fw={chat.id === activeChatId ? 600 : 400}
                >
                  <Text size="sm" truncate>
                    {chat.title}
                  </Text>
                </Menu.Item>
              ))
            )}
          </Menu.Dropdown>
        </Menu>
      </div>

      <Group gap="xs" className={styles.actionsSection}>
        <Tooltip label="Clear history" withArrow position="bottom">
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={onClearHistory}
            size="sm"
            aria-label="Clear chat history"
          >
            <Trash weight="duotone" size={16} />
          </ActionIcon>
        </Tooltip>

        <Button leftSection={<Plus size={16} />} size="xs" onClick={onNewChat}>
          New Chat
        </Button>
      </Group>
    </header>
  );
}
