"use client";

import { DataTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireCapability } from "@/components/RequireCapability";
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

/**
 * Gated on `documentWorkspaces`, which is narrower than the right to read a
 * document. Each row's `document_count` is computed server-side across every family
 * (there is no `family` param on `/workspaces/`), so a reader who is not shown the
 * bank families would see a count that cannot match what opens — and the count
 * itself would disclose that bank documents exist. Those readers get
 * `/admin/documents/all`, which narrows per family correctly.
 */
export function DocumentWorkspaces() {
  return (
    <RequireCapability capability="documentWorkspaces">
      <DocumentWorkspacesContent />
    </RequireCapability>
  );
}
