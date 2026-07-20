import { useQuery } from "@peppermint/ui";
import api from "@/lib/api";
import type { CurrentUser } from "./auth.types";

async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>("/api/v1/auth/me/");
  return data;
}

export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
    retry: false,
  });

  return {
    user: query.data ?? null,
    isStaff: Boolean(query.data?.is_staff || query.data?.is_superuser),
    isSuperuser: Boolean(query.data?.is_superuser),
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
