"use client";

import { memo, useCallback, type ComponentType } from "react";
import {
  Stack,
  Text,
  ScrollArea,
  ActionIcon,
  Group,
  Avatar,
  Box,
  Button,
  Badge,
  Menu,
} from "@peppermint/ui";
import { X as XIcon } from "@phosphor-icons/react/dist/csr/X";
import { FloppyDisk as SaveIcon } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { ClockCounterClockwise as RestoreIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { useDocumentEditor } from "../../context";
import { useDocumentHistory } from "../../hooks/useDocumentHistory";
import { useDocumentActions } from "../../hooks/useDocumentActions";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import { isEditableStatus } from "../../documents.status";
import type {
  Document,
  DocumentConfigBarProps,
  DocumentContent,
} from "../../documents.types";
import styles from "../../pages/editor/DocumentEditor.module.css";

interface HistorySidebarProps {
  onClose: () => void;
}

interface DocumentCustomizationsProps {
  ConfigBar: ComponentType<DocumentConfigBarProps> | undefined;
  document: Document | null;
  onUpdate: (content: DocumentContent) => void;
  editable: boolean;
  isHistoryPreview: boolean;
}

const DocumentCustomizations = memo(function DocumentCustomizations({
  ConfigBar,
  document,
  onUpdate,
  editable,
  isHistoryPreview,
}: DocumentCustomizationsProps) {
  if (!ConfigBar || !document) {
    return (
      <Text size="xs" c="dimmed" ta="center" py="sm" px={8}>
        No Customizations for this Document
      </Text>
    );
  }
  if (!editable) {
    return (
      <Text size="xs" c="dimmed" ta="center" py="sm" px={8}>
        {isHistoryPreview
          ? "Viewing a past version — return to the current version to edit."
          : `This document is ${document.status} and can no longer be edited.`}
      </Text>
    );
  }
  return <ConfigBar document={document} onUpdate={onUpdate} />;
});

export function HistorySidebar({ onClose }: HistorySidebarProps) {
  const {
    applicantId,
    documents,
    activeDocument,
    activeHistoricalLog,
    setActiveHistoricalLog,
    printableContentRef,
    removeDocumentFromList,
    updateDocumentContent,
  } = useDocumentEditor();

  const { entries, isLoading, restore, isRestoring } = useDocumentHistory(
    applicantId,
    activeDocument?.id ?? null,
  );

  const { handleSaveHistory, isSavingHistory } = useDocumentActions({
    applicantId,
    documents,
    activeDocument,
    printableContentRef,
    onDocumentRemoved: removeDocumentFromList,
  });

  const ConfigBar = activeDocument
    ? getDocumentTypeConfig(activeDocument.type).ConfigBar
    : undefined;

  const handleUpdate = useCallback(
    (content: DocumentContent) => {
      if (activeDocument) updateDocumentContent(activeDocument.id, content);
    },
    [activeDocument, updateDocumentContent],
  );

  return (
    <aside className={`${styles.sidebar} ${styles.sidebarRight}`}>
      <div className={styles.sidebarHeader}>
        <Text fw={600} size="xs">
          Activity
        </Text>
        <ActionIcon
          className={styles.iconBtn}
          variant="subtle"
          size="xs"
          onClick={onClose}
          aria-label="Close activity panel"
        >
          <XIcon size={12} />
        </ActionIcon>
      </div>

      <div className={styles.sidebarBody}>
        <div className={styles.activityHistory}>
          <Stack
            gap={6}
            p={8}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <Button
              variant="light"
              size="xs"
              fullWidth
              leftSection={<SaveIcon size={12} aria-hidden />}
              onClick={() => {
                setActiveHistoricalLog(null);
                handleSaveHistory();
              }}
              loading={isSavingHistory}
              disabled={!activeDocument}
              aria-label="Save a snapshot of the current version"
            >
              Save snapshot
            </Button>

            <ScrollArea style={{ flex: 1, minHeight: 0 }} type="auto">
              <Stack gap={6}>
                {isLoading && (
                  <Text size="xs" c="dimmed">
                    Loading…
                  </Text>
                )}
                {!isLoading && entries.length === 0 && (
                  <Text size="xs" c="dimmed">
                    No history yet. Edits and prints appear here.
                  </Text>
                )}
                {entries.map((entry) => {
                  const isActive = activeHistoricalLog?.id === entry.id;
                  const typeLabel = getDocumentTypeConfig(entry.type).label;
                  const isRevision = entry.kind === "revision";
                  const title = isRevision
                    ? `Version ${entry.revisionNumber}`
                    : "Print snapshot";

                  return (
                    <Box
                      key={entry.id}
                      className={`${styles.historyCard}${isActive ? ` ${styles.historyCardActive}` : ""}`}
                      p={8}
                      onClick={() =>
                        setActiveHistoricalLog(isActive ? null : entry)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setActiveHistoricalLog(isActive ? null : entry);
                        }
                      }}
                    >
                      <Group gap={6} align="flex-start" wrap="nowrap">
                        <Avatar
                          radius="xl"
                          size={20}
                          color={isRevision ? "brand" : "gray"}
                          fz="xs"
                        >
                          {isRevision ? "V" : "P"}
                        </Avatar>
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <Group justify="space-between" wrap="nowrap" gap={4}>
                            <Group gap={4} wrap="nowrap">
                              <Text fz={10} fw={500} lh={1.2}>
                                {title}
                              </Text>
                              <Badge
                                size="xs"
                                variant="light"
                                color={isRevision ? "brand" : "gray"}
                              >
                                {isRevision ? "edit" : "print"}
                              </Badge>
                            </Group>
                            <Text size="xs" c="dimmed" lh={1.2}>
                              {new Date(entry.at).toLocaleDateString()}
                            </Text>
                          </Group>
                          <Text fz={10} c="dimmed" lh={1.2}>
                            {typeLabel} ·{" "}
                            {new Date(entry.at).toLocaleTimeString()}
                          </Text>
                          {isRevision && entry.revisionNumber !== undefined && (
                            <Menu
                              shadow="md"
                              position="bottom-start"
                              withinPortal
                            >
                              <Menu.Target>
                                <Button
                                  variant="subtle"
                                  size="compact-xs"
                                  w="fit-content"
                                  leftSection={
                                    <RestoreIcon size={12} aria-hidden />
                                  }
                                  loading={isRestoring}
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label={`Restore version ${entry.revisionNumber}`}
                                >
                                  Restore
                                </Button>
                              </Menu.Target>
                              <Menu.Dropdown
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Menu.Label>Restore this version?</Menu.Label>
                                <Menu.Item
                                  color="brand"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    restore(entry.revisionNumber as number);
                                  }}
                                >
                                  Yes, restore
                                </Menu.Item>
                                <Menu.Item onClick={(e) => e.stopPropagation()}>
                                  No
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          )}
                        </Stack>
                      </Group>
                    </Box>
                  );
                })}

                {activeHistoricalLog && (
                  <Text
                    size="xs"
                    c="brand"
                    lh={1.2}
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveHistoricalLog(null)}
                  >
                    View current version
                  </Text>
                )}
              </Stack>
            </ScrollArea>
          </Stack>
        </div>

        <div className={styles.activityCustomizations}>
          <div className={styles.sidebarHeader}>
            <Text fw={600} size="xs" c="dimmed">
              Customizations
            </Text>
          </div>
          <ScrollArea style={{ flex: 1, minHeight: 0 }} type="auto">
            <DocumentCustomizations
              key={activeDocument?.id ?? "none"}
              ConfigBar={ConfigBar}
              document={activeDocument ?? null}
              onUpdate={handleUpdate}
              editable={
                !activeHistoricalLog &&
                !!activeDocument &&
                isEditableStatus(activeDocument.status)
              }
              isHistoryPreview={!!activeHistoricalLog}
            />
          </ScrollArea>
        </div>
      </div>
    </aside>
  );
}
