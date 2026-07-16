import api from "@/lib/api";
import type {
  Grant,
  GrantCreatePayload,
  GrantsFetchResponse,
} from "./grants.types";

interface GrantsListResponse {
  data: Grant[];
  meta: { count: number };
}

// ModalTableShell runs in client-paginated mode here (no `enableServerQuery`),
// so this fetches one generous page and lets the shell page/sort/search it
// client-side rather than round-tripping the server on every interaction.
export async function fetchGrants(): Promise<GrantsFetchResponse> {
  const { data } = await api.get<GrantsListResponse>(
    "/api/v1/permissions/grants/",
    { params: { page_size: 200 } },
  );
  return { data: data.data, meta: { total: data.meta.count } };
}

export async function fetchGrantsForSubject(
  subjectUserId: string,
): Promise<Grant[]> {
  const { data } = await api.get<GrantsListResponse>(
    "/api/v1/permissions/grants/",
    { params: { subject_user_id: subjectUserId, page_size: 200 } },
  );
  return data.data;
}

export async function createGrant(values: GrantCreatePayload): Promise<Grant> {
  const { data } = await api.post<Grant>("/api/v1/permissions/grants/", values);
  return data;
}

export async function revokeGrant(id: string): Promise<Grant> {
  const { data } = await api.post<Grant>(
    `/api/v1/permissions/grants/${id}/revoke/`,
  );
  return data;
}
