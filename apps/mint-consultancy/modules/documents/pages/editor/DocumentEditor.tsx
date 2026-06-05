"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DocumentEditorProvider } from "../../context";
import { DocHeader } from "../../components/DocHeader";
import { DocToolbar } from "../../components/DocToolbar";
import { PagesSidebar } from "../../components/PagesSidebar";
import { HistorySidebar } from "../../components/HistorySidebar";
import { DocumentContent } from "../../components/DocumentContent";
import { CreateDocumentModal } from "../../components/CreateDocumentModal";
import styles from "./DocumentEditor.module.css";

function DocumentEditorInner() {
  const [pagesOpen, setPagesOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <div className={styles.root}>
      <div className="no-print">
        <DocHeader />
        <DocToolbar
          pagesOpen={pagesOpen}
          historyOpen={historyOpen}
          onTogglePages={() => setPagesOpen((v) => !v)}
          onToggleHistory={() => setHistoryOpen((v) => !v)}
        />
      </div>

      <div className={styles.workspace}>
        {pagesOpen && <PagesSidebar onClose={() => setPagesOpen(false)} />}
        <div className={styles.centerPanel}>
          <DocumentContent />
        </div>
        {historyOpen && <HistorySidebar onClose={() => setHistoryOpen(false)} />}
      </div>

      <CreateDocumentModal />
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
