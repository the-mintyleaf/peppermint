"use client";

import { useEffect } from "react";
import { modals, Text } from "@zetsel/ui";

export function confirmLeaveWithUnsavedChanges(onConfirm: () => void) {
  modals.openConfirmModal({
    title: <Text size="sm">Leave editor?</Text>,
    withCloseButton: false,
    children: (
      <Text size="sm">All unsaved changes will be lost. Are you sure?</Text>
    ),
    confirmProps: { size: "xs" },
    cancelProps: { size: "xs" },
    labels: { confirm: "Leave", cancel: "Stay" },
    onConfirm,
    styles: { body: { padding: "var(--mantine-spacing-md)" } },
  });
}

export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      confirmLeaveWithUnsavedChanges(() => {
        window.removeEventListener("popstate", handlePopState);
        window.history.back();
      });
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [hasUnsavedChanges]);
}
