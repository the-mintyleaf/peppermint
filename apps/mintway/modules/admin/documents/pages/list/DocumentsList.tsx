"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionIcon, Button, Group, ModalPaper, Tooltip } from "@peppermint/ui";
import { DataTableShell } from "@peppermint/admin";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { documentsApi, documentQueryKeys } from "@/modules/documents";
import type { DocumentWorkspaceSummary } from "@/modules/documents";
import { RequireStaff } from "@/components/RequireStaff";
import { documentsColumns } from "./documents.columns";
import { NewDocumentModal } from "./components/NewDocumentModal";
import { DocumentWorkspaceDrawer } from "./components/DocumentWorkspaceDrawer";

/**
 * Admin Documents module: read-only table of per-applicant document workspaces. Rows open
 * the full-screen editor (a separate route/layout outside the admin shell). "New document"
 * opens an applicant picker, then routes into that editor. The info button opens a detail
 * drawer for inspecting a workspace's documents, revisions, and prints in place.
 */
export function DocumentsList() {
  const router = useRouter();
  const [newOpen, setNewOpen] = useState(false);
  const [detailWorkspace, setDetailWorkspace] =
    useState<DocumentWorkspaceSummary | null>(null);

  const columns = [
    ...documentsColumns,
    {
      accessor: "actions",
      title: "Editor",
      sortable: false,
      width: "15%",
      render: (record: DocumentWorkspaceSummary) => (
        <Group gap="xs" wrap="nowrap">
          <Button
            size="xs"
            variant="subtle"
            rightSection={<ArrowUpRightIcon size={14} aria-hidden />}
            onClick={() => router.push(`/documents/${record.applicantId}`)}
            aria-label={`Open editor for ${record.applicantName}`}
          >
            Open Editor
          </Button>
          <Tooltip label="Document details" withArrow>
            <ActionIcon
              size="lg"
              variant="subtle"
              color="gray"
              onClick={() => setDetailWorkspace(record)}
              aria-label={`View document details for ${record.applicantName}`}
            >
              <InfoIcon size={18} aria-hidden />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <RequireStaff>
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
        sustained
        onNewClick={() => setNewOpen(true)}
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />

      <NewDocumentModal opened={newOpen} onClose={() => setNewOpen(false)} />

      <DocumentWorkspaceDrawer
        workspace={detailWorkspace}
        opened={detailWorkspace !== null}
        onClose={() => setDetailWorkspace(null)}
      />
    </RequireStaff>
  );
}
