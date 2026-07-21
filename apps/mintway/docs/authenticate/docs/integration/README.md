# Integration Pack — `authenticate`

> The **single source the frontend reads to integrate this module.** Everything
> needed to wire up types, queries, mutations, forms, and error states lives in
> here — you should never need to open the backend's build docs (`API.md`,
> `DATA_CONTRACT.md`, `SECURITY.md`) to integrate.

This pack covers authentication and account administration: sign-in and the
rotating refresh-token session, the forced first-login password change, the
current-user profile, own-password change, admin account lifecycle, and the
superadmin security-event feed.

## What makes this format different

Backend build docs split field truth (`DATA_CONTRACT.md`, by model) from
endpoints (`API.md`, by operation) from access rules (`SECURITY.md`). Integrating
one screen means stitching three files together — and it's easy to read the
endpoint and miss the field contract.

Here, **each entity file is self-contained**: purpose, fields (rows), paste-ready
TypeScript, endpoints, validations, errors, example payloads, and UI notes all
sit together. Read one file, integrate one resource.

## Read order

1. **`overview.md`** — module purpose, base path, the JWT/cookie auth model, the
   response envelope, pagination, the role model, and concurrency (**start here**
   →).
2. **`enums.md`** — every enum value in one place, with UI-label hints.
3. **`entities/<entity>.md`** — one per resource; the unit you actually build
   against. Each has the same seven sections — Fields, **Types** (paste-ready
   TS), Endpoints, Validations, Errors, **Examples** (wire payloads), UI notes
   (see `entities/_TEMPLATE.md`).
4. **`flows.md`** — end-to-end sequences that span entities (login → first-login
   challenge → session; admin creates an account).
5. **`gaps.md`** — what the docs do **not** answer; ask, don't assume.

## Index

| File                           | Covers                                                                     |
| ------------------------------ | -------------------------------------------------------------------------- |
| `overview.md`                  | Envelopes, JWT + refresh-cookie + CSRF auth, pagination, role model        |
| `enums.md`                     | All enum sets + UI labels                                                  |
| `entities/session.md`          | Login, token refresh, logout, logout-all, own device/session list          |
| `entities/current-user.md`     | `GET /me/`, first-login password change, own-password change               |
| `entities/employee-profile.md` | Operational employee profile (nested read + admin update)                  |
| `entities/user-account.md`     | Admin account admin — list/create/read, lifecycle, target sessions, revoke |
| `entities/security-event.md`   | Superadmin-only append-only audit feed                                     |
| `flows.md`                     | Multi-entity sequences                                                     |
| `gaps.md`                      | Open questions / assumptions                                               |

## A note on this app

`authenticate` uses **no `record_version` optimistic concurrency** anywhere —
none of its resources take a version on write. Access control is **role-based and
enforced server-side** (`staff` / `admin` / `superadmin`); never rely on the
frontend to hide protected surfaces. Some models (`PasswordHistory`,
`FirstLoginChallenge`) are internal and never reach the client; where a stored
model surfaces only as a read summary (`KnownDevice`, `AuthSession`) it is
documented inside the entity that exposes it, not as its own file.
