"use client";

import {
  Group,
  ActionIcon,
  Text,
  Divider,
  Button,
  Tooltip,
  Badge,
} from "@peppermint/ui";
import { Sidebar as SidebarIcon } from "@phosphor-icons/react/dist/csr/Sidebar";
import { CaretLeft as CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRight as CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { Printer as PrinterIcon } from "@phosphor-icons/react/dist/csr/Printer";
import { useDocumentEditor } from "../../context";
import { useDocumentActions } from "../../hooks/useDocumentActions";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import styles from "../../pages/editor/DocumentEditor.module.css";

interface DocToolbarProps {
  pagesOpen: boolean;
  historyOpen: boolean;
  onTogglePages: () => void;
  onToggleHistory: () => void;
}

export function DocToolbar({
  pagesOpen,
  historyOpen,
  onTogglePages,
  onToggleHistory,
}: DocToolbarProps) {
  const {
    applicantId,
    studentFullData,
    documents,
    activeDocumentId,
    activeDocument,
    activeHistoricalLog,
    setActiveDocumentId,
    printableContentRef,
    removeDocumentFromList,
  } = useDocumentEditor();

  const resolvedActiveDocument =
    activeDocument ?? documents.find((d) => d.id === activeDocumentId) ?? null;

  const { handlePrintCurrent, handlePrintAll } = useDocumentActions({
    applicantId,
    documents,
    activeDocument: resolvedActiveDocument,
    printableContentRef,
    onDocumentRemoved: removeDocumentFromList,
  });

  const displayName = studentFullData?.fullName ?? `Student ${applicantId}`;
  const lastUpdated = documents.reduce(
    (latest, doc) => (doc.updatedAt > latest ? doc.updatedAt : latest),
    documents[0]?.updatedAt ?? "",
  );

  const activeIndex = documents.findIndex((d) => d.id === activeDocumentId);
  const pageNum = activeIndex >= 0 ? activeIndex + 1 : 0;
  const totalPages = documents.length;

  const activeTypeLabel = resolvedActiveDocument
    ? getDocumentTypeConfig(resolvedActiveDocument.type).label
    : null;

  const metaParts = [
    displayName,
    documents.length > 0 ? `${documents.length} docs` : null,
    lastUpdated
      ? `Updated ${new Date(lastUpdated).toLocaleDateString()}`
      : null,
  ].filter(Boolean);

  const goPrev = () => {
    if (activeIndex > 0) setActiveDocumentId(documents[activeIndex - 1].id);
  };

  const goNext = () => {
    if (activeIndex < documents.length - 1) {
      setActiveDocumentId(documents[activeIndex + 1].id);
    }
  };

  return (
    <div className={styles.bar}>
      <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
        {activeTypeLabel ? (
          <Badge variant="light" size="xs">
            {activeTypeLabel}
          </Badge>
        ) : null}
        {activeHistoricalLog ? (
          <Badge variant="light" size="xs" color="blue">
            Historical
          </Badge>
        ) : null}
        <Text className={styles.barMeta} component="span">
          {metaParts.join(" · ")}
        </Text>
      </Group>

      <Group gap={2} wrap="nowrap" justify="center">
        <ActionIcon
          className={styles.iconBtn}
          variant="subtle"
          size="sm"
          onClick={goPrev}
          disabled={activeIndex <= 0}
          aria-label="Previous page"
        >
          <CaretLeftIcon size={12} />
        </ActionIcon>
        <Text size="xs" c="dimmed" miw={40} ta="center">
          {totalPages > 0 ? `${pageNum}/${totalPages}` : "—"}
        </Text>
        <ActionIcon
          className={styles.iconBtn}
          variant="subtle"
          size="sm"
          onClick={goNext}
          disabled={activeIndex < 0 || activeIndex >= documents.length - 1}
          aria-label="Next page"
        >
          <CaretRightIcon size={12} />
        </ActionIcon>
      </Group>

      <Group gap={4} wrap="nowrap" justify="flex-end" style={{ flex: 1 }}>
        <Button
          variant="subtle"
          size="xs"
          h={28}
          px="xs"
          leftSection={<PrinterIcon size={12} aria-hidden />}
          onClick={handlePrintCurrent}
          disabled={!activeDocumentId}
          aria-label="Print current page"
        >
          Print
        </Button>
        <Button
          variant="filled"
          size="xs"
          h={28}
          px="xs"
          onClick={handlePrintAll}
          disabled={documents.length === 0}
          aria-label="Print all pages"
        >
          Print all
        </Button>
        <Divider orientation="vertical" mx={2} />
        <Tooltip label={pagesOpen ? "Hide pages" : "Show pages"}>
          <ActionIcon
            className={styles.iconBtn}
            variant={pagesOpen ? "light" : "subtle"}
            size="sm"
            onClick={onTogglePages}
            aria-label={pagesOpen ? "Hide pages panel" : "Show pages panel"}
          >
            <SidebarIcon size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={historyOpen ? "Hide history" : "Show history"}>
          <ActionIcon
            className={styles.iconBtn}
            variant={historyOpen ? "light" : "subtle"}
            size="sm"
            onClick={onToggleHistory}
            aria-label={
              historyOpen ? "Hide history panel" : "Show history panel"
            }
          >
            <SidebarIcon size={14} style={{ transform: "scaleX(-1)" }} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </div>
  );
}
