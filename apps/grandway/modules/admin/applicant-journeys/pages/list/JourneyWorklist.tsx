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
import type { JourneyFormProps, JourneyFormValues } from "../../form";
import { getJourneysColumns } from "./journeys.columns";
import { useCountryTabs } from "./JourneyWorklist.hooks";

/**
 * `applicant` deep-links (`?applicant=<id>`) so `ApplicantJourneysPanel`'s
 * "View in worklist" link can send someone here pre-filtered to one person,
 * without being a column the user picks from this table — same
 * `forceFilters`-from-`useSearchParams` convention
 * `audit/events/pages/list/AuditLogList.tsx` uses for `actor_id`.
 *
 * The same param also seeds the create form: reaching the worklist through an
 * applicant is a statement about who the next journey is for, so "New journey"
 * opens with them already filled in instead of an empty picker.
 *
 * Deliberately not doing the same for `stage`: unlike `applicant`, `stage`
 * already has a user-editable column filter (`journeys.columns.tsx`), and
 * `forceFilters` always wins over it in `DataTableWrapper`'s merge — a
 * `?stage=` deep link would permanently lock that column's filter control
 * rather than just seeding it, since there's no "seed once, then let the
 * user override" mechanism in the shell. Home's stage tiles link to the
 * plain worklist instead.
 */
function useDeepLinkApplicant() {
  const searchParams = useSearchParams();
  const applicant = searchParams.get("applicant") ?? undefined;

  const forceFilters = useMemo(
    () => (applicant ? { applicant } : undefined),
    [applicant],
  );

  // Arriving pre-filtered to one person means "New journey" is being pressed
  // *for* that person — so the create form is bound to them (`applicantId`
  // locks the picker to a read-only name) rather than opening with an empty
  // applicant search the user has to redo. A journey created for anyone else
  // here would immediately vanish from the filtered table anyway.
  //
  // Memoized on the id so the shell isn't handed a fresh component type on
  // every render, which would remount the open modal and wipe the form.
  const createFormComponent = useMemo(() => {
    if (!applicant) return JourneyForm;
    function JourneyFormForApplicant(props: JourneyFormProps) {
      return <JourneyForm {...props} applicantId={applicant} />;
    }
    return JourneyFormForApplicant;
  }, [applicant]);

  return { forceFilters, createFormComponent };
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
  const { forceFilters, createFormComponent } = useDeepLinkApplicant();
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
      createFormComponent={createFormComponent}
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
