"use client";

import {
  Stack,
  Text,
  ScrollArea,
  ActionIcon,
  Tabs,
  Select,
  Group,
  Avatar,
  Box,
  Button,
} from "@zetsel/ui";
import { X as XIcon } from "@phosphor-icons/react/dist/csr/X";
import { ClockCounterClockwise as HistoryIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { ChatCircle as CommentIcon } from "@phosphor-icons/react/dist/csr/ChatCircle";
import { FloppyDisk as SaveIcon } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { useDocumentEditor } from "../../context";
import { usePrintLogs } from "../../hooks/usePrintLogs";
import { useDocumentActions } from "../../hooks/useDocumentActions";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import styles from "../../pages/editor/DocumentEditor.module.css";

interface HistorySidebarProps {
  onClose: () => void;
}

export function HistorySidebar({ onClose }: HistorySidebarProps) {
  const {
    studentId,
    documents,
    activeDocument,
    activeHistoricalLog,
    setActiveHistoricalLog,
    printableContentRef,
    removeDocumentFromList,
  } = useDocumentEditor();
  const { data: logs = [], isLoading } = usePrintLogs(activeDocument?.id ?? null);

  const { handleSaveHistory, isSavingHistory } = useDocumentActions({
    studentId,
    documents,
    activeDocument,
    printableContentRef,
    onDocumentRemoved: removeDocumentFromList,
  });

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

      <Tabs
        defaultValue="history"
        style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}
      >
        <Tabs.List px={8} style={{ flexShrink: 0, minHeight: 32 }}>
          <Tabs.Tab value="history" fz="xs" py={4} leftSection={<HistoryIcon size={12} aria-hidden />}>
            History
          </Tabs.Tab>
          <Tabs.Tab value="comments" fz="xs" py={4} leftSection={<CommentIcon size={12} aria-hidden />}>
            Comments
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="history" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <Stack gap={6} p={8}>
            <Select
              size="xs"
              label="Show"
              defaultValue="all"
              data={[{ value: "all", label: "All types" }]}
              comboboxProps={{ withinPortal: false }}
              styles={{ label: { fontSize: "var(--mantine-font-size-xs)" } }}
            />

            <ScrollArea style={{ flex: 1 }} type="auto">
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
        </Tabs.Panel>

        <Tabs.Panel value="comments" p={8}>
          <Stack align="center" py="lg" gap={6}>
            <CommentIcon size={20} color="var(--mantine-color-gray-5)" aria-hidden />
            <Text size="xs" c="dimmed" ta="center">
              No comments yet.
            </Text>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </aside>
  );
}
