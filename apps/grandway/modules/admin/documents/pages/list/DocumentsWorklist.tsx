"use client";

import { DataTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { FilesIcon } from "@phosphor-icons/react/dist/csr/Files";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { NoteIcon } from "@phosphor-icons/react/dist/csr/Note";
import { RequireDocumentAccess } from "@/components/RequireDocumentAccess";
import { documentQueryKeys, type DocumentListItem } from "@/modules/documents";
import { fetchDocuments } from "../../documents.queries";
import { getDocumentsColumns } from "./documents.columns";

// Omitting `status` returns archived documents too (`INTEGRATION.md` §7), so the default
// "All" tab shows everything; the status tabs narrow, and "Standalone" filters by owner.
const tabs: DataTableShellTab[] = [
  { label: "All", icon: FilesIcon },
  { label: "Drafts", icon: PencilSimpleIcon, filter: { status: "draft" } },
  { label: "Ready", icon: CheckCircleIcon, filter: { status: "ready" } },
  { label: "Archived", icon: ArchiveIcon, filter: { status: "archived" } },
  { label: "Standalone", icon: NoteIcon, filter: { standalone: "true" } },
];

/**
 * The all-documents worklist — every document across applicants and standalone, with
 * status/family/standalone filters. `?search=` matches the label only (`INTEGRATION.md` §9).
 * Each row opens the editor (applicant workspace, or standalone by document id).
 */
function DocumentsWorklistContent() {
  return (
    <DataTableShell<DocumentListItem>
      queryKey={documentQueryKeys.lists()}
      queryGetFn={fetchDocuments}
      enableServerQuery
      dataKey="data"
      paginationKey="meta"
      idAccessor="id"
      columns={getDocumentsColumns()}
      moduleInfo={{
        name: "document",
        label: "All documents",
        description: "Every document — applicant-owned and standalone",
      }}
      disableActions
      disableCreateButton
      disableReviewButton
      tabs={tabs}
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
      basePath="/admin/documents/all"
      mainComponent={ModalPaper}
      mainComponentProps={{ withBorder: true }}
    />
  );
}

export function DocumentsWorklist() {
  return (
    <RequireDocumentAccess>
      <DocumentsWorklistContent />
    </RequireDocumentAccess>
  );
}
