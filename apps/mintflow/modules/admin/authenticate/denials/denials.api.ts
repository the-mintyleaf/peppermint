import api from "@/lib/api";
import type {
  Denial,
  DenialCreatePayload,
  DenialsFetchResponse,
} from "./denials.types";

interface DenialsListResponse {
  data: Denial[];
  meta: { count: number };
}

// ModalTableShell runs in client-paginated mode here (no `enableServerQuery`),
// so this fetches one generous page and lets the shell page/sort/search it
// client-side rather than round-tripping the server on every interaction.
export async function fetchDenials(): Promise<DenialsFetchResponse> {
  const { data } = await api.get<DenialsListResponse>(
    "/api/v1/permissions/denials/",
    { params: { page_size: 200 } },
  );
  return { data: data.data, meta: { total: data.meta.count } };
}

export async function createDenial(
  values: DenialCreatePayload,
): Promise<Denial> {
  const { data } = await api.post<Denial>(
    "/api/v1/permissions/denials/",
    values,
  );
  return data;
}

export async function revokeDenial(id: string): Promise<Denial> {
  const { data } = await api.post<Denial>(
    `/api/v1/permissions/denials/${id}/revoke/`,
  );
  return data;
}
