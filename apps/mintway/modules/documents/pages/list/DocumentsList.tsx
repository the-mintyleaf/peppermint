"use client";

import { useRouter } from "next/navigation";
import { Button } from "@peppermint/ui";
import { DataTableShell } from "@peppermint/admin";
import { documentsApi } from "../../documents.api";
import { documentQueryKeys } from "../../documents.queryKeys";
import { documentsColumns } from "./documents.columns";
import type { DocumentWorkspaceSummary } from "../../documents.types";

export function DocumentsList() {
  const router = useRouter();

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
      basePath="/documents"
      idAccessor="applicantId"
      disableActions
      pageSizes={[10, 20, 50]}
      defaultPageSize={20}
    />
  );
}
