# moduleApiCall — planned (not yet implemented)

> **Status: planned.** These typed per-resource CRUD/batch helpers are the Phase 3
> layer of the admin-framework plan and are **not implemented yet**. Do not import
> anything from this document — it describes the intended surface only.

The intent is a `createResourceApi<TRow, TCreate, TUpdate>({ basePath })` factory
built on the configured Axios instance from [apiDispatch.md](./apiDispatch.md),
returning typed `list` / `get` / `create` / `update` / `action(verb)` methods and
absorbing the `meta.count → total` remap that every module currently hand-rolls.

Until then, modules call the shared Axios instance (`import api from "@/lib/api"`)
directly inside their React Query functions.
