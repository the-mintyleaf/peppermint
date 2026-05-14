"use client";

import { Button, Divider, Group, Paper, Text } from "@mantine/core";
import { EyeIcon, PenIcon, TrashIcon, XIcon } from "@phosphor-icons/react";

import { usePathname } from "next/navigation";
import { PropDataTableShellActions } from "../../DataTableShell.type";
import { useContext } from "../../DataTableShell.context";

export function DataTableShellTableActions({
  idAccessor = "id",
  sustained,
  onNewClick,
  onEditClick,
  onDeleteClick,
  onReviewClick,
  disableEditButton = false,
  disableDeleteButton = false,
  disableReviewButton = false,
}: PropDataTableShellActions) {
  // * CONTEXT

  const { selectedRecords, setSelectedRecords, deleting, setDeleting } =
    useContext();

  const Pathname = usePathname();

  const handleDelete = async () => {
    const idsToDelete = selectedRecords.map((record: any) =>
      record[idAccessor]
    );
    setDeleting(true);
    try {
      await onDeleteClick?.(idsToDelete);
      setSelectedRecords([]);
    } finally {
      setDeleting(false);
    }
  };

  const handleReview = () => {
    if (selectedRecords.length === 1) {
      if (onReviewClick) {
        onReviewClick(selectedRecords[0]);
      } else {
        const id = selectedRecords[0][idAccessor];
        // Use window.location for clean navigation without preserving query params
        window.location.href = `${Pathname}/${id}`;
      }
    }
  };

  return (
    <>
      {selectedRecords.length > 0 && (
        <div suppressHydrationWarning>
          <Paper
            bg="dark.9"
            pos="absolute"
            bottom={8}
            left="50%"
            style={{ transform: "translateX(-50%)" }}
            radius="md"
            withBorder
            shadow="md"
          >
            <Group gap={0}>
              <Text py="xs" pl="md" c="white" size="xs">
                {selectedRecords.length} selected
              </Text>
              <Divider mx="xs" opacity={0.1} orientation="vertical" />
              {!disableReviewButton && (
                <Button
                  leftSection={<EyeIcon />}
                  size="xs"
                  variant="subtle"
                  color="gray"
                  title={
                    selectedRecords.length !== 1
                      ? "Select only one record to review"
                      : "Review selected record"
                  }
                  disabled={selectedRecords.length !== 1}
                  onClick={handleReview}
                >
                  Review
                </Button>
              )}

              {selectedRecords.length == 1 && !disableEditButton && (
                <Button
                  leftSection={<PenIcon />}
                  size="xs"
                  variant="subtle"
                  color="brand.4"
                  title={
                    selectedRecords.length !== 1
                      ? "Select only one record to edit"
                      : "Edit selected record"
                  }
                  onClick={() => {
                    console.log(selectedRecords);

                    if (!sustained) {
                      const ids = selectedRecords
                        .map((e: any) => {
                          return e[idAccessor];
                        })
                        .join(",");
                      // Use window.location for clean navigation without preserving query params
                      window.location.href = `${Pathname}/${ids}/edit`;
                    } else {
                      onEditClick?.(selectedRecords[0]);
                    }
                  }}
                >
                  Edit
                </Button>
              )}

              {!disableDeleteButton && (
                <Button
                  onClick={handleDelete}
                  leftSection={<TrashIcon />}
                  size="xs"
                  variant="subtle"
                  color="red.6"
                  loading={deleting}
                >
                  Delete
                </Button>
              )}
              <Button
                leftSection={<XIcon />}
                size="xs"
                variant="subtle"
                color="gray"
                onClick={() => setSelectedRecords([])}
              >
                Clear
              </Button>
            </Group>
          </Paper>
        </div>
      )}
    </>
  );
}
