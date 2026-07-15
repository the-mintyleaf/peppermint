"use client";

import { useQuery } from "@peppermint/ui";

import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { getApplicant } from "./applicant.api";
import { applicantKeys } from "./applicantQueryKeys";
import type { Applicant } from "./applicant.types";

/**
 * Fetch + cache one applicant (role-projected) and derive the flags every detail
 * section needs: the current `record_version` for optimistic-concurrency writes, lock/
 * archive state, and the signed-in role. Never decode identity from the token — role
 * comes from `useCurrentUser` (`/me`).
 */
export function useApplicant(applicantId: string) {
  const { isAdmin, isSuperadmin, role } = useCurrentUser();

  const query = useQuery({
    queryKey: applicantKeys.detail(applicantId),
    queryFn: () => getApplicant(applicantId),
    enabled: Boolean(applicantId),
    retry: false,
  });

  const applicant: Applicant | null = query.data ?? null;

  return {
    applicant,
    recordVersion: applicant?.record_version,
    isLocked: applicant?.is_locked ?? false,
    isArchived: Boolean(applicant?.archived_at),
    isMerged: Boolean(applicant?.merged_into),
    role,
    isAdmin,
    isSuperadmin,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
