import type { QueryParams } from "@peppermint/admin";
import { delay, paginate } from "../shared/mock.utils";
import { addCompetitor, deleteCompetitor, fetchCompetitors } from "./listening.api";
import type { CompetitorRow, CompetitorsFetchResponse } from "./competitors.types";

export async function fetchCompetitorsPaginated(
  params?: QueryParams,
): Promise<CompetitorsFetchResponse> {
  await delay();
  let items = (await fetchCompetitors()) as CompetitorRow[];

  const platform = params?.filters?.platform as string | undefined;
  if (platform) items = items.filter((c) => c.platform === platform);

  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter((c) => c.handle.toLowerCase().includes(q));
  }

  return paginate(items, params?.page ?? 1, params?.pageSize ?? 20);
}

export async function createCompetitor(values: Partial<CompetitorRow>): Promise<CompetitorRow> {
  const handle = values.handle ?? "";
  const platform = values.platform ?? "instagram";
  return (await addCompetitor(handle, platform)) as CompetitorRow;
}

export async function deleteCompetitorById(id: string): Promise<void> {
  return deleteCompetitor(id);
}
