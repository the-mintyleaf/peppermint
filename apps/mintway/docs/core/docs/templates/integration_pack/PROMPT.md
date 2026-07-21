<!-- This is the canonical generator/authoring prompt for an app's Frontend
     Integration Pack — the `<app>/docs/integration/` folder. It replaces the
     retired `INTEGRATION_TEMPLATE.md`. To (re)generate or update a pack:
     1. Copy the skeletons in this directory into `<app>/docs/integration/`
        (README/overview/enums/flows/gaps + entities/_TEMPLATE.md), then fill
        them from the app's current `docs/API.md` + `docs/DATA_CONTRACT.md` +
        `docs/SECURITY.md` (+ `constants.py` for enum/error truth).
     2. Match `example/` (a frozen applicant-domain snapshot) for caliber and
        shape — it is the gold standard, not live docs; never edit it.
     Delete this HTML comment only in a working copy — never write it into a
     generated pack. -->

# Frontend Integration Pack — Authoring Prompt (v1)

> **STRICT CONTRACT — do not deviate.** The `<app>/docs/integration/` pack is a
> **binding, frontend-facing contract.** The frontend wires its types, queries,
> mutations, forms, and error states directly from this pack and **pins to
> `overview.md`'s pack version**. Getting the shape wrong breaks integration.
> Therefore the pack **must** reproduce the gold-standard shape **exactly** —
> the six-file layout, the per-entity **header block + seven numbered sections
> in order**, and every table's **column set** — with **nothing added, omitted,
> renamed, or reordered.** A section that does not apply keeps its heading and
> says `None.` (never dropped). Every `§3` TypeScript block **must compile**.
> Enums live **only** in `enums.md`. Anything the source does not answer goes to
> `gaps.md` as a question — **never invent a field, type, default, or error.**
> **Every change bumps `overview.md`'s pack version and adds a change-history
> row.** The `.claude/hooks/check_integration_freshness.sh` hook (CLAUDE.md §35
> item 16) is the mechanical backstop for a forgotten regeneration — it is not a
> licence to hand-wave the content.

---

## Objective

Produce a **Frontend Integration Pack** for one backend app: the single set of
docs the frontend reads to integrate it. A frontend developer must be able to
wire up types, queries, mutations, forms, and error states **from this pack
alone** — never needing to open `API.md`, `DATA_CONTRACT.md`, or `SECURITY.md`.

This is a **re-projection**, not new information. You already write those build
docs. The pack reorganizes the frontend-relevant slice of them into a
self-contained, per-entity shape — and closes the gap where field truth
(`DATA_CONTRACT`, by model) sits apart from endpoints (`API.md`, by operation),
so a reader always sees both together.

## Audience & lens

Write for a **frontend developer wiring React Query + typed DTOs + forms.** They
need:

- **Include:** each entity's fields (with TS-oriented types, required/nullable,
  which are server-set), the request/response shape of every endpoint, query
  params, validations & business rules, the exact error codes and what UI state
  each maps to, role-based field projections, and multi-entity flows.
- **Exclude (build-phase noise):** table names, migration numbers, index
  strategy, soft-delete storage mechanics, ORM/serializer class names, internal
  counters, deployment/throttle internals — **unless** a detail changes a request
  or response the frontend sees. When in doubt, ask: "does this change what the
  client sends or receives?" If no, leave it out.

## Required structure — always a folder

Every app's pack is the folder `<app>/docs/integration/`, mirroring `example/`
exactly:

```
<app>/docs/integration/
├── README.md          # what the pack is, read order, index
├── overview.md        # pack version + change history; purpose; base paths; auth;
│                      #   response envelope; pagination; IDs/dates/money
│                      #   conventions; role model; concurrency; dependency order
├── enums.md           # every enum value, one place, with UI-label hints
├── entities/
│   ├── _TEMPLATE.md   # keep the blank template in the pack for future entities
│   └── <entity>.md    # ONE per resource — header + seven sections (below)
├── flows.md           # end-to-end sequences that span entities
└── gaps.md            # what the docs do NOT answer (questions, not guesses)
```

> **Project rule — no single-file collapse for app packs.** The frontend expects
> the _same folder shape for every app_, regardless of entity count. Always emit
> the folder above. (The original frontend prompt's "≤3 entities → collapse to a
> single `INTEGRATION.md`" scaling rule applies **only** to the `/iterations/`
> per-session log — CLAUDE.md §19.4 — never to an app pack.)

## The per-entity block (the core unit — do not deviate)

Every `entities/<entity>.md` is **self-contained**: an unnumbered **Header block**
followed by **seven numbered sections**, in order. If a section doesn't apply,
keep the heading and write `None.` — never drop it. (`entities/_TEMPLATE.md` is
the copy-me skeleton; `ENTITY_TEMPLATE.md` here is the same file.)

