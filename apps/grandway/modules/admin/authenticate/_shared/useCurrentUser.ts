import { useQuery } from "@peppermint/ui";
import api from "@/lib/api";
import type { AuthorityType, User } from "./authenticate.types";

async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/api/v1/auth/me/");
  return data;
}

/**
 * The signed-in account via `GET /api/v1/auth/me/`. Identity is always read from the
 * server (never decoded from the client-held JWT — `authenticate/docs/INTEGRATION.md`
 * §3). Role gates derive from `authority_type`.
 */
export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
    retry: false,
  });

  const authorityType: AuthorityType | null =
    query.data?.authority_type ?? null;

  return {
    user: query.data ?? null,
    authorityType,
    isAdmin: authorityType === "admin" || authorityType === "superadmin",
    isSuperadmin: authorityType === "superadmin",
    isLeadManager: authorityType === "lead_manager",
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
