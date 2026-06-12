"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DocumentEditorProvider } from "../../context";
import { DocHeader } from "../../components/DocHeader";
import { DocToolbar } from "../../components/DocToolbar";
import { PagesSidebar } from "../../components/PagesSidebar";
import { HistorySidebar } from "../../components/HistorySidebar";
import { ResizablePanel } from "../../components/ResizablePanel";
import { DocumentContent } from "../../components/DocumentContent";
import { CreateDocumentModal } from "../../components/CreateDocumentModal";
import { EditFieldsModal } from "../../components/EditFieldsModal";
import { EditCurrentDocumentButton } from "../../components/EditCurrentDocumentButton";
import { useResizableWidth } from "../../hooks/useResizableWidth";
import styles from "./DocumentEditor.module.css";

const SIDEBAR_INITIAL_WIDTH = 200;
const EDIT_BUTTON_OFFSET = 16;

function DocumentEditorInner() {
  const [pagesOpen, setPagesOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const pagesResize = useResizableWidth({ initialWidth: SIDEBAR_INITIAL_WIDTH });
  const historyResize = useResizableWidth({ initialWidth: SIDEBAR_INITIAL_WIDTH });

  return (
    <div className={styles.root}>
      <header className={`${styles.mainHeader} no-print`}>
        <DocHeader />
      </header>

      <div className={styles.workspace}>
        {pagesOpen && (
          <ResizablePanel
            width={pagesResize.width}
            side="left"
            onResizeStart={(event) => pagesResize.startResize(event, "left")}
          >
            <PagesSidebar onClose={() => setPagesOpen(false)} />
          </ResizablePanel>
        )}

        <div className={styles.centerPanel}>
          <div className={`${styles.subHeader} no-print`}>
            <DocToolbar
              pagesOpen={pagesOpen}
              historyOpen={historyOpen}
              onTogglePages={() => setPagesOpen((v) => !v)}
              onToggleHistory={() => setHistoryOpen((v) => !v)}
            />
          </div>
          <DocumentContent />
        </div>

        {historyOpen && (
          <ResizablePanel
            width={historyResize.width}
            side="right"
            onResizeStart={(event) => historyResize.startResize(event, "right")}
          >
            <HistorySidebar onClose={() => setHistoryOpen(false)} />
          </ResizablePanel>
        )}
      </div>

      <EditCurrentDocumentButton
        rightOffset={
          historyOpen ? historyResize.width + EDIT_BUTTON_OFFSET : EDIT_BUTTON_OFFSET
        }
      />

      <CreateDocumentModal />
      <EditFieldsModal />
    </div>
  );
}

export function DocumentEditor() {
  const params = useParams();
  const studentId = params?.id as string;

  if (!studentId) {
    return null;
  }

  return (
    <DocumentEditorProvider studentId={studentId}>
      <DocumentEditorInner />
    </DocumentEditorProvider>
  );
}
