"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ModalPaper, ModuleHeader } from "@peppermint/ui";
import { DataTableShell } from "@peppermint/admin";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { documentsApi, documentQueryKeys } from "@/modules/documents";
import type { DocumentWorkspaceSummary } from "@/modules/documents";
import { RequireStaff } from "@/components/RequireStaff";
import { documentsColumns } from "./documents.columns";
import { NewDocumentModal } from "./components/NewDocumentModal";

/**
 * Admin Documents module: read-only table of per-applicant document workspaces. Rows open
 * the full-screen editor (a separate route/layout outside the admin shell). "New document"
 * opens an applicant picker, then routes into that editor.
 */
export function DocumentsList() {
  const router = useRouter();
  const [newOpen, setNewOpen] = useState(false);

  const columns = [
    ...documentsColumns,
    {
      accessor: "actions",
      title: "Actions",
      sortable: false,
      width: "15%",
      render: (record: DocumentWorkspaceSummary) => (
        <Button
          size="xs"
          variant="light"
          onClick={() => router.push(`/documents/${record.applicantId}`)}
          aria-label={`Open documents for ${record.applicantName}`}
        >
          Open in Editor
        </Button>
      ),
    },
  ];

  return (
    <RequireStaff>
      <ModuleHeader
        breadcrumbItems={[{ label: "Documents", href: "/admin/documents" }]}
        right={
          <Button
            size="xs"
            leftSection={<PlusIcon size={14} />}
            onClick={() => setNewOpen(true)}
          >
            New document
          </Button>
        }
      />
      <ModalPaper withBorder>
        <DataTableShell<DocumentWorkspaceSummary>
          queryKey={documentQueryKeys.workspaces()}
          queryGetFn={async () => {
            const data = await documentsApi.listWorkspaces();
            return {
              data,
              meta: { total: data.length, page: 1, pageSize: data.length },
            };
          }}
          dataKey="data"
          paginationKey="meta"
          columns={columns}
          moduleInfo={{
            name: "documents",
            label: "Documents",
            description: "Applicant document workspaces",
          }}
          basePath="/admin/documents"
          idAccessor="applicantId"
          disableActions
          pageSizes={[10, 20, 50]}
          defaultPageSize={20}
        />
      </ModalPaper>

      <NewDocumentModal opened={newOpen} onClose={() => setNewOpen(false)} />
    </RequireStaff>
  );
}
