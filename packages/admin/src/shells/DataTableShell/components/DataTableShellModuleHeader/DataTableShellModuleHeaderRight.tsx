'use client';

import type { ReactNode } from 'react';
import { AccessMenu, BookmarkButton, Group, Text } from '@peppermint/ui';
import type {
  DataTableShellModuleAccess,
  DataTableShellModuleAccessChange,
  DataTableShellModuleInfo,
} from '../../DataTableShell.types';
import { DataTableShellHeaderActions } from '../DataTableShellHeaderActions';
import { DataTableShellEditedLabel } from './DataTableShellEditedLabel';

function HeaderSeparator() {
  return (
    <Text size="xs" c="dimmed" opacity={0.4} visibleFrom="sm">
      |
    </Text>
  );
}

interface DataTableShellModuleHeaderRightProps {
  moduleInfo: DataTableShellModuleInfo;
  headerRight?: ReactNode;
  moduleAccess?: DataTableShellModuleAccess;
  onModuleAccessChange?: (change: DataTableShellModuleAccessChange) => void;
  lastEditedAt?: string | Date;
  shareUrl?: string;
  hideAccessMenu?: boolean;
  rowsUpdatedAt?: string | Date;
  basePath?: string;
  bookmarkId?: string;
}

export function DataTableShellModuleHeaderRight({
  moduleInfo,
  headerRight,
  moduleAccess,
  onModuleAccessChange,
  lastEditedAt,
  shareUrl,
  hideAccessMenu = false,
  rowsUpdatedAt,
  basePath,
  bookmarkId,
}: DataTableShellModuleHeaderRightProps) {
  const editedDate = lastEditedAt ?? moduleInfo.updatedAt ?? rowsUpdatedAt;
  const showAccess = !hideAccessMenu && moduleAccess != null;
  const resolvedBookmarkId = bookmarkId ?? basePath ?? moduleInfo.name;

  return (
    <Group gap={6} pr="md" wrap="nowrap" align="center">
      {headerRight}
      {editedDate && <DataTableShellEditedLabel date={editedDate} />}
      {editedDate && <HeaderSeparator />}
      {showAccess && moduleAccess && (
        <AccessMenu
          data={moduleAccess}
          onChange={onModuleAccessChange}
          shareUrl={shareUrl}
        />
      )}
      <BookmarkButton
        id={resolvedBookmarkId}
        label={moduleInfo.label ?? moduleInfo.name}
        addTooltip="Bookmark module"
        removeTooltip="Remove bookmark"
      />
      <DataTableShellHeaderActions exportFilename={moduleInfo.name} />
    </Group>
  );
}
