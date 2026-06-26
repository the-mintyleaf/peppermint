"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { BookmarkIcon } from "@phosphor-icons/react/dist/csr/Bookmark";
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/csr/BookmarkSimple";
import { resolveBookmarkHref } from "./bookmarks.utils";
import type { BookmarkButtonProps } from "./bookmarks.types";
import { useBookmarks } from "./useBookmarks";

export function BookmarkButton({
  id,
  label,
  href,
  size = "md",
  addTooltip = "Bookmark page",
  removeTooltip = "Remove bookmark",
}: BookmarkButtonProps) {
  const { isBookmarked, toggle } = useBookmarks();
  const bookmarked = isBookmarked(id);

  const handleToggle = () => {
    toggle({
      id,
      label,
      href: href ?? resolveBookmarkHref(),
    });
  };

  return (
    <Tooltip
      label={bookmarked ? removeTooltip : addTooltip}
      withArrow
      position="bottom"
    >
      <ActionIcon
        variant="subtle"
        color={bookmarked ? "brand" : "gray"}
        size={size}
        aria-label={bookmarked ? removeTooltip : addTooltip}
        onClick={handleToggle}
      >
        {bookmarked ? (
          <BookmarkIcon size={18} weight="fill" />
        ) : (
          <BookmarkSimpleIcon size={18} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}
