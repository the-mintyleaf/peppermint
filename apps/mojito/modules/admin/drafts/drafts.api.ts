import type { QueryParams } from "@peppermint/admin";
import { fetchContentItems } from "../content/content.api";
import type { DraftsFetchResponse } from "./drafts.types";

export async function fetchDrafts(params?: QueryParams): Promise<DraftsFetchResponse> {
  const result = await fetchContentItems({
    status: "draft",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 20,
    search: params?.search,
  });
  return {
    data: result.data as DraftsFetchResponse["data"],
    meta: result.meta,
  };
}
