# Clients Module AI Map

## Purpose

B2B partner directory — the agencies, schools, and companies that refer or send
applicants, with the contact details staff need to reach them. A reference
directory, **not** a CRM: no attribution back to leads/applicants, no pipelines,
no delete. Backed by `docs/backend/clients/INTEGRATION.md`.

## Module type

ContainedModule (single route, modal CRUD + detail drawer)

## Route

/admin/clients

## Entry files

- `pages/list/ClientDirectory.tsx` — exported as `ModuleClients`
- `index.ts`

## Access model (contract §1 — enforce, don't guess)

- **Admin-only in this app**, gated `RequireCapability capability="clients"`. The
  backend shares reads with `lead_manager` (§1) and refuses superadmin everything,
  but the partner directory is not part of the funnel a staff account works.
- The inline write gates below therefore never fire for a non-admin today; they are
  kept because they encode the backend's own narrower rule.
- Write controls (create/edit form, retire, restore) are gated on the **exact**
  `authorityType === "admin"` — NOT `isAdmin` (that also covers superadmin).

## Common edit targets

| Task                                             | Files                                       |
| ------------------------------------------------ | ------------------------------------------- |
| List UI / shell wiring                           | pages/list/ClientDirectory.tsx              |
| Columns                                          | pages/list/clients.columns.tsx              |
| Row actions (edit/retire/restore)                | pages/list/components/ClientRowActionsMenu/ |
| Retire confirm                                   | pages/list/components/RetireClientModal/    |
| Detail drawer / history                          | pages/list/components/ClientDetailDrawer/   |
| Form fields                                      | form/ClientForm.tsx                         |
| Contact-numbers repeater                         | form/ClientContactNumbersField.tsx          |
| Payload mapping / field diff                     | form/clientForm.utils.ts                    |
| API functions                                    | clients.api.ts                              |
| Query keys                                       | clients.queryKeys.ts                        |
| Detail/history queries, retire/restore mutations | clients.hooks.ts                            |
| Types / DTOs                                     | clients.types.ts                            |

## Data & state

- Server data: React Query (`fetchClients` via the shell; `useClientDetail`,
  `useClientHistory`, `useRetireClient`, `useRestoreClient`).
- `ClientRow` = `ClientDetail` widened with the list-only `primary_contact_number`;
  it is the single shell row type. List rows are mapped up with empty detail
  defaults (`toClientRow`); `onEditTrigger` re-fetches real detail before edit.
- Local UI state: the detail-drawer's open client id (`useState`).

## Contract rules that bite (do not regress)

- **No delete.** Destructive control is **Retire** (`POST /clients/<id>/retire/`,
  mandatory non-empty reason via `openReasonConfirmModal`). Restore requires an
  `inactive` client.
- **PATCH sends only changed fields.** `toUpdatePayload` diffs against the record;
  `status`/retirement fields are rejected — never send them.
- **`contact_numbers` is a replacement set** — omit = leave alone, `[]` = clear,
  full array = replace. Included on edit only when the repeater changed. Write
  shape is `{ number, label?, is_primary? }` — never the read-only `id`.
  `is_primary` is NOT unique — zero or several primaries allowed (per-row toggle).
- **`logo_url`/`website` are plain URL strings** (not uploads). Render `logo_url`
  via Mantine `Avatar src` / plain `<img>` — never `next/image` (arbitrary host).
- List is alphabetical by `name` (server-fixed — no `sort`/`ordering`). Retired
  clients still appear; de-emphasized by the status badge, not hidden.

## Do not do

- Do not add a delete/archive control.
- Do not send `status`/retirement fields on PATCH, or a whole-object round-trip.
- Do not render `logo_url` with `next/image`.
- Do not gate writes on `isAdmin` (use `authorityType === "admin"`).
- Do not fetch data in useEffect; do not import Mantine directly.
