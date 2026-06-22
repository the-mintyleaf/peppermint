'use client';

import type { ReactNode } from 'react';
import { AccessMenu, Group, Text } from '@peppermint/ui';
import type {
  DataTableShellModuleAccess,
  DataTableShellModuleAccessChange,
  DataTableShellModuleInfo,
} from '../../DataTableShell.types';
import { DataTableShellHeaderActions } from '../DataTableShellHeaderActions';
import { DataTableShellBookmarkButton } from './DataTableShellBookmarkButton';
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
}: DataTableShellModuleHeaderRightProps) {
  const editedDate = lastEditedAt ?? moduleInfo.updatedAt ?? rowsUpdatedAt;
  const showAccess = !hideAccessMenu && moduleAccess != null;

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
      <DataTableShellBookmarkButton storageKey={moduleInfo.name} />
      <DataTableShellHeaderActions exportFilename={moduleInfo.name} />
    </Group>
  );
}
