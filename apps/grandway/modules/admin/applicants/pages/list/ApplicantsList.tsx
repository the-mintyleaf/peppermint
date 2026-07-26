"use client";

import { useRouter } from "next/navigation";
import { DataTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { listApplicants } from "../../applicants.api";
import { applicantsQueryKeys } from "../../applicants.queryKeys";
import type { Applicant } from "../../applicants.types";
import { getApplicantsColumns } from "./applicants.columns";

/**
 * Plain `DataTableShell` (not a categorized board like `lead-management`) —
 * applicants only has 3 status values with a real server-side filter, so
 * tabs would just duplicate the status column filter
 * (`docs/backend/applicants/INTEGRATION.md` §3). Create/edit are routes, not
 * modals — this is a `MultiPageModule`.
 */
function ApplicantsListContent() {
  const router = useRouter();
  const { isAdmin } = useCurrentUser();

  const columns = getApplicantsColumns({
    onViewDetails: (applicant) =>
      router.push(`/admin/applicants/${applicant.id}`),
  });

  return (
    <DataTableShell<Applicant>
      queryKey={applicantsQueryKeys.lists()}
      queryGetFn={listApplicants}
      enableServerQuery
      dataKey="data"
      paginationKey="meta"
      idAccessor="id"
      columns={columns}
      moduleInfo={{
        name: "applicant",
        label: "Applicants",
        description: "Every applicant, newest first",
      }}
      // Admin-only create — hidden entirely for a Lead Manager rather than
      // disabled (`docs/backend/applicants/FLOWS.md` "Create an applicant
      // directly").
      disableCreateButton={!isAdmin}
      disableDeleteButton
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
      basePath="/admin/applicants"
      mainComponent={ModalPaper}
      mainComponentProps={{ withBorder: true }}
    />
  );
}

export function ModuleApplicantsList() {
  return (
    <RequireLeadAccess>
      <ApplicantsListContent />
    </RequireLeadAccess>
  );
}
