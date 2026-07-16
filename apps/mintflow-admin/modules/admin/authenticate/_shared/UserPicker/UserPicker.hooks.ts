import { useQuery, useDebouncedValue } from "@peppermint/ui";
import api from "@/lib/api";
import type { CurrentUser } from "../authenticate.types";

interface UsersSearchResponse {
  data: CurrentUser[];
  meta: { count: number };
}

async function searchUsers(search: string): Promise<CurrentUser[]> {
  const { data } = await api.get<UsersSearchResponse>("/api/v1/auth/users/", {
    params: search ? { search } : undefined,
  });
  return data.data;
}

export function useUserSearch(search: string) {
  const [debounced] = useDebouncedValue(search, 300);

  return useQuery({
    queryKey: ["auth", "users", "search", debounced],
    queryFn: () => searchUsers(debounced),
    staleTime: 30_000,
  });
}
