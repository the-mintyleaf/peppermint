"use client";

import { useRouter } from "next/navigation";
import { DataTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { useCapabilities } from "@/config/access";
import { useCountries } from "@/modules/admin/institutions/institutions.hooks";
import { listApplicants } from "../../applicants.api";
import { applicantsQueryKeys } from "../../applicants.queryKeys";
import type { Applicant } from "../../applicants.types";
import { getApplicantsColumns } from "./applicants.columns";

/**
 * How many country tabs the toolbar will render. The catalogue is a curated
 * shortlist in practice, but `useCountries` fetches a page of up to 100 and the
 * toolbar lays tabs out as a single `SegmentedControl` row — so the count is
 * bounded here rather than left to whatever the catalogue happens to hold.
 * Countries past the cap stay reachable: the destination column shows them, and
 * they are still counted in "All applicants".
 */
const MAX_COUNTRY_TABS = 8;

/**
 * `DataTableShell` with destination tabs. Status stays a column filter (3 values
 * with a real server-side filter — tabs there would only duplicate it); the
 * tabs carry `country`, which is the question an operator actually opens this
 * list with ("who is going to Australia?").
 *
 * Each country tab sends `?country=<uuid>` (`docs/backend/applicants/
 * INTEGRATION.md` §3 — server-side, so it narrows before pagination). An
 * applicant has NO country of its own: the filter means "has **a** journey
 * targeting this country", and someone with journeys to two countries appears
 * under both tabs. "All applicants" carries no filter and is the whole set.
 *
 * Create/edit are routes, not modals — this is a `MultiPageModule`.
 */
function ApplicantsListContent() {
  const router = useRouter();
  const { applicantCreate } = useCapabilities();
  const { data: countries } = useCountries();

  const columns = getApplicantsColumns({
    onViewDetails: (applicant) =>
      router.push(`/admin/applicants/${applicant.id}`),
  });

  // Only countries the consultancy currently sends people to — a retired
  // destination is not a tab worth a click. `useCountries` returns the
  // catalogue's own `display_order`, which is the order the admin chose.
  const countryTabs: DataTableShellTab[] = (countries ?? [])
    .filter((country) => country.is_usable)
    .slice(0, MAX_COUNTRY_TABS)
    .map((country) => ({
      label: country.name,
      filter: { country: country.id },
    }));

  const tabs: DataTableShellTab[] = [
    { label: "All applicants" },
    ...countryTabs,
  ];

  return (
    <DataTableShell<Applicant>
      queryKey={applicantsQueryKeys.lists()}
      queryGetFn={listApplicants}
      enableServerQuery
      dataKey="data"
      paginationKey="meta"
      idAccessor="id"
      columns={columns}
      tabs={tabs}
      moduleInfo={{
        name: "applicant",
        label: "Applicants",
        description: "Every applicant, newest first",
      }}
      // Admin-only create — hidden entirely for a Lead Manager rather than
      // disabled (`docs/backend/applicants/FLOWS.md` "Create an applicant
      // directly"). The route it points at is gated to match.
      disableCreateButton={!applicantCreate}
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
