"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Divider, Group, PageBreadcrumb } from "@zetsel/ui";
import { DocumentEditorProvider } from "../../context";
import { DocHeader } from "../../components/DocHeader";
import { DocToolbar } from "../../components/DocToolbar";
import { PagesSidebar } from "../../components/PagesSidebar";
import { HistorySidebar } from "../../components/HistorySidebar";
import { DocumentContent } from "../../components/DocumentContent";
import { CreateDocumentModal } from "../../components/CreateDocumentModal";
import { EditFieldsModal } from "../../components/EditFieldsModal";
import styles from "./DocumentEditor.module.css";

interface DocumentEditorInnerProps {
  studentId: string;
}

function DocumentEditorInner({ studentId }: DocumentEditorInnerProps) {
  const [pagesOpen, setPagesOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  const breadcrumbItems = [
    { label: "Admin", href: "/admin" },
    { label: "Documents", href: "/admin/documents" },
    { label: "Editor", href: `/documents/${studentId}` },
  ];

  return (
    <>
      <Group pl="md" h={38} justify="space-between">
        <PageBreadcrumb items={breadcrumbItems} />
      </Group>
      <Divider />
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
      <EditFieldsModal />
      </div>
    </>
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
      <DocumentEditorInner studentId={studentId} />
    </DocumentEditorProvider>
  );
}
