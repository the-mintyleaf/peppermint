<!-- Copy to `<app>/docs/integration/README.md` and fill in. This is the pack's
     front door: what it is, the read order, and an index of its files. Keep it
     short — the substance lives in overview.md and the entity files. -->

# Integration Pack — `<app>`

> The **single source the frontend reads to integrate this module.** Everything
> needed to wire up types, queries, mutations, forms, and error states lives in
> here — you should never need to open the backend's build docs (`API.md`,
> `DATA_CONTRACT.md`, `SECURITY.md`) to integrate.

Each entity file is **self-contained**: purpose, fields (rows), paste-ready
TypeScript, endpoints, validations, errors, example payloads, and UI notes all
sit together. Read one file, integrate one resource.

## Read order

1. **`overview.md`** — module purpose, base paths, auth, the response envelope,
   pagination, the role model, and the dependency order (**start here** →).
2. **`enums.md`** — every enum value in one place, with UI-label hints.
3. **`entities/<entity>.md`** — one per resource; the unit you build against.
   Each has the same seven sections — Fields, Types (paste-ready TS), Endpoints,
   Validations, Errors, Examples, UI notes (see `entities/_TEMPLATE.md`).
4. **`flows.md`** — end-to-end sequences that span entities.
5. **`gaps.md`** — what the docs do **not** answer; ask, don't assume.

## Index

| File                   | Covers                                                      |
| ---------------------- | ----------------------------------------------------------- |
| `overview.md`          | Envelopes, auth, pagination, role model, dependency order   |
| `enums.md`             | All enum sets + UI labels                                   |
| `entities/<entity>.md` | `<one line per entity — the resource + its defining trait>` |
| `flows.md`             | Multi-entity sequences                                      |
| `gaps.md`              | Open questions / assumptions                                |

<!-- Add one index row per entity file. The frontend pins to overview.md's pack
     version — see its Change history table. -->
