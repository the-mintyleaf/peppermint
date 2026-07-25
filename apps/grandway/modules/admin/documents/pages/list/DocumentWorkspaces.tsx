"use client";

import { DataTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireDocumentAccess } from "@/components/RequireDocumentAccess";
import {
  documentWorkspacesKey,
  type DocumentWorkspaceSummary,
} from "@/modules/documents";
import { fetchWorkspaces } from "../../documents.queries";
import { getWorkspacesColumns } from "./workspaces.columns";

/**
 * The primary Documents surface: one row per applicant with live documents, linking into
 * that applicant's editor workspace. Standalone and archived documents are excluded here
 * (`documents/INTEGRATION.md` §4) — they live in the All documents worklist.
 */
function DocumentWorkspacesContent() {
  return (
    <DataTableShell<DocumentWorkspaceSummary>
      queryKey={documentWorkspacesKey()}
      queryGetFn={fetchWorkspaces}
      enableServerQuery
      dataKey="data"
      paginationKey="meta"
      idAccessor="applicantId"
      columns={getWorkspacesColumns()}
      moduleInfo={{
        name: "document-workspace",
        label: "Documents",
        description:
          "Applicants with live document work — open a workspace to edit",
      }}
      disableActions
      disableCreateButton
      disableReviewButton
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
      basePath="/admin/documents"
      mainComponent={ModalPaper}
      mainComponentProps={{ withBorder: true }}
    />
  );
}

export function DocumentWorkspaces() {
  return (
    <RequireDocumentAccess>
      <DocumentWorkspacesContent />
    </RequireDocumentAccess>
  );
}
