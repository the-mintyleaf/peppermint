"use client";

import { ModalPaper, Tabs } from "@peppermint/ui";
import { DataTableShell } from "@peppermint/admin";
import type { DataTableShellColumn, QueryParams } from "@peppermint/admin";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { GitMergeIcon } from "@phosphor-icons/react/dist/csr/GitMerge";

import {
  fetchLifecycleHistory,
  fetchLockHistory,
  fetchMergeHistory,
} from "../../../_shared";
import {
  lifecycleHistoryColumns,
  lockHistoryColumns,
  mergeHistoryColumns,
} from "../../../history/history.columns";

function HistoryTable<T extends { id: string }>({
  queryKey,
  queryGetFn,
  columns,
  name,
  label,
  description,
}: {
  queryKey: string[];
  queryGetFn: (params?: QueryParams) => Promise<unknown>;
  columns: DataTableShellColumn<T>[];
  name: string;
  label: string;
  description: string;
}) {
  return (
    <ModalPaper withBorder>
      <DataTableShell<T>
        queryKey={queryKey}
        queryGetFn={queryGetFn}
        enableServerQuery
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={columns}
        moduleInfo={{ name, label, description }}
        disableActions
        disableCreateButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
      />
    </ModalPaper>
  );
}

/**
 * Read-only lifecycle / lock / merge feeds for the applicant (append-only history). The
 * in-modal twin of `HistoryPage`'s content, reusing the same fetchers + columns.
 */
export function HistorySection({ applicantId }: { applicantId: string }) {
  return (
    <Tabs defaultValue="lifecycle" keepMounted={false}>
      <Tabs.List mb="md">
        <Tabs.Tab
          value="lifecycle"
          leftSection={<ArrowsLeftRightIcon size={15} aria-hidden />}
        >
          Lifecycle
        </Tabs.Tab>
        <Tabs.Tab
          value="lock"
          leftSection={<LockKeyIcon size={15} aria-hidden />}
        >
          Lock
        </Tabs.Tab>
        <Tabs.Tab
          value="merge"
          leftSection={<GitMergeIcon size={15} aria-hidden />}
        >
          Merge
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="lifecycle">
        <HistoryTable
          queryKey={["applicant.lifecycle-history", applicantId]}
          queryGetFn={(params) => fetchLifecycleHistory(applicantId, params)}
          columns={lifecycleHistoryColumns}
          name="lifecycle-change"
          label="Lifecycle history"
          description="Funnel and engagement changes, newest first"
        />
      </Tabs.Panel>
      <Tabs.Panel value="lock">
        <HistoryTable
          queryKey={["applicant.lock-history", applicantId]}
          queryGetFn={(params) => fetchLockHistory(applicantId, params)}
          columns={lockHistoryColumns}
          name="lock-change"
          label="Lock history"
          description="Lock and unlock actions, newest first"
        />
      </Tabs.Panel>
      <Tabs.Panel value="merge">
        <HistoryTable
          queryKey={["applicant.merge-history", applicantId]}
          queryGetFn={(params) => fetchMergeHistory(applicantId, params)}
          columns={mergeHistoryColumns}
          name="merge-record"
          label="Merge history"
          description="Merges into this record, newest first"
        />
      </Tabs.Panel>
    </Tabs>
  );
}
