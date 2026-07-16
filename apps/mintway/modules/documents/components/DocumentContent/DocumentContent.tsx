"use client";

import {
  Center,
  ScrollArea,
  LoadingOverlay,
  Box,
  useIsMutating,
} from "@peppermint/ui";
import { useDocumentEditor } from "../../context";
import { getDocumentTypeConfig } from "../../documentTypeConfig";
import { documentMutationKeys } from "../../documents.queryKeys";
import { EmptyState } from "../EmptyState";
import styles from "../../pages/editor/DocumentEditor.module.css";

export function DocumentContent() {
  const {
    documents,
    activeDocument,
    activeHistoricalLog,
    studentFullData,
    signatures,
    printableContentRef,
  } = useDocumentEditor();

  const isDeleting =
    useIsMutating({ mutationKey: documentMutationKeys.remove() }) > 0;

  if (documents.length === 0) {
    return (
      <Box
        className={styles.centerContent}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EmptyState />
      </Box>
    );
  }

  if (!activeDocument) {
    return (
      <Center className={styles.centerContent}>
        <EmptyState />
      </Center>
    );
  }

  const config = getDocumentTypeConfig(activeDocument.type);
  const Template = config.Template;
  const isHistorical = !!activeHistoricalLog;

  return (
    <ScrollArea className={styles.centerContent} type="auto">
      <Box
        style={{ position: "relative", minHeight: "100%", padding: "12px 8px" }}
      >
        <LoadingOverlay visible={isDeleting} zIndex={100} />

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