- **Header block** (unnumbered) — `# <Entity> — <one-line purpose>`, endpoint
  base, access summary (who reads/writes; note role projection or non-disclosing
  404), what it owns.

1. **Fields (rows)** — a table with columns:
   `Field | TS type | In req | In res | Req | Nullable | Server-set | Enum | Validation | Notes`.
   - `TS type` is frontend-facing: `string`, `number`, `boolean`, `string | null`,
     an enum name from `enums.md`, `Record<string, unknown>`, `File`.
   - `Server-set` = generated/computed → **the frontend must never send it.**
   - `Validation` carries the **hard constraint** (max length, regex, numeric
     range, format) — fill it from the source; if the source states no
     constraint, leave it blank rather than invent one.
   - **Nullability is exact.** `Nullable=Yes` (DB null) → `T | null`. An optional
     text/enum field marked `Nullable=No` (Django `blank=True`, not null)
     serializes as an **empty string `""`**, so type it `T`, not `T | null` (see
     the empty-string convention in `overview.md`).
   - If responses are **role-projected**, mark the projection each field belongs
     to (e.g. an "admin-only" band) or list the restricted subset explicitly.
2. **Types** — paste-ready TypeScript: the response DTO (one interface **per role
   projection** if they differ, including a separate **list-row** interface when
   the list projection is narrower than the detail one), enum unions (or a
   reference to `enums.md`), and the request payload types (`<Entity>Create` /
   `<Entity>Update`) with **server-set fields already omitted**. `Update`
   includes `record_version` when the entity uses optimistic concurrency. The
   block must be valid TS that compiles as-is.
3. **Endpoints** — per operation: method + path, request (accepted field subset /
   query params / multipart; call out `record_version` where required), **a
   `Returns:` line on every operation** (which projection / list / streamed
   bytes), side effects, policy key.
4. **Validations & business rules** — cross-field and business rules in plain
   language (single-field constraints already live in the §1 `Validation` column).
5. **Errors** — a table: `Code | HTTP | Trigger | Suggested UI handling`. List
   **every** error the endpoint can return with a machine `code`.
6. **Examples** — concrete wire payloads: at minimum one create **request** body
   and its unwrapped **response** `data`, plus any non-obvious shape (a `*_bs`
   date object, a `meta.possible_duplicate`/`matches` block, polymorphic content).
   Only show an `error.details` body if its shape is actually documented; if it
   is a gap, don't invent one.
7. **UI / integration notes** — concurrency (`record_version`), role-projection
   field deltas, `*_bs` date siblings, server-computed values not to send,
   media/streaming endpoints, and which response/error maps to which UI state.

## Pattern catalogue — recurring entity shapes (reproduce, don't reinvent)

The `example/` entities already demonstrate every shape below. When an entity
matches one, represent it the same way — do not invent a new convention.

- **Multi-base-path header** — list/create nested under a parent, detail + actions
  top-level. State both on the header's `Endpoint base:` line. _(see
  `example/entities/document.md`)_
- **Sub-resources with their own file** — a child that hangs off a parent path but
  is rich enough to warrant its own entity file; reference it from the parent's
  §3 rather than inlining it. _(`document` → `document-revision`,
  `document-print-event`)_
- **`File` / multipart fields** — TS type `File`, `In res ✗` (never echoed), and a
  §7 note "build the `FormData` at the api layer". **Private-media byte-streaming**
  read endpoints (return raw bytes `inline`, not JSON) get their own operation +
  policy key. _(`signature.signature_image` / `.../image/`, print `artifact`)_
- **Three DELETE semantics** — be explicit in the header + §4 which applies:
  **deactivate-not-delete** (`signature`), **hard delete** (`address`),
  **soft-archive** (`document`).
- **Append-only / supersede** — no update/delete; a bare **405** row in the §5
  error table (with a `—` code) for attempted `PATCH`/`DELETE`; a create retires
  the prior current record. _(`qualification-assessment`)_
- **Fully read-only, server-authored** — every field `Server-set`, **no
  Create/Update type**, and a cross-entity `import type { … } from "./<other>"`
  in the §2 block when it reuses another entity's enum. _(`document-revision`)_
- **Create-by-number / read-by-id asymmetry** — a link sent one way on create and
  returned another way on read; call it out in §7. _(`print-event`:
  `revision_number` in → `document_revision` id out)_
- **Table conventions** — superscript footnotes for conditional cells (`✗¹` with
  the note below the table); an inline unknown row like `<*_summary> (×6)` when a
  set of fields exists but the source doesn't name them, **mirrored into
  `gaps.md`**; show a **full response envelope** in a §6 example only when the
  `error`/`meta` shape itself is the point (otherwise show unwrapped `data`).

## Filled mini-example (shape reference)

