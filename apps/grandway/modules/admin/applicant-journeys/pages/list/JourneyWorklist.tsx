"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { JourneyForm, toJourneyPayload } from "../../form";
import {
  createJourney,
  getJourney,
  listJourneys,
  updateJourney,
} from "../../applicantJourneys.api";
import { journeyQueryKeys } from "../../applicantJourneys.queryKeys";
import type {
  ApplicantJourney,
  JourneyUpdatePayload,
} from "../../applicantJourneys.types";
import type { JourneyFormValues } from "../../form";
import { getJourneysColumns } from "./journeys.columns";

/**
 * `applicant` deep-links (`?applicant=<id>`) so a future Applicant Detail →
 * Journeys panel can send someone here pre-filtered to one person
 * (`docs/backend/applicant-journeys/FLOWS.md`), without being a column the
 * user picks from this table — same `forceFilters`-from-`useSearchParams`
 * convention `audit/events/pages/list/AuditLogList.tsx` uses for `actor_id`.
 */
function useApplicantDeepLinkFilter() {
  const searchParams = useSearchParams();
  const applicant = searchParams.get("applicant") ?? undefined;
  return useMemo(() => (applicant ? { applicant } : undefined), [applicant]);
}

/** `applicant` is immutable on edit — dropped before `PATCH`, never sent. */
function toUpdatePayload(values: JourneyFormValues): JourneyUpdatePayload {
  const { applicant, ...rest } = toJourneyPayload(values);
  void applicant; // immutable on update — deliberately not forwarded
  return rest;
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
  const forceFilters = useApplicantDeepLinkFilter();

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
      forceFilters={forceFilters}
      createModalTitle="New journey"
      editModalTitle="Edit journey"
      modalWidth={640}
      createFormComponent={JourneyForm}
      editFormComponent={JourneyForm}
      onCreateApi={(values) => createJourney(toJourneyPayload(values))}
      onEditApi={(values, record) =>
        updateJourney(record.id, toUpdatePayload(values))
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
