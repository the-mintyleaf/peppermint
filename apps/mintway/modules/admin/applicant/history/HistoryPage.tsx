"use client";

import { useParams } from "next/navigation";
import { ModalPaper, Tabs } from "@peppermint/ui";
import { DataTableShell } from "@peppermint/admin";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { GitMergeIcon } from "@phosphor-icons/react/dist/csr/GitMerge";

import { RequireStaff } from "@/components/RequireStaff";
import {
  ApplicantDetailShell,
  fetchLifecycleHistory,
  fetchLockHistory,
  fetchMergeHistory,
} from "../_shared";
import {
  lifecycleHistoryColumns,
  lockHistoryColumns,
  mergeHistoryColumns,
} from "./history.columns";

function HistoryPageContent() {
  const { applicantId } = useParams<{ applicantId: string }>();

  return (
    <ApplicantDetailShell applicantId={applicantId} activeSection="history">
      <Tabs defaultValue="lifecycle">
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
          <ModalPaper withBorder>
            <DataTableShell
              queryKey={["applicant.lifecycle-history", applicantId]}
              queryGetFn={(params) =>
                fetchLifecycleHistory(applicantId, params)
              }
              enableServerQuery
              dataKey="data"
              paginationKey="meta"
              idAccessor="id"
              columns={lifecycleHistoryColumns}
              moduleInfo={{
                name: "lifecycle-change",
                label: "Lifecycle history",
                description: "Funnel and engagement changes, newest first",
              }}
              disableActions
              disableCreateButton
              pageSizes={[10, 20, 30, 50]}
              defaultPageSize={20}
            />
          </ModalPaper>
        </Tabs.Panel>

        <Tabs.Panel value="lock">
          <ModalPaper withBorder>
            <DataTableShell
              queryKey={["applicant.lock-history", applicantId]}
              queryGetFn={(params) => fetchLockHistory(applicantId, params)}
              enableServerQuery
              dataKey="data"
              paginationKey="meta"
              idAccessor="id"
              columns={lockHistoryColumns}
              moduleInfo={{
                name: "lock-change",
                label: "Lock history",
                description: "Lock and unlock actions, newest first",
              }}
              disableActions
              disableCreateButton
              pageSizes={[10, 20, 30, 50]}
              defaultPageSize={20}
            />
          </ModalPaper>
        </Tabs.Panel>

        <Tabs.Panel value="merge">
          <ModalPaper withBorder>
            <DataTableShell
              queryKey={["applicant.merge-history", applicantId]}
              queryGetFn={(params) => fetchMergeHistory(applicantId, params)}
              enableServerQuery
              dataKey="data"
              paginationKey="meta"
              idAccessor="id"
              columns={mergeHistoryColumns}
              moduleInfo={{
                name: "merge-record",
                label: "Merge history",
                description: "Duplicate merges involving this applicant",
              }}
              disableActions
              disableCreateButton
              pageSizes={[10, 20, 30, 50]}
              defaultPageSize={20}
            />
          </ModalPaper>
        </Tabs.Panel>
      </Tabs>
    </ApplicantDetailShell>
  );
}

/** Lifecycle · lock · merge history feeds (read-only, §1.7/§2.3/§14.2). Admin only. */
export function HistoryPage() {
  return (
    <RequireStaff>
      <HistoryPageContent />
    </RequireStaff>
  );
}
