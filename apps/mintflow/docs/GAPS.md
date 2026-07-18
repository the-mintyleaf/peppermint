# MintFlow `work` — Integration Gaps

What the MintFlow frontend **could not** integrate against the `work` backend, and why. Everything here
was deliberately **not built** — either the backend has no endpoint, the endpoint is gated, or it needs
client infrastructure we chose to defer. Nothing below is a bug; it's the ceiling of what the current
backend + product decisions allow. Contract: `docs/api-contracts/work.md`.

Last updated: 2026-07-18.

## ✅ What IS integrated (for contrast)

- **Cases** — list (`/cases`) + full profile (`/cases/[id]`) on real data.
- **Task commands** — create · start · complete · block · unblock · return · archive.
- **Work commands** — start · submit-review · submit-closure · close · reopen · extend-deadline · archive · restore.
- **Profile tabs** — Activity (read + record), Evidence (list + submit + verify/reject), Review (rounds + decide + comment), People.
- **Dashboard** — a live "Awaiting you" section (`/my/active`, `/my/pending-assignments`, `/my/pending-reviews`).

## ⛔ Gap 1 — No read/list endpoint (write-only)

The backend exposes only writes, so the frontend can't list existing rows → no usable management surface.

| Feature          | Has                                            | Missing                         |
| ---------------- | ---------------------------------------------- | ------------------------------- |
| **Stakeholders** | `POST` create · `PATCH` update · `POST` notify | `GET /items/{id}/stakeholders/` |
| **Participants** | `POST` add · `POST` end                        | `GET /items/{id}/participants/` |

→ Integrable as soon as the backend adds the list endpoints.

## ⛔ Gap 2 — No backend at all (task/metrics/files-centric mock screens)

These MintFlow surfaces were designed around a data model the work API doesn't serve (it exposes tasks
only **under** a work item, plus three `/my/*` lists). They **stay on mock**:

- **Standalone `/tasks` kanban board** — no "my tasks across cases" endpoint.
- **`/calendar`** at task granularity — same reason.
- **Dashboard FocusHero / TaskFlowBoard / MetricsRail / WorkFilesRail** — task/metrics/files-centric; there
  is **no metrics endpoint** (metrics facts are a backend-only selector feeding a future `evaluation` app),
  and files are gated (below). Only the "Awaiting you" section is live.

## ⛔ Gap 3 — Backend-gated (endpoint exists but refuses until a foundation lands)

Wired defensively — the UI shows these disabled/omitted rather than broken:

- **File attachments + file-backed evidence** — `503 WORK_DOCUMENT_INTEGRATION_UNAVAILABLE` (needs a documents
  foundation). Text / external / structured evidence works; `document_reference`/`image_reference` types are omitted.
- **Restricted / confidential / explicit visibility creation** — `422 WORK_VISIBILITY_MODE_UNSUPPORTED`. Only
  `organizational` / `participants_only` are offered.
- **External stakeholder notifications** — gated on an approved curated template.

## 🟡 Gap 4 — Deferred by decision (integrable, but needs new client infrastructure)

These have clean, tested backends but require an **org-context + units/actor picker layer** that the
mintflow client doesn't currently have (org/unit administration lives in mintflow-admin; the client only
wired auth). Deferred per user decision — not a hard gap.

- **Create work (New Case)** — payload needs `organization` + `responsible_unit`
  (`/organization/memberships/mine` + org-scoped units list).
- **Assign / route / transfer** — need actor/unit pickers (same org layer).
- **Participants add** — needs an actor picker (and also blocked by Gap 1's missing list).
- **Drag-reorder tasks** — self-contained (`reorderTask` exists) but not built; the flat chip strip mixes
  parent/subtask sequence groups, so it needs a grouped DnD surface.

## Notes for whoever picks this up

- The command + query layer (`cases.commands.ts`, `cases.api.ts`, `cases.mutations.ts`, `lib/work/`) already
  covers most of Gap 4's endpoints (fetchers exist); what's missing is the **org/units/actor picker reads**
  and the forms that consume them.
- Un-gapping Gap 1 (add the two `GET` list endpoints backend-side) immediately unlocks Stakeholder and
  Participant tabs — the create/update/notify + add/end command layer can be added the same way as Evidence/Review.
