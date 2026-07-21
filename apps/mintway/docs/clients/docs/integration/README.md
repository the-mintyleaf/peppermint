# Integration Pack — `clients`

> The **single source the frontend reads to integrate this module.** Everything
> needed to wire up types, queries, mutations, forms, and error states lives in
> here — you should never need to open the backend's build docs (`API.md`,
> `DATA_CONTRACT.md`, `SECURITY.md`) to integrate.

The `clients` module is the standalone directory of external organizations the
company deals with (companies, schools, banks, government offices, NGOs, vendors,
embassies, referral/training partners). The `Client` aggregate root (with an
immutable audit trail behind it) now carries its Phase-2 children — **contacts,
addresses, aliases, tags, and a logo** — each with its own nested endpoints;
contacts/addresses/aliases/tags embed read-only on the client, and the logo
surfaces as authenticated `logo_url` / `logo_thumbnail_url` on it. **Phase 3**
adds ranked (trigram-accelerated) search, **non-blocking duplicate warnings** on
create/update (masked matches in `meta`, proceed via `override_reason`), a
preflight `POST /clients/duplicate-check/`, and a reduced `GET /clients/lookup/`
for dropdowns / document-prefill. **Phase 4** adds a **document-prefill packet**
(`GET /clients/{id}/document-prefill/`, staff+ — a read-time snapshot the consumer
must copy into a document, so a later client edit never mutates an issued one) and
an **admin-only audit-trail read** (`GET /clients/{id}/audit-events/`, paginated,
newest first). **Phase 5** (the final phase — concept §24 is now complete) adds
operational tooling: **merge** two clients (`POST /clients/{id}/merge/`, admin+ —
the duplicate is retained + archived pointing at the survivor) with an admin
**merge-history** read, plus **bulk CSV export** (`GET /clients/export/`, staff+)
and **import** (`POST /clients/import/`, admin+, ≤1000 rows). The domain-event
outbox stays deferred. All of Phases 3–5 land on the `Client` entity — **no new
entity file**.

Each entity file is **self-contained**: purpose, fields (rows), paste-ready
TypeScript, endpoints, validations, errors, example payloads, and UI notes all
sit together. Read one file, integrate one resource.

## Read order

1. **`overview.md`** — module purpose, base paths, auth, the response envelope,
   pagination, the role model, concurrency, and the dependency order (**start
   here** →).
2. **`enums.md`** — every enum value in one place, with UI-label hints.
3. **`entities/client.md`** — the aggregate root; start here. Each entity file has
   the same seven sections — Fields, Types (paste-ready TS), Endpoints,
   Validations, Errors, Examples, UI notes (see `entities/_TEMPLATE.md`).
4. **`entities/contact.md`** · **`address.md`** · **`alias.md`** · **`tag.md`** ·
   **`logo.md`** — the Phase-2 children (nested under a client; contacts/addresses/
   aliases/tags embed read-only on it, and the logo exposes `logo_url` /
   `logo_thumbnail_url` on it).
5. **`flows.md`** — end-to-end sequences (create, lifecycle change, lock,
   archive/restore, the Phase-2 child + logo flows, the Phase-4 document-prefill →
   snapshot and admin audit-trail flows, plus the Phase-5 merge and bulk CSV
   export/import flows).
6. **`gaps.md`** — what the docs do **not** answer; ask, don't assume.

## Index

| File                  | Covers                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `overview.md`         | Envelopes, auth, pagination, role model, concurrency, dependency order                                                                                                                                                                    |
| `enums.md`            | All enum sets + UI labels                                                                                                                                                                                                                 |
| `entities/client.md`  | Aggregate root — role projection, `record_version`, status, lock, archive, embedded children, ranked search + duplicate warnings + lookup/duplicate-check + document-prefill + audit-trail read + merge/merge-history + CSV export/import |
| `entities/contact.md` | Contact persons — role-projected `notes`, one-active primary/spokesperson                                                                                                                                                                 |
| `entities/address.md` | Addresses — one-active primary, soft deactivate                                                                                                                                                                                           |
| `entities/alias.md`   | Aliases — add/remove only, duplicate rejection                                                                                                                                                                                            |
| `entities/tag.md`     | Tag catalog + per-client assignments — assign-by-name resolve-or-create                                                                                                                                                                   |
| `entities/logo.md`    | Private logo image + thumbnail — upload/replace/stream/remove; authenticated URLs                                                                                                                                                         |
| `flows.md`            | Multi-entity / multi-step sequences                                                                                                                                                                                                       |
| `gaps.md`             | Open questions / assumptions / deferred-phase surfaces                                                                                                                                                                                    |

## Scaling rule

- **≤ 3 entities** → collapse the whole pack into a single `INTEGRATION.md` using
  the same section order (overview → enums → per-entity blocks → flows → gaps).
- **> 3 entities** → split per entity as shown here.

This project always emits the **folder** shape regardless of entity count — the
frontend expects the same layout for every app. Either way the **per-entity block
never changes shape** — header + the same seven sections.

<!-- The frontend pins to overview.md's pack version — see its Change history table. -->