```markdown
# `Widget` — a thing an account owns

**Endpoint base:** `/api/v1/widgets/`
**Access:** admin only (staff → 403).
**Owns:** one widget belonging to an account.

## 1. Fields (rows)

| Field  | TS type      | In req | In res | Req | Nullable | Server-set | Enum          | Validation  | Notes       |
| ------ | ------------ | ------ | ------ | --- | -------- | ---------- | ------------- | ----------- | ----------- |
| id     | string       | ✗      | ✓      | —   | No       | ✓          | —             | UUID        | Primary key |
| name   | string       | ✓      | ✓      | ✓   | No       | ✗          | —             | ≤120 chars  |             |
| status | WidgetStatus | ✗      | ✓      | —   | No       | ✓          | widget_status | action-only | Default new |

## 2. Types

type WidgetStatus = "new" | "active" | "retired"; // see enums.md

interface Widget { id: string; name: string; status: WidgetStatus; }
interface WidgetCreate { name: string; } // server-set fields omitted

## 3. Endpoints

### `POST /api/v1/widgets/`

- **Request:** { name }
- **Returns:** Widget (201)
- **Policy key:** account.widget.create

## 4. Validations & business rules

- `name` unique per account.

## 5. Errors

| Code              | HTTP | Trigger        | Suggested UI handling |
| ----------------- | ---- | -------------- | --------------------- |
| WIDGET_NAME_TAKEN | 409  | duplicate name | field error on `name` |

## 6. Examples

// POST /api/v1/widgets/ — request
{ "name": "Alpha" }
// 201 — response.data
{ "id": "…", "name": "Alpha", "status": "new" }

## 7. UI / integration notes

- Server-computed (never send): `id`, `status`.
```

## Authoring rules

- **Trace or gap.** Every field, endpoint, and error must trace to something real
  in the source (a serializer field, a route, an error constant). Anything the
  source doesn't answer goes in `gaps.md` as a question — **never invent.**
- **Types are frontend-facing.** UUIDs and datetimes are `string`. Nullable →
  `| null`. Decimal/money fields are **`string`**, not `number` (avoid float
  drift).
- **The §3 TS block must compile.** It is copy-pasted verbatim into the app —
  valid TypeScript, one interface per role projection, `Create`/`Update` payloads
  with server-set fields omitted, no stray prose inside the block.
- **Constraints are real, or blank.** Put actual max lengths / regex / ranges in
  the §1 `Validation` column from the source model; never a guessed bound.
- **Examples are unwrapped `data`.** §6 examples show the resource shape (the
  `data` payload), not the full envelope, unless the point is a `meta`/`error`
  shape — then show that block explicitly.
- **Envelope + pagination once.** Document the success/error envelope and the
  pagination `meta` shape in `overview.md`; entity files assume it.
- **Enums centralized.** Every enum value lives in `enums.md` (wire value +
  suggested UI label). Entity tables reference the set by name; don't re-list
  values inline.
- **Mark server-set fields** so the frontend's request types exclude generated /
  computed / transition-only fields.
- **Call out concurrency & projections.** If an entity has `record_version`, say
  so and mark it required on PATCH/DELETE/transition. If responses differ by
  role, describe the deltas explicitly (fields are _absent_, not null).
- **Errors carry a UI column.** Each error code names the UI reaction (field
  error, toast + reload, read-only switch, not-found, login redirect).
- **Switch on `code`, not `message`.** State that clearly; messages are copy.

## Versioning (keep the frontend drift-check working)

`overview.md` starts with a **pack version** and a **change-history table** that
mirrors the app's build-doc history. The frontend pins to this version and
re-syncs when it moves — so **bump it on every change** and add a one-line
history row describing what changed (added/removed/changed fields, endpoints,
errors).

## Definition of done

- [ ] The pack is **self-contained** — no dangling "see DATA_CONTRACT §…" /
      "see API.md §…" references a frontend dev would have to chase.
- [ ] The folder has all six parts (`README`, `overview`, `enums`, `entities/`,
      `flows`, `gaps`) and `entities/_TEMPLATE.md` is present.
- [ ] **Every entity** file has all **seven** sections, in order.
- [ ] Every field row marks **Req / Nullable / Server-set**, a TS type, and a real
      constraint in `Validation` (or a justified blank).
- [ ] Every entity has a **§2 TS block** that compiles (DTO per projection +
      `Create`/`Update` payloads with server-set fields omitted).
- [ ] Every entity has **§6 examples** — at least a create request + response, plus
      any non-obvious `meta`/`error`/`*_bs`/polymorphic shape.
- [ ] **All enums** are in `enums.md`; entity tables reference them by name.
- [ ] **Every endpoint** lists its request shape, return, and policy key.
- [ ] **Every error code** appears in an entity's error table with a UI-handling
      note.
- [ ] Role projections and `record_version` requirements are stated where they
      apply.
- [ ] `overview.md` carries the **bumped** pack version + change-history row.
- [ ] Unknowns are in **`gaps.md`**, not invented.
