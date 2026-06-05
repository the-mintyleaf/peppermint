"use client";

import {
  Stack,
  Text,
  ScrollArea,
  ActionIcon,
  Menu,
  Box,
  Group,
  UnstyledButton,
} from "@zetsel/ui";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { X as XIcon } from "@phosphor-icons/react/dist/csr/X";
import { FileText as FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { modals } from "@zetsel/ui";
import { useDocumentEditor } from "../../context";
import { documentTypeList, getDocumentTypeConfig } from "../../documentTypeConfig";
import { useDocumentActions } from "../../hooks/useDocumentActions";
import type { DocumentType } from "../../documents.types";
import styles from "../../pages/editor/DocumentEditor.module.css";

interface PagesSidebarProps {
  onClose: () => void;
}

export function PagesSidebar({ onClose }: PagesSidebarProps) {
  const {
    studentId,
    documents,
    activeDocumentId,
    setActiveDocumentId,
    openCreateModal,
    printableContentRef,
    removeDocumentFromList,
  } = useDocumentEditor();

  const { handleRemoveDocument } = useDocumentActions({
    studentId,
    documents,
    activeDocument: documents.find((d) => d.id === activeDocumentId) ?? null,
    printableContentRef,
    onDocumentRemoved: removeDocumentFromList,
  });

  const availableTypes = documentTypeList.filter((config) => {
    if (config.requiresStudent && !studentId) return false;
    if (config.uniquePerStudent && documents.some((d) => d.type === config.type)) {
      return false;
    }
    return true;
  });

  const confirmRemove = (documentId: string, label: string) => {
    modals.openConfirmModal({
      title: "Remove page",
      children: `Remove "${label}" from this workspace?`,
      labels: { confirm: "Remove", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => handleRemoveDocument(documentId),
    });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Text fw={600} size="xs">
          Pages
        </Text>
        <Group gap={2}>
          <Menu shadow="md" position="bottom-start" width={160}>
            <Menu.Target>
              <ActionIcon
                className={styles.iconBtn}
                variant="subtle"
                size="xs"
                aria-label="Add new page"
                disabled={availableTypes.length === 0}
              >
                <PlusIcon size={12} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>New page</Menu.Label>
              {availableTypes.map((config) => (
                <Menu.Item
                  key={config.type}
                  fz="xs"
                  onClick={() => openCreateModal(config.type as DocumentType)}
                >
                  {config.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
          <ActionIcon
            className={styles.iconBtn}
            variant="subtle"
            size="xs"
            onClick={onClose}
            aria-label="Close pages panel"
          >
            <XIcon size={12} />
          </ActionIcon>
        </Group>
      </div>

      <ScrollArea style={{ flex: 1 }} p={6} type="auto">
        <Stack gap={12}>
          {documents.map((doc, index) => {
            const typeConfig = getDocumentTypeConfig(doc.type);
            const isActive = doc.id === activeDocumentId;

            return (
              <Box
                key={doc.id}
                className={`${styles.pageItem}${isActive ? ` ${styles.pageItemActive}` : ""}`}
                pos="relative"
              >
                <ActionIcon
                  size="xs"
                  variant="transparent"
                  color="gray"
                  style={{ position: "absolute", top: 2, right: 2, zIndex: 1 }}
                  onClick={() => confirmRemove(doc.id, doc.label)}
                  aria-label={`Remove ${doc.label}`}
                />
                <UnstyledButton
                  w="100%"
                  onClick={() => setActiveDocumentId(doc.id)}
                  aria-label={`Page ${index + 1}: ${doc.label}`}
                  styles={{ root: { display: "block", border: "none", background: "transparent", padding: 0 } }}
                >
                  <Stack gap={4} align="center">
                    <Text size="xs" c="dimmed" lh={1}>
                      {index + 1}
                    </Text>
                    <Box className={styles.pageThumb} w="100%">
                      <FileTextIcon size={16} color="var(--mantine-color-brand-5)" aria-hidden />
                      <Text size="xs" c="dimmed" ta="center" lineClamp={1} mt={2} lh={1.2}>
                        {typeConfig.label}
                      </Text>
                    </Box>
                    <Text size="xs" fw={500} lineClamp={1} lh={1.2} ta="center" w="100%" px={4}>
                      {doc.label}
                    </Text>
                  </Stack>
                </UnstyledButton>
              </Box>
            );
          })}

          {documents.length === 0 && (
            <Stack align="center" py="sm" gap={4}>
              <Text size="xs" c="dimmed" ta="center">
                No pages
              </Text>
              {availableTypes.length > 0 && (
                <Menu shadow="md" position="bottom">
                  <Menu.Target>
                    <ActionIcon variant="light" size="sm" aria-label="Add first page">
                      <PlusIcon size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {availableTypes.map((config) => (
                      <Menu.Item
                        key={config.type}
                        fz="xs"
                        onClick={() => openCreateModal(config.type as DocumentType)}
                      >
                        {config.label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              )}
            </Stack>
          )}
        </Stack>
      </ScrollArea>
    </aside>
  );
}
