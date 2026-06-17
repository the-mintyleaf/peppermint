"use client";

import { DataTableShell } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import { useRouter } from "next/navigation";
import { fetchDrafts } from "../../drafts.api";
import { draftsColumns } from "./drafts.columns";
import { draftQueryKeys } from "../../drafts.queryKeys";
import type { DraftRow } from "../../drafts.types";

const BASE_PATH = "/admin/publish/drafts";

const MODULE_INFO = {
  name: "drafts",
  label: "Drafts",
  description: "Review and manage your draft content",
};

export function DraftsList() {
  const router = useRouter();

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <DataTableShell<DraftRow>
        queryKey={draftQueryKeys.list()}
        queryGetFn={fetchDrafts}
        dataKey="data"
        paginationKey="meta"
        columns={draftsColumns}
        moduleInfo={MODULE_INFO}
        idAccessor="id"
        basePath={BASE_PATH}
        newButtonHref="/admin/create"
        onEditClick={(record) => router.push(`/admin/create?id=${record.id}`)}
        disableEditButton
        disableDeleteButton
        disableActions
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
      />
    </Paper>
  );
}
