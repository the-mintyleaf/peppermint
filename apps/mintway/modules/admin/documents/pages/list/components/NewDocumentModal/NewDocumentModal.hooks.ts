"use client";

import { useDebouncedValue, useQuery } from "@peppermint/ui";
import {
  applicantKeys,
  fetchApplicants,
} from "@/modules/admin/applicant/_shared";

/**
 * Debounced student lookup for the New Document picker. An empty search returns an
 * initial page of students (in the backend's default order) so the list isn't blank;
 * typing filters server-side via the shared `search` param. `enabled` gates the
 * request to the open modal so it doesn't fetch in the background.
 */
export function useStudentSearch(search: string, enabled: boolean) {
  const [debounced] = useDebouncedValue(search.trim(), 250);

  const query = useQuery({
    queryKey: applicantKeys.list({ scope: "new-document", search: debounced }),
    queryFn: () =>
      fetchApplicants({
        page: 1,
        pageSize: 24,
        search: debounced,
        sort: [],
        filters: {},
      }),
    enabled,
  });

  return {
    students: query.data?.data ?? [],
    // Surface the debounce gap as loading so results never look stale mid-type.
    isLoading: query.isLoading || search.trim() !== debounced,
    isError: query.isError,
    refetch: query.refetch,
  };
}
