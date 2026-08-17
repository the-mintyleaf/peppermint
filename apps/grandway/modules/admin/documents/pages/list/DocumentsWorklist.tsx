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
import { useCapabilities } from "@/config/access";
import { useDeepLinkSearch } from "@/lib/useDeepLinkSearch";
import {
  allowedDocumentFamilies,
  documentQueryKeys,
  type DocumentListItem,
} from "@/modules/documents";
import { fetchDocuments } from "../../documents.queries";
import { FAMILY_LABELS } from "../../documents.labels";
import { getDocumentsColumns } from "./documents.columns";

// Omitting `status` returns archived documents too (`INTEGRATION.md` §7), so the default
// "All" tab shows everything; the status tabs narrow, and "Standalone" filters by owner.
const FULL_TABS: DataTableShellTab[] = [
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
 *
 * The tab strip depends on the reader. This list is **server-paginated**, so a role
 * that may not see the bank families cannot be served by filtering rows out of a page
 * — that would corrupt both `meta.total` and the page size, showing "20 of 340" above
 * fourteen rows. The server's `family` filter takes one value and has no exclude
 * operator, so the only honest narrowing is one tab per allowed family, and there is
 * deliberately **no "All" tab** for those readers: "all four" is not expressible in a
 * single request. Status moves to a column filter for them, which composes with the
 * open tab instead of competing with it.
 */
function DocumentsWorklistContent() {
  const capabilities = useCapabilities();
  // A global-search document hit lands here rather than in the editor: the
  // search contract exposes only the document's id and label, not whether it is
  // standalone or whose workspace it belongs to, so the editor route cannot be
  // derived. Seeding the search box puts the row one click away. Seed, not
  // lock — the reader can clear it immediately.
  const deepLinkSearch = useDeepLinkSearch();
  const families = allowedDocumentFamilies(capabilities);
  const seesEveryFamily = capabilities.documentBankFamilies;

  const tabs: DataTableShellTab[] = seesEveryFamily
    ? FULL_TABS
    : families.map((family) => ({
        label: FAMILY_LABELS[family],
        filter: { family },
      }));

  return (
    <DataTableShell<DocumentListItem>
      queryKey={documentQueryKeys.lists()}
      queryGetFn={fetchDocuments}
      enableServerQuery
      initialSearch={deepLinkSearch}
      dataKey="data"
      paginationKey="meta"
      idAccessor="id"
      columns={getDocumentsColumns({ filterableStatus: !seesEveryFamily })}
      moduleInfo={{
        name: "document",
        label: "All documents",
        // Never "every document" for a reader who isn't shown every family —
        // the description is the one place the narrowing can be admitted.
        description: seesEveryFamily
          ? "Every document — applicant-owned and standalone"
          : "Applicant-owned and standalone documents, by type",
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
