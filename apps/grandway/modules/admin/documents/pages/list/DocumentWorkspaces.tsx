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
 * The primary Documents surface: one row per applicant who has any documents, with live
 * and archived counted separately (`documents/INTEGRATION.md` §4). An applicant whose
 * documents are all archived still has a row (0 live) and still opens — the editor's
 * Archived group is where they are restored. Standalone documents are excluded here;
 * they live in the All documents worklist.
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
          "Applicants with document work — open a workspace to edit or restore",
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
 * document. Each row's counts are computed server-side across every family
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
