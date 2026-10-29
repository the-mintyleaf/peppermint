"use client";

import { useState } from "react";
import { Box, Drawer, ScrollArea, Skeleton, Text } from "@peppermint/ui";
import { QueryErrorState } from "@/components/QueryErrorState";
import { ClipboardBrowser } from "../../_shared/ClipboardBrowser";
import { ClipboardEntryForm } from "../../_shared/ClipboardEntryForm";
import { CategoryManager } from "../../_shared/CategoryManager";
import { useClipboardCategories } from "../../clipboard.hooks";
import type {
  ClipboardDrawerProps,
  ClipboardDrawerView,
} from "./ClipboardDrawer.types";

const LIST_VIEW: ClipboardDrawerView = { kind: "list" };

function titleFor(view: ClipboardDrawerView): string {
  switch (view.kind) {
    case "new":
      return "Save snippet";
    case "edit":
      return "Edit snippet";
    case "categories":
      return "Categories";
    default:
      return "Personal clipboard";
  }
}

/**
 * The personal clipboard as a right-hand drawer — saved text staff reuse when filling
 * documents (a ward office name, a bank address). Opened from the shell; the caller owns
 * the open state, exactly like `NotificationDrawer`.
 *
 * One drawer, three screens (list / save-or-edit form / categories) switched in place
 * rather than stacking modals on a drawer: the snippet list stays mounted underneath so
 * search and filter survive a trip to the form. Closing resets to the list.
 *
 * Access is the caller's: the clipboard is owner-only for EVERY authority (superadmin
 * included), so mount it for any signed-in account — there is no capability to gate on.
 */
export function ClipboardDrawer({ opened, onClose }: ClipboardDrawerProps) {
  const [view, setView] = useState<ClipboardDrawerView>(LIST_VIEW);
  const [deletedCategoryId, setDeletedCategoryId] = useState<string | null>(
    null,
  );
  const categoriesQuery = useClipboardCategories(opened);
  const categories = categoriesQuery.data ?? [];

  const backToList = () => setView(LIST_VIEW);
  const handleClose = () => {
    setView(LIST_VIEW);
    onClose();
  };

  // The form and the manager both need the category list to be trustworthy: a failed
  // load must not read as "you have no categories".
  function renderOverlayView() {
    if (view.kind === "list") return null;
    if (categoriesQuery.isError) {
      return (
        <QueryErrorState
          message="Couldn't load your categories."
          onRetry={() => categoriesQuery.refetch()}
          isRetrying={categoriesQuery.isRefetching}
        />
      );
    }
    if (categoriesQuery.isPending) {
      return <Skeleton height={200} radius="md" aria-label="Loading" />;
    }
    if (view.kind === "categories") {
      return (
        <CategoryManager
          categories={categories}
          onBack={backToList}
          onCategoryDeleted={setDeletedCategoryId}
        />
      );
    }
    return (
      <ClipboardEntryForm
        entry={view.kind === "edit" ? view.entry : undefined}
        categories={categories}
        onDone={backToList}
        onCancel={backToList}
      />
    );
  }

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      position="right"
      size={460}
      padding={0}
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <Text fw={600} size="sm">
          {titleFor(view)}
        </Text>
      }
      styles={{
        // `padding={0}` leaves the fixed header flush; carry the body's padding plus the
        // same underline the notifications drawer and the app's Modal header use.
        header: {
          padding: "var(--mantine-spacing-md)",
          borderBottom: "1px solid var(--mantine-color-gray-light)",
        },
        title: { flex: 1, marginRight: "var(--mantine-spacing-sm)" },
      }}
    >
      <Box p="md">
        <Box hidden={view.kind !== "list"}>
          <ClipboardBrowser
            categories={categories}
            deletedCategoryId={deletedCategoryId}
            onNew={() => setView({ kind: "new" })}
            onEdit={(entry) => setView({ kind: "edit", entry })}
            onManageCategories={() => setView({ kind: "categories" })}
          />
        </Box>
        {renderOverlayView()}
      </Box>
    </Drawer>
  );
}
