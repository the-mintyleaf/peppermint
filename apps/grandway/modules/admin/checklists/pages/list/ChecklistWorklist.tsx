"use client";

import { useRouter } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { PulseIcon } from "@phosphor-icons/react/dist/csr/Pulse";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { RequireCapability } from "@/components/RequireCapability";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import {
  createChecklist,
  getChecklist,
  listChecklists,
  updateChecklist,
} from "../../checklists.api";
import { checklistQueryKeys } from "../../checklists.queryKeys";
import type { Checklist, UpdateChecklistPayload } from "../../checklists.types";
import { ChecklistCreateForm, ChecklistEditForm } from "../../form";
import type { ChecklistCreateValues } from "../../form";
import { toCreateChecklistPayload } from "../../form";
import { getChecklistWorklistColumns } from "./checklistWorklist.columns";

/**
 * Archived checklists are included by default in `GET /` (§7) — the "All" tab
 * shows everything; the Overdue tab uses the server's own `overdue=true` flag
 * (matches only `draft`/`active` checklists past `due_at`, §3), not a date
 * column filter (unsupported by this endpoint).
 */
const STATUS_TABS: DataTableShellTab[] = [
  { label: "All", icon: ListChecksIcon },
  { label: "Active", icon: PulseIcon, filter: { status: "active" } },
  {
    label: "Completed",
    icon: CheckCircleIcon,
    filter: { status: "completed" },
  },
  { label: "Overdue", icon: ClockIcon, filter: { overdue: true } },
  { label: "Archived", icon: ArchiveIcon, filter: { status: "archived" } },
];

/**
 * Server-side pagination + filters over `GET /`, newest-first (§3). Create/edit
 * are modal-based; lifecycle actions (activate/complete/reopen/archive/restore)
 * and item-level work live on the dedicated `[id]` Checklist Detail route.
 */
function ChecklistWorklistContent() {
  const router = useRouter();
  const columns = getChecklistWorklistColumns({
    onViewDetails: (checklist) =>
      router.push(`/admin/checklists/${checklist.id}`),
  });

  return (
    <ModalTableShell<Checklist, ChecklistCreateValues, UpdateChecklistPayload>
      queryKey={checklistQueryKeys.lists()}
      queryGetFn={listChecklists}
      enableServerQuery
      dataKey="data"
      paginationKey="meta"
      idAccessor="id"
      columns={columns}
      moduleInfo={{
        name: "checklist",
        label: "Checklists",
        description:
          "Every applicant's requirement list, tracked to completion",
      }}
      tabs={STATUS_TABS}
      createModalTitle="New checklist"
      editModalTitle="Edit checklist"
      modalWidth={640}
      createFormComponent={ChecklistCreateForm}
      editFormComponent={ChecklistEditForm}
      onCreateApi={(values) =>
        createChecklist(toCreateChecklistPayload(values))
      }
      onEditApi={(values, record) => updateChecklist(record.id, values)}
      onEditTrigger={(record) => getChecklist(record.id)}
      getErrorMessage={getApiErrorMessage}
      disableReviewButton
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
      basePath="/admin/checklists"
      mainComponent={ModalPaper}
      mainComponentProps={{ withBorder: true }}
    />
  );
}

/**
 * Admin-only. The backend shares this with `lead_manager` (§1), but staff reach a
 * checklist through its journey's Worklist tab, not through a cross-applicant
 * worklist — `/admin/checklists/[id]` stays open to them, this list does not.
 */
export function ModuleChecklistWorklist() {
  return (
    <RequireCapability capability="checklists">
      <ChecklistWorklistContent />
    </RequireCapability>
  );
}
