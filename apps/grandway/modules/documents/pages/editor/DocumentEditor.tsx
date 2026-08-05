"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Alert } from "@peppermint/ui";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { RequireDocumentAccess } from "@/components/RequireDocumentAccess";
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
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import { useDocumentEditor } from "../../context";
import styles from "./DocumentEditor.module.css";

const SIDEBAR_INITIAL_WIDTH = 200;
const EDIT_BUTTON_OFFSET = 16;

function DocumentEditorInner() {
  const { hasUnsavedChanges, readOnlyReason } = useDocumentEditor();
  const [pagesOpen, setPagesOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const pagesResize = useResizableWidth({
    initialWidth: SIDEBAR_INITIAL_WIDTH,
  });
  const historyResize = useResizableWidth({
    initialWidth: SIDEBAR_INITIAL_WIDTH,
  });

  useUnsavedChangesGuard(hasUnsavedChanges);

  return (
    <div className={styles.root}>
      <header className={`${styles.mainHeader} no-print`}>
        <DocHeader />
      </header>

      {/* Say it once, plainly. Without this the state is only inferable from
          buttons that aren't there, which reads as a broken page rather than an
          intended one. Only the role case is announced — "archived" and
          "historical" are already visible in the toolbar's own badges. */}
      {readOnlyReason === "role" && (
        <Alert
          className="no-print"
          color="blue"
          variant="light"
          radius={0}
          icon={<EyeIcon size={16} aria-hidden />}
        >
          View only — you can read and print these documents, but not change
          them.
        </Alert>
      )}

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
          historyOpen
            ? historyResize.width + EDIT_BUTTON_OFFSET
            : EDIT_BUTTON_OFFSET
        }
      />

      <CreateDocumentModal />
      <EditFieldsModal />
    </div>
  );
}

/**
 * The full-screen document editor. Serves both the applicant-workspace route
 * (`/documents/workspace/[applicantId]`) and the standalone-document route
 * (`/documents/standalone/[documentId]`).
 *
 * `RequireDocumentAccess` admits anyone who may READ a document — `superadmin` never,
 * `lead_manager` only once `LEAD_MANAGER_DOCUMENT_READ_ENABLED` is on. Whether they
 * may also write is `canEdit` on the editor context, which every authoring affordance
 * inside gates on; a reader gets the same editor with the banner above and no levers.
 */
export function DocumentEditor() {
  const params = useParams();
  const applicantId = (params?.applicantId as string | undefined) ?? null;
  const documentId = (params?.documentId as string | undefined) ?? null;

  if (!applicantId && !documentId) {
    return null;
  }

  return (
    <RequireDocumentAccess>
      <DocumentEditorProvider
        applicantId={applicantId}
        standaloneDocumentId={documentId}
      >
        <DocumentEditorInner />
      </DocumentEditorProvider>
    </RequireDocumentAccess>
  );
}
