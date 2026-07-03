"use client";

import type { MouseEvent } from "react";
import {
  ActionIcon,
  Box,
  Indicator,
  Menu,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/csr/BookmarkSimple";
import { formatHrefAsBreadcrumb } from "./bookmarks.utils";
import type { BookmarksMenuProps } from "./bookmarks.types";
import { useBookmarks } from "./useBookmarks";

const MENU_TEXT_STYLE = { fontSize: 10, lineHeight: 1.3 } as const;

export function BookmarksMenu({
  onNavigate,
  variant = "default",
  emptyLabel = "No bookmarks yet",
  label = "Saved Bookmarks",
}: BookmarksMenuProps) {
  const { bookmarks } = useBookmarks();
  const isSidenav = variant === "sidenav";

  const handleNavigate = (event: MouseEvent, href: string) => {
    if (onNavigate) {
      event.preventDefault();
      onNavigate(href);
    }
  };

  const trigger = (
    <Indicator
      inline
      size={6}
      offset={4}
      position="top-end"
      color="brand"
      disabled={bookmarks.length === 0}
      processing={false}
    >
      {isSidenav ? (
        <ActionIcon
          aria-label={label}
          size="lg"
          variant="subtle"
          color="gray.0"
        >
          <BookmarkSimpleIcon size={16} weight="fill" />
        </ActionIcon>
      ) : (
        <ActionIcon
          aria-label={label}
          size="lg"
          variant="subtle"
          color="gray.0"
        >
          <BookmarkSimpleIcon size={18} />
        </ActionIcon>
      )}
    </Indicator>
  );

  return (
    <Menu
      withArrow
      trigger="hover"
      openDelay={120}
      closeDelay={160}
      position="right-start"
      shadow="md"
      width={260}
      withinPortal
    >
      <Menu.Target>{trigger}</Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Bookmarks</Menu.Label>
        {bookmarks.length === 0 ? (
          <Box px="sm" py="xs">
            <Text c="dimmed" style={MENU_TEXT_STYLE}>
              {emptyLabel}
            </Text>
          </Box>
        ) : (
          bookmarks.map((bookmark) => (
            <Menu.Item
              key={bookmark.id}
              component="a"
              href={bookmark.href}
              onClick={(event: MouseEvent) =>
                handleNavigate(event, bookmark.href)
              }
            >
              <Text fw={500} lineClamp={1} style={MENU_TEXT_STYLE}>
                {bookmark.label}
              </Text>
              <Text c="dimmed" lineClamp={2} style={MENU_TEXT_STYLE}>
                {formatHrefAsBreadcrumb(bookmark.href)}
              </Text>
            </Menu.Item>
          ))
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
