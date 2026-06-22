'use client';

import { ActionIcon, Tooltip } from '@peppermint/ui';
import { BookmarkIcon } from '@phosphor-icons/react/dist/csr/Bookmark';
import { BookmarkSimpleIcon } from '@phosphor-icons/react/dist/csr/BookmarkSimple';
import { useModuleBookmark } from '../../hooks/useModuleBookmark';

interface DataTableShellBookmarkButtonProps {
  storageKey: string;
}

export function DataTableShellBookmarkButton({
  storageKey,
}: DataTableShellBookmarkButtonProps) {
  const { bookmarked, toggle } = useModuleBookmark(storageKey);

  return (
    <Tooltip
      label={bookmarked ? 'Remove bookmark' : 'Bookmark module'}
      withArrow
      position="bottom"
    >
      <ActionIcon
        variant="subtle"
        color={bookmarked ? 'brand' : 'gray'}
        size="md"
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark module'}
        onClick={toggle}
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
