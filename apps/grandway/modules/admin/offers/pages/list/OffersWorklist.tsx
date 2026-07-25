"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import {
  OfferCreateForm,
  OfferEditForm,
  toOfferCreatePayload,
} from "../../form";
import type { OfferCreateValues } from "../../form";
import {
  createOffer,
  getOffer,
  listOffers,
  updateOffer,
} from "../../offers.api";
import { offerQueryKeys } from "../../offers.queryKeys";
import type { Offer, OfferUpdatePayload } from "../../offers.types";
import { getOffersColumns } from "./offers.columns";

/**
 * The UUID/period filters the offer list supports (§7) —
 * `journey`/`applicant`/`institution`/`program`/`fiscal_year` — have no natural
 * in-table picker (they're exact ids, or a fiscal-year string), so they arrive
 * as deep-links and lock the view via `forceFilters` (same
 * `useSearchParams`-seeded pattern as `JourneyWorklist`). The user-pickable
 * filters (`status`/`offer_type`/`intake`/`deadline_before`) are column filters
 * instead (`offers.columns.tsx`).
 */
function useDeepLinkFilters() {
  const searchParams = useSearchParams();
  const journey = searchParams.get("journey") ?? undefined;
  const applicant = searchParams.get("applicant") ?? undefined;
  const institution = searchParams.get("institution") ?? undefined;
  const program = searchParams.get("program") ?? undefined;
  const fiscalYear = searchParams.get("fiscal_year") ?? undefined;

  return useMemo(() => {
    const filters: Record<string, string> = {};
    if (journey) filters.journey = journey;
    if (applicant) filters.applicant = applicant;
    if (institution) filters.institution = institution;
    if (program) filters.program = program;
    if (fiscalYear) filters.fiscal_year = fiscalYear;
    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [journey, applicant, institution, program, fiscalYear]);
}

/**
 * Server-side pagination + filters over `GET /offers/` (newest-first, no text
 * search, no client ordering — §3). Create/edit are modal-based; a dedicated
 * `[id]` Offer Detail route is where issue / decide / condition controls live.
 * No authority-based control hiding — offers grants admin AND lead_manager
 * identical rights (§1), so every authorised user sees every control.
 */
function OffersWorklistContent() {
  const router = useRouter();
  const forceFilters = useDeepLinkFilters();

  const columns = getOffersColumns({
    onViewDetails: (offer) => router.push(`/admin/offers/${offer.id}`),
  });

  return (
    <ModalTableShell<Offer, OfferCreateValues, OfferUpdatePayload>
      queryKey={offerQueryKeys.lists()}
      queryGetFn={listOffers}
      enableServerQuery
      dataKey="data"
      paginationKey="meta"
      idAccessor="id"
      columns={columns}
      moduleInfo={{
        name: "offer",
        label: "Offers",
        description:
          "Every admission decision across all journeys, newest first",
      }}
      forceFilters={forceFilters}
      createModalTitle="New offer"
      editModalTitle="Edit offer"
      modalWidth={720}
      createFormComponent={OfferCreateForm}
      editFormComponent={OfferEditForm}
      onCreateApi={(values) => createOffer(toOfferCreatePayload(values))}
      onEditApi={(payload, record) => updateOffer(record.id, payload)}
      onEditTrigger={(record) => getOffer(record.id)}
      disableReviewButton
      getErrorMessage={getApiErrorMessage}
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
      basePath="/admin/offers"
      mainComponent={ModalPaper}
      mainComponentProps={{ withBorder: true }}
    />
  );
}

export function ModuleOffersWorklist() {
  return (
    <RequireLeadAccess>
      <OffersWorklistContent />
    </RequireLeadAccess>
  );
}
