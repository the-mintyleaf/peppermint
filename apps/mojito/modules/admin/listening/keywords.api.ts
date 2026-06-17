import type { QueryParams } from "@peppermint/admin";
import { delay, paginate } from "../shared/mock.utils";
import { addKeyword, deleteKeyword, fetchKeywords } from "./listening.api";
import type { KeywordRow, KeywordsFetchResponse } from "./keywords.types";

export async function fetchKeywordsPaginated(
  params?: QueryParams,
): Promise<KeywordsFetchResponse> {
  await delay();
  let items = (await fetchKeywords()) as KeywordRow[];

  const kind = params?.filters?.kind as KeywordRow["kind"] | undefined;
  if (kind) items = items.filter((k) => k.kind === kind);

  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter((k) => k.term.toLowerCase().includes(q));
  }

  return paginate(items, params?.page ?? 1, params?.pageSize ?? 20);
}

export async function createKeyword(values: Partial<KeywordRow>): Promise<KeywordRow> {
  const term = values.term ?? "";
  const kind = values.kind ?? "keyword";
  return (await addKeyword(term, kind)) as KeywordRow;
}

export async function updateKeyword(_id: string, _values: Partial<KeywordRow>): Promise<KeywordRow> {
  await delay();
  throw new Error("Keyword update not supported");
}

export async function deleteKeywordById(id: string): Promise<void> {
  return deleteKeyword(id);
}
