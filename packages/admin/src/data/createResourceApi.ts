import type { QueryParams } from "../wrappers/DataTableWrapper";

// A typed CRUD/action factory over a REST resource. Absorbs the ~8 identical
// paginated-fetch clones and the ~17 `meta.count → total` remaps modules hand-wrote,
// plus the `POST /:id/<verb>/` action template. The app injects its configured HTTP
// client (the Axios instance from `lib/api.ts`), so this stays framework-side.

/** Minimal HTTP surface — the app's Axios instance satisfies it structurally. */
export interface ResourceHttpClient {
  get<T>(
    url: string,
    config?: { params?: Record<string, unknown> },
  ): Promise<{ data: T }>;
  post<T>(url: string, body?: unknown): Promise<{ data: T }>;
  patch<T>(url: string, body?: unknown): Promise<{ data: T }>;
  delete<T>(
    url: string,
    config?: { params?: Record<string, unknown> },
  ): Promise<{ data: T }>;
}

/** Normalized list response the DataTable shells consume (`meta.total`). */
export interface ResourceListResponse<TRow> {
  data: TRow[];
  meta: { total: number } & Record<string, unknown>;
}

export interface CreateResourceApiConfig<TRow> {
  client: ResourceHttpClient;
  /** Resource base path, e.g. "/api/v1/permissions/grants" (trailing slash optional). */
  basePath: string;
  /** Static params merged into every list request (e.g. `{ page_size: 200 }` for client mode). */
  defaultParams?: Record<string, unknown>;
  /** Translate the shell's QueryParams to server params. Defaults to the Peppermint convention. */
  toServerParams?: (params: QueryParams) => Record<string, unknown>;
  /** Map the raw list body to `{ data, meta: { total } }`. Defaults to reading `meta.count`. */
  toListResponse?: (raw: unknown) => ResourceListResponse<TRow>;
}

export interface ResourceApi<TRow, TCreate, TUpdate> {
  list: (params?: QueryParams) => Promise<ResourceListResponse<TRow>>;
  get: (id: string | number) => Promise<TRow>;
  create: (body: TCreate) => Promise<TRow>;
  update: (id: string | number, body: TUpdate) => Promise<TRow>;
  remove: (id: string | number) => Promise<void>;
  /** POST /:id/<verb>/ — the revoke/deprecate/deactivate template. */
  action: <TResult = TRow>(
    id: string | number,
    verb: string,
    body?: unknown,
  ) => Promise<TResult>;
}

/** Sort array → DRF-style `ordering` string, e.g. `[{field:"name",direction:"desc"}]` → "-name". */
function defaultToServerParams(params: QueryParams): Record<string, unknown> {
  const ordering = params.sort
    .map((s) => (s.direction === "desc" ? `-${s.field}` : s.field))
    .join(",");
  return {
    // Filters first so a filter key can never clobber the reserved pagination/sort
    // params below.
    ...params.filters,
    page: params.page,
    page_size: params.pageSize,
    ...(params.search ? { search: params.search } : {}),
    ...(ordering ? { ordering } : {}),
  };
}

/**
 * Default: `{ data, meta: { count } }` → `{ data, meta: { total: count, ...meta } }`.
 * Assumes the Peppermint list envelope; a resource that deviates should pass its own
 * `toListResponse`. When `meta.count` is absent (a contract mismatch) `total` is 0
 * rather than a fabricated page-length that would silently mis-paginate.
 */
function defaultToListResponse<TRow>(raw: unknown): ResourceListResponse<TRow> {
  const body = (raw ?? {}) as {
    data?: TRow[];
    meta?: { count?: number } & Record<string, unknown>;
  };
  const rows = Array.isArray(body.data) ? body.data : [];
  const meta = body.meta ?? {};
  const total = typeof meta.count === "number" ? meta.count : 0;
  return { data: rows, meta: { ...meta, total } };
}

export function createResourceApi<
  TRow,
  TCreate = Partial<TRow>,
  TUpdate = Partial<TCreate>,
>(config: CreateResourceApiConfig<TRow>): ResourceApi<TRow, TCreate, TUpdate> {
  const {
    client,
    defaultParams,
    toServerParams = defaultToServerParams,
    toListResponse = defaultToListResponse,
  } = config;
  const path = config.basePath.replace(/\/$/, "");

  return {
    list: async (params) => {
      const serverParams = {
        ...defaultParams,
        ...(params ? toServerParams(params) : {}),
      };
      const { data } = await client.get<unknown>(`${path}/`, {
        params: serverParams,
      });
      return toListResponse(data);
    },
    get: async (id) => {
      const { data } = await client.get<TRow>(`${path}/${id}/`);
      return data;
    },
    create: async (body) => {
      const { data } = await client.post<TRow>(`${path}/`, body);
      return data;
    },
    update: async (id, body) => {
      const { data } = await client.patch<TRow>(`${path}/${id}/`, body);
      return data;
    },
    remove: async (id) => {
      await client.delete<void>(`${path}/${id}/`);
    },
    action: async <TResult = TRow>(
      id: string | number,
      verb: string,
      body?: unknown,
    ) => {
      const { data } = await client.post<TResult>(
        `${path}/${id}/${verb}/`,
        body ?? {},
      );
      return data;
    },
  };
}
