"use client";

import { memo, useCallback, type ComponentType } from "react";
import {
  Stack,
  Text,
  ScrollArea,
  ActionIcon,
  Select,
  Group,
  Avatar,
  Box,
  Button,
} from "@zetsel/ui";
import { X as XIcon } from "@phosphor-icons/react/dist/csr/X";
import { FloppyDisk as SaveIcon } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { useDocumentEditor } from "../../context";
import { usePrintLogs } from "../../hooks/usePrintLogs";
import { useDocumentActions } from "../../hooks/useDocumentActions";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import type { Document, DocumentConfigBarProps, DocumentContent } from "../../documents.types";
import styles from "../../pages/editor/DocumentEditor.module.css";

interface HistorySidebarProps {
  onClose: () => void;
}

interface DocumentCustomizationsProps {
  ConfigBar: ComponentType<DocumentConfigBarProps> | undefined;
  document: Document | null;
  onUpdate: (content: DocumentContent) => void;
}

const DocumentCustomizations = memo(function DocumentCustomizations({
  ConfigBar,
  document,
  onUpdate,
}: DocumentCustomizationsProps) {
  if (!ConfigBar || !document) {
    return (
      <Text size="xs" c="dimmed" ta="center" py="sm" px={8}>
        No Customizations for this Document
      </Text>
    );
  }
  return <ConfigBar document={document} onUpdate={onUpdate} />;
});

export function HistorySidebar({ onClose }: HistorySidebarProps) {
  const {
    studentId,
    documents,
    activeDocument,
    activeHistoricalLog,
    setActiveHistoricalLog,
    printableContentRef,
    removeDocumentFromList,
    updateDocumentContent,
  } = useDocumentEditor();

  const { data: logs = [], isLoading } = usePrintLogs(activeDocument?.id ?? null);

  const { handleSaveHistory, isSavingHistory } = useDocumentActions({
    studentId,
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
    [activeDocument, updateDocumentContent]
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
            style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
          >
            <Select
              size="xs"
              label="Show"
              defaultValue="all"
              data={[{ value: "all", label: "All types" }]}
              comboboxProps={{ withinPortal: false }}
              styles={{ label: { fontSize: "var(--mantine-font-size-xs)" } }}
            />

            <ScrollArea style={{ flex: 1, minHeight: 0 }} type="auto">
              <Stack gap={6}>
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
                  aria-label="Save a new history"
                >
                  Save a new history
                </Button>

                {isLoading && (
                  <Text size="xs" c="dimmed">
                    Loading...
                  </Text>
                )}
                {!isLoading && logs.length === 0 && (
                  <Text size="xs" c="dimmed">
                    No saved history yet.
                  </Text>
                )}
                {logs.map((log) => {
                  const isActive = activeHistoricalLog?.id === log.id;
                  const typeLabel = getDocumentTypeConfig(log.type).label;

                  return (
                    <Box
                      key={log.id}
                      className={`${styles.historyCard}${isActive ? ` ${styles.historyCardActive}` : ""}`}
                      p={8}
                      onClick={() => setActiveHistoricalLog(isActive ? null : log)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setActiveHistoricalLog(isActive ? null : log);
                        }
                      }}
                    >
                      <Group gap={6} align="flex-start" wrap="nowrap">
                        <Avatar radius="xl" size={20} color="brand" fz="xs">
                          P
                        </Avatar>
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <Group justify="space-between" wrap="nowrap" gap={4}>
                            <Text size="xs" fw={500} lh={1.2}>
                              Print version
                            </Text>
                            <Text size="xs" c="dimmed" lh={1.2}>
                              {new Date(log.printedAt).toLocaleDateString()}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed" lh={1.2}>
                            {typeLabel} · {new Date(log.printedAt).toLocaleTimeString()}
                          </Text>
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
            />
          </ScrollArea>
        </div>
      </div>
    </aside>
  );
}
