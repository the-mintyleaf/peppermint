import { createResourceApi } from "@peppermint/admin";
import type { QueryParams, ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  Campus,
  CampusCreatePayload,
  CampusUpdatePayload,
  Country,
  CountryCreatePayload,
  CountryUpdatePayload,
  Field,
  FieldCreatePayload,
  FieldUpdatePayload,
  Institution,
  InstitutionCreatePayload,
  InstitutionUpdatePayload,
  Program,
  ProgramCreatePayload,
  ProgramDetail,
  ProgramUpdatePayload,
} from "./institutions.types";

const CATALOGUE = "/api/v1/catalogue";

/**
 * The catalogue searches on `q` (not the DRF-default `search`) and has no
 * client-controllable ordering — sending `ordering` would 400 ("invalid query
 * params are rejected, not ignored", §3). Filter keys pass straight through
 * (column-filter accessors already match the server param names).
 */
function toCatalogueParams(params: QueryParams): Record<string, unknown> {
  return {
    ...params.filters,
    page: params.page,
    page_size: params.pageSize,
    ...(params.search ? { q: params.search } : {}),
  };
}

// ── Fields ────────────────────────────────────────────────────────────────────

const fieldResource = createResourceApi<
  Field,
  FieldCreatePayload,
  FieldUpdatePayload
>({
  client: api,
  basePath: `${CATALOGUE}/fields`,
  toServerParams: toCatalogueParams,
});

export const fetchFields = fieldResource.list;
export const createField = fieldResource.create;
export const updateField = (id: string, body: FieldUpdatePayload) =>
  fieldResource.update(id, body);

// ── Countries ───────────────────────────────────────────────────────────────

const countryResource = createResourceApi<
  Country,
  CountryCreatePayload,
  CountryUpdatePayload
>({
  client: api,
  basePath: `${CATALOGUE}/countries`,
  toServerParams: toCatalogueParams,
});

export const fetchCountries = countryResource.list;
export const createCountry = countryResource.create;
export const updateCountry = (id: string, body: CountryUpdatePayload) =>
  countryResource.update(id, body);

// ── Institutions ──────────────────────────────────────────────────────────────

const institutionResource = createResourceApi<
  Institution,
  InstitutionCreatePayload,
  InstitutionUpdatePayload
>({
  client: api,
  basePath: `${CATALOGUE}/institutions`,
  toServerParams: toCatalogueParams,
});

export const fetchInstitutions = institutionResource.list;
export const getInstitution = institutionResource.get;
export const createInstitution = institutionResource.create;
export const updateInstitution = (id: string, body: InstitutionUpdatePayload) =>
  institutionResource.update(id, body);

// ── Programs ──────────────────────────────────────────────────────────────────
//
// `usable_only` defaults true here (chain-aware) and is supplied by the caller via
// `forceFilters`. The Tuition column filter key `tuition_amount` is renamed to the
// server's `tuition_max` param; everything else passes through.

function toProgramParams(params: QueryParams): Record<string, unknown> {
  const { tuition_amount, ...rest } = params.filters ?? {};
  return {
    ...rest,
    ...(tuition_amount != null && tuition_amount !== ""
      ? { tuition_max: tuition_amount }
      : {}),
    page: params.page,
    page_size: params.pageSize,
    ...(params.search ? { q: params.search } : {}),
  };
}

const programResource = createResourceApi<
  ProgramDetail,
  ProgramCreatePayload,
  ProgramUpdatePayload
>({
  client: api,
  basePath: `${CATALOGUE}/programs`,
  toServerParams: toProgramParams,
});

/** `GET /programs/` — list-row shape (detail fields absent). */
export const fetchPrograms = (params?: QueryParams) =>
  programResource.list(params) as Promise<ResourceListResponse<Program>>;
/** `GET /programs/<id>/` — the only source of entry expectations. */
export const getProgram = programResource.get;
export const createProgram = programResource.create;
export const updateProgram = (id: string, body: ProgramUpdatePayload) =>
  programResource.update(id, body);

// ── Campuses ──────────────────────────────────────────────────────────────────
//
// List/create are NESTED under an institution; retrieve/update are UN-NESTED by
// campus id. Two shapes, so the nested pair is hand-rolled while the un-nested pair
// reuses `createResourceApi` (get/update only).

const campusResource = createResourceApi<
  Campus,
  CampusCreatePayload,
  CampusUpdatePayload
>({ client: api, basePath: `${CATALOGUE}/campuses` });

/** `GET /campuses/<id>/` — un-nested retrieve. */
export const getCampus = campusResource.get;
/** `PATCH /campuses/<id>/` — un-nested; `(institution, name)` unique on rename too. */
export const updateCampus = (id: string, body: CampusUpdatePayload) =>
  campusResource.update(id, body);

/** `GET /institutions/<id>/campuses/` — nested list; unknown institution → 404. */
export async function fetchInstitutionCampuses(
  institutionId: string,
): Promise<ResourceListResponse<Campus>> {
  const { data } = await api.get<{
    data: Campus[];
    meta: { count: number } & Record<string, unknown>;
  }>(`${CATALOGUE}/institutions/${institutionId}/campuses/`, {
    params: { page: 1, page_size: 100 },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

/** `POST /institutions/<id>/campuses/` — institution from the URL, never the body. */
export async function createInstitutionCampus(
  institutionId: string,
  body: CampusCreatePayload,
): Promise<Campus> {
  const { data } = await api.post<Campus>(
    `${CATALOGUE}/institutions/${institutionId}/campuses/`,
    body,
  );
  return data;
}
