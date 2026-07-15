import { useQuery } from "@peppermint/ui";
import api from "@/lib/api";
import type { CurrentUser, Role } from "./authenticate.types";

async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>("/api/v1/auth/me/");
  return data;
}

/**
 * The signed-in user via `GET /api/v1/auth/me/`. Identity is always read from the
 * server (never decoded from the client-held JWT). Role gates derive from the
 * singular grandway `role`.
 */
export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
    retry: false,
  });

  const role: Role | null = query.data?.role ?? null;

  return {
    user: query.data ?? null,
    role,
    isAdmin: role === "admin" || role === "superadmin",
    isSuperadmin: role === "superadmin",
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
