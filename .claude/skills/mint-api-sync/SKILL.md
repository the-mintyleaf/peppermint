---
name: mint-api-sync
description: >
  Ingests backend docs from docs/backend/<domain>/ (API.md, DATA_CONTRACT.md,
  INTEGRATION.md, SECURITY.md) and produces the frontend-facing contract digest
  plus the typed API layer for Peppermint modules. Re-running performs a drift
  check against the backend Change History instead of blindly overwriting. Use
  whenever backend docs arrive or change, or before building a module whose
  domain has backend docs.
---

# Backend API Contract Sync

Turns backend documentation into two frontend artifacts:

1. **Contract digest** — `apps/<app>/docs/api-contracts/<domain>.md`, the single
   file module builders read instead of the raw backend docs.
2. **Typed API layer** — `.types.ts` / `.queryKeys.ts` / `.api.ts` inside the
   target module, following the repo's existing conventions.

Never guess a field, endpoint, or shape. Everything in the digest traces back to
a line in the backend docs; everything the backend docs don't answer goes in the
digest's **Gaps** section and gets asked, not invented (STANDARDS.md → API
contract standards).

---

## 1. Intake location (canonical)

Backend docs live at:

```txt
docs/backend/<domain>/
├── API.md            # endpoints, methods, params, policy keys, envelopes
├── DATA_CONTRACT.md  # models, field tables, validation rules, deviations
├── INTEGRATION.md    # frontend-facing conventions, DTO summaries, dependency order
└── SECURITY.md       # auth, permission model, throttles
```

When the user hands over new backend docs, put them here — never in `.todo/`
(task-scoped, gets deleted) and never inside a module folder. One folder per
backend domain/app (`events`, `organization`, `authenticate`, …).

## 2. Read order

1. `INTEGRATION.md` — the frontend-facing summary; conventions and DTO shapes.
2. `API.md` — endpoint-by-endpoint detail, policy keys, envelopes.
3. `DATA_CONTRACT.md` — authoritative field tables (types, required, nullable,
   generated) and validation rules.
4. `SECURITY.md` — auth expectations, permission-denied behavior.
5. The **Change History** table in API.md/DATA_CONTRACT.md — record the highest
   version; the digest pins to it.

## 3. Produce the contract digest

Write `apps/<app>/docs/api-contracts/<domain>.md`:

```markdown
# API Contract — <Domain>

> Synced from: docs/backend/<domain>/ · backend version <X.Y.Z> · synced <YYYY-MM-DD>
> Re-sync with /sync-api when the backend Change History moves past this version.

## Envelopes

Success: `{ success: true, message, data, meta }`
Error: `{ success: false, error: { code, message, details }, meta: {} }`

## Endpoints

| Endpoint | Method | Policy key | Params | Returns |
| -------- | ------ | ---------- | ------ | ------- |

## DTO types

One fenced TypeScript block per model, field-for-field from DATA_CONTRACT.md.
Nullable → `| null`; optional-in-response → `?`; UUID/datetime → `string`.
Do not add fields the backend doesn't document.

## Pagination & filtering

Query params, page/page_size, fixed orderings, filterable fields.

## Error codes

Documented `error.code` values and the UI state each maps to
(401 → login redirect, 403 → permission-denied state, 404 → not-found, …).

## Gaps & assumptions

Anything the backend docs don't answer. Each entry: what's missing, the
assumption made (if any), and where the assumption lives in code.
```

Keep it skimmable and path-light — this file is what builders read, so it must
be shorter than the backend docs, not a copy of them.

## 4. Generate the typed API layer

Only when a target module exists or is being built (digest-only sync is valid).
Follow the existing module convention (reference:
`apps/mintflow/modules/admin/organization/event-log/`):

```txt
<module>/
├── <camelName>.types.ts      # DTOs from the digest; shared domain types go in ../_shared/
├── <camelName>.queryKeys.ts  # query keys next to their query functions
└── <camelName>.api.ts        # fetch functions: import api from "@/lib/api", typed params + returns
```

Rules:

- `import api from "@/lib/api"` — never `@peppermint/api-client`, never inline Axios.
- Map envelope → UI shape at this layer (e.g. `meta.count` → `total`), so
  components never depend on the raw backend envelope.
- Type every function's params and return. No `any`.
- Read-only domains (like `events`) get no mutation functions — do not scaffold
  create/update/delete "for completeness."
- Fields the docs mark generated/server-owned never appear in request payload types.

## 5. Drift check (on re-run)

If the digest already exists:

1. Compare its pinned `backend version` against the backend docs' Change History.
2. Same version → report "in sync", stop. Do not rewrite the file (preserves
   hand-added notes in Gaps).
3. Newer backend version → diff endpoint tables and field tables, then report
   per item: **added** (new field/endpoint), **removed**, **changed** (type,
   nullability, param). Apply the updates to digest + types, list every change
   in the final report, and bump the pinned version.
4. If existing module code contradicts the backend docs at the _same_ version,
   that is a frontend bug — report it, don't silently "fix" the contract.

## 6. Report

End with: digest path, backend version pinned, files written/updated, drift
findings (or "initial sync"), and the Gaps list verbatim — gaps are questions
for the user, so surface them.
