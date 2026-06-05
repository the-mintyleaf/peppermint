"use client";

import { Center, ScrollArea, Divider, LoadingOverlay, Box } from "@zetsel/ui";
import { useDocumentEditor } from "../../context";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import { useDocumentActions } from "../../hooks/useDocumentActions";
import { EmptyState } from "../EmptyState";

export function DocumentContent() {
  const {
    studentId,
    documents,
    activeDocument,
    activeHistoricalLog,
    studentFullData,
    signatures,
    printableContentRef,
    updateDocumentContent,
    removeDocumentFromList,
  } = useDocumentEditor();

  const { isDeleting } = useDocumentActions({
    studentId,
    documents,
    activeDocument,
    printableContentRef,
    onDocumentRemoved: removeDocumentFromList,
  });

  if (documents.length === 0) {
    return (
      <Box style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <EmptyState />
      </Box>
    );
  }

  if (!activeDocument) {
    return (
      <Center style={{ flex: 1 }}>
        <EmptyState />
      </Center>
    );
  }

  const config = getDocumentTypeConfig(activeDocument.type);
  const Template = config.Template;
  const ConfigBar = config.ConfigBar;
  const isHistorical = !!activeHistoricalLog;

  return (
    <ScrollArea style={{ flex: 1 }} type="auto">
      <Box style={{ position: "relative", minHeight: "100%", padding: "12px 8px" }}>
        <LoadingOverlay visible={isDeleting} zIndex={100} />

        {ConfigBar && !isHistorical && (
          <div className="no-print">
            <ConfigBar
              document={activeDocument}
              onUpdate={(content) => updateDocumentContent(activeDocument.id, content)}
              signatures={signatures}
            />
            <Divider opacity={0.5} my="md" />
          </div>
        )}

        <Center>
          <div ref={printableContentRef} data-mantine-color-scheme="light">
            <Template
              document={activeDocument}
              studentFullData={studentFullData}
              signatures={signatures}
              historicalSnapshot={activeHistoricalLog?.snapshot ?? null}
              isHistorical={isHistorical}
            />
          </div>
        </Center>
      </Box>
    </ScrollArea>
  );
}
