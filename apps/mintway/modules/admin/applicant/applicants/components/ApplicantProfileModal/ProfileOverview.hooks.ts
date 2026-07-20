"use client";

import { useQuery } from "@peppermint/ui";

import { interestProfileKeys } from "../../../_shared";
import { fetchCases } from "../../../cases/cases.api";
import { getInterestProfile } from "../../../interests/interest-profile/interestProfile.api";

/** A short read-only slice of the applicant's cases for the overview summary. */
export function useOverviewCases(applicantId: string) {
  return useQuery({
    // Distinct from the Cases tab's own list key so the paginated table cache and this
    // small summary never overwrite each other.
    queryKey: ["applicant.cases", "overview", applicantId],
    queryFn: () => fetchCases(applicantId),
    enabled: Boolean(applicantId),
  });
}

/**
 * The applicant's interest profile, used only for the overview chips. Admin-only (the
 * endpoint is a protected child); a missing profile resolves to `null`, not an error.
 */
export function useOverviewInterests(applicantId: string, isAdmin: boolean) {
  return useQuery({
    queryKey: interestProfileKeys.detail(applicantId),
    queryFn: () => getInterestProfile(applicantId),
    enabled: Boolean(applicantId) && isAdmin,
    retry: false,
  });
}
