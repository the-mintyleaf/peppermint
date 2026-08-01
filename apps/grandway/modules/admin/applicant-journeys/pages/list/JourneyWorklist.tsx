"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import {
  JourneyForm,
  toJourneyPayload,
  toJourneyUpdatePayload,
} from "../../form";
import {
  createJourney,
  getJourney,
  listJourneys,
  updateJourney,
} from "../../applicantJourneys.api";
import { journeyQueryKeys } from "../../applicantJourneys.queryKeys";
import type { ApplicantJourney } from "../../applicantJourneys.types";
import type { JourneyFormValues } from "../../form";
import { getJourneysColumns } from "./journeys.columns";
import { useCountryTabs } from "./JourneyWorklist.hooks";

/**
 * `applicant` deep-links (`?applicant=<id>`) so `ApplicantJourneysPanel`'s
 * "View in worklist" link can send someone here pre-filtered to one person,
 * without being a column the user picks from this table — same
 * `forceFilters`-from-`useSearchParams` convention
 * `audit/events/pages/list/AuditLogList.tsx` uses for `actor_id`.
 *
 * Deliberately not doing the same for `stage`: unlike `applicant`, `stage`
 * already has a user-editable column filter (`journeys.columns.tsx`), and
 * `forceFilters` always wins over it in `DataTableWrapper`'s merge — a
 * `?stage=` deep link would permanently lock that column's filter control
 * rather than just seeding it, since there's no "seed once, then let the
 * user override" mechanism in the shell. Home's stage tiles link to the
 * plain worklist instead.
 */
function useDeepLinkFilters() {
  const searchParams = useSearchParams();
  const applicant = searchParams.get("applicant") ?? undefined;
  return useMemo(() => (applicant ? { applicant } : undefined), [applicant]);
}

/**
 * Real server-side pagination + filters (`GET /journeys/`,
 * `docs/backend/applicant-journeys/INTEGRATION.md` §3/§7) — unlike
 * `lead-management`'s aggregate-fetch board, this endpoint genuinely
 * supports `stage`/`target_country`/`applicant` server-side, so a plain
 * `ModalTableShell` in server-query mode is enough; no client aggregation or
 * category tabs (confirmed via `/design-decisions` — an operational
 * worklist, "everything at Offer Stage," not a per-category board like
 * leads). Create/edit stay modal-based (the create form is small); a
 * dedicated `[id]` Journey Detail route (`ModuleJourneyDetail`) is the
 * linkable permalink `CONCEPT.md` asks for.
 */
function JourneyWorklistContent() {
  const router = useRouter();
  const forceFilters = useDeepLinkFilters();
  const tabs = useCountryTabs();

  const columns = getJourneysColumns({
    onViewDetails: (journey) =>
      router.push(`/admin/applicant-journeys/${journey.id}`),
  });

  return (
    <ModalTableShell<ApplicantJourney, JourneyFormValues>
      queryKey={journeyQueryKeys.lists()}
      queryGetFn={listJourneys}
      enableServerQuery
      dataKey="data"
      paginationKey="meta"
      idAccessor="id"
      columns={columns}
      moduleInfo={{
        name: "journey",
        label: "Applicant Journeys",
        description:
          "Every study objective across all applicants, newest first",
      }}
      tabs={tabs}
      forceFilters={forceFilters}
      createModalTitle="New journey"
      editModalTitle="Edit journey"
      modalWidth={640}
      createFormComponent={JourneyForm}
      editFormComponent={JourneyForm}
      onCreateApi={(values) => createJourney(toJourneyPayload(values))}
      onEditApi={(values, record) =>
        updateJourney(record.id, toJourneyUpdatePayload(values))
      }
      onEditTrigger={(record) => getJourney(record.id)}
      disableReviewButton
      getErrorMessage={getApiErrorMessage}
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
      basePath="/admin/applicant-journeys"
      mainComponent={ModalPaper}
      mainComponentProps={{ withBorder: true }}
    />
  );
}

export function ModuleJourneyWorklist() {
  return (
    <RequireLeadAccess>
      <JourneyWorklistContent />
    </RequireLeadAccess>
  );
}
