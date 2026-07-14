"use client";

import { useState, useCallback } from "react";
import { Button, Divider, Group, Paper, Text } from "@peppermint/ui";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilIcon } from "@phosphor-icons/react/dist/csr/Pencil";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { useTableStore } from "../../../../wrappers/DataTableWrapper";
import { useDataTableShellContext } from "../../DataTableShell.context";
import type { DataTableShellTableActionsProps } from "../../DataTableShell.types";

export function DataTableShellTableActions<T extends object>({
  idAccessor,
  basePath,
  sustained = false,
  onEditClick,
  onDeleteClick,
  onReviewClick,
  disableEditButton = false,
  disableDeleteButton = false,
  disableReviewButton = false,
}: DataTableShellTableActionsProps<T>) {
  const [deleting, setDeleting] = useState(false);

  const { selectedRecords } = useDataTableShellContext<T>();

  const useTable = useTableStore();
  const setSelection = useTable((s) => s.setSelection);

  const clearSelection = useCallback(
    () => setSelection(new Set()),
    [setSelection],
  );

  const handleDelete = useCallback(async () => {
    if (!onDeleteClick) return;
    const ids = selectedRecords.map(
      (r) => (r as Record<string, unknown>)[idAccessor] as string | number,
    );
    setDeleting(true);
    try {
      await onDeleteClick(ids);
      clearSelection();
    } catch {
      // Leave selection intact — caller is responsible for error notifications
    } finally {
      setDeleting(false);
    }
  }, [onDeleteClick, selectedRecords, idAccessor, clearSelection]);

  const handleEdit = useCallback(() => {
    if (selectedRecords.length !== 1) return;
    const record = selectedRecords[0];
    if (sustained && onEditClick) {
      onEditClick(record);
    } else {
      const id = (record as Record<string, unknown>)[idAccessor];
      const href = basePath ? `${basePath}/${id}/edit` : `/${id}/edit`;
      window.location.href = href;
    }
  }, [selectedRecords, sustained, onEditClick, idAccessor, basePath]);

  const handleReview = useCallback(() => {
    if (selectedRecords.length !== 1) return;
    const record = selectedRecords[0];
    if (onReviewClick) {
      onReviewClick(record);
    } else {
      const id = (record as Record<string, unknown>)[idAccessor];
      const href = basePath ? `${basePath}/${id}` : `/${id}`;
      window.location.href = href;
    }
  }, [selectedRecords, onReviewClick, idAccessor, basePath]);

  if (selectedRecords.length === 0) return null;

  const isSingle = selectedRecords.length === 1;

  return (
    <div suppressHydrationWarning>
      <Paper
        bg="dark.9"
        pos="absolute"
        bottom={12}
        left="50%"
        style={{ transform: "translateX(-50%)", zIndex: 10 }}
        withBorder
        shadow="md"
      >
        <Group gap={0} wrap="nowrap">
          <Text
            py="xs"
            pl="md"
            c="white"
            size="xs"
            style={{ whiteSpace: "nowrap" }}
          >
            {selectedRecords.length} selected
          </Text>

          <Divider mx="xs" opacity={0.15} orientation="vertical" />

          {!disableReviewButton && (
            <Button
              leftSection={<EyeIcon size={13} aria-hidden />}
              size="xs"
              variant="subtle"
              color="gray"
              c="gray.3"
              opacity={isSingle && !deleting ? 1 : 0.45}
              style={{
                pointerEvents: isSingle && !deleting ? undefined : "none",
              }}
              aria-disabled={!isSingle || deleting}
              title={
                isSingle
                  ? "Review selected record"
                  : "Select only one record to review"
              }
              onClick={handleReview}
            >
              Review
            </Button>
          )}

          {!disableEditButton && isSingle && (
            <Button
              leftSection={<PencilIcon size={13} aria-hidden />}
              size="xs"
              variant="subtle"
              c="blue.3"
              disabled={deleting}
              title="Edit selected record"
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}

          {!disableDeleteButton && (
            <Button
              leftSection={<TrashIcon size={13} aria-hidden />}
              size="xs"
              variant="subtle"
              c="red.4"
              loading={deleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}

          <Button
            leftSection={<XIcon size={13} aria-hidden />}
            size="xs"
            variant="subtle"
            c="gray.3"
            disabled={deleting}
            onClick={clearSelection}
          >
            Clear
          </Button>
        </Group>
      </Paper>
    </div>
  );
}
