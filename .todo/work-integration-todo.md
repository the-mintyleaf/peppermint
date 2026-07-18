# MintFlow `work` — Frontend Integration Plan (integrable-only)

Wire the MintFlow frontend to the already-built `work` backend (60 endpoints, live at
`http://192.168.110.97:8000`). Plan: `~/.claude/plans/you-are-to-fully-snappy-planet.md`.
Contract digest: `apps/mintflow/docs/api-contracts/work.md`. Typed layer: `apps/mintflow/lib/work/`.

## Governing principle

**Only integrate a surface if it has a clean 1:1 backend endpoint.** No aggregation, no synthesized
data, no workarounds. The **case profile is the integration hub** — tasks, lifecycle, and sub-resources
all live under a work item there. Anything without a backend stays on mock and is listed under **Gaps**
(§ bottom) — it is not "to do", it is out of scope until the backend adds endpoints.

## Standing rules (every phase)

- Reads → `useQuery`; commands → `useMutation` via `useWorkMutation` (notify + invalidate + error map).
- Named commands only (no generic PATCH status). Send `aggregate_version` on mutations (409 → refetch).
- 404 = not-found (anti-enum, never "denied"). Gated (503 `WORK_*_UNAVAILABLE`) → disabled + tooltip.
- Forms → `FormWrapper` (`@peppermint/admin`) **after `/form-builder`** (repo mandate + existing precedent).
- Each phase ends: `pnpm check-types && lint` green · commit (repo format) · `docs/AI.md` updated if structure changed.

---

## ✅ DONE

- **Foundation** — contract intake `docs/backend/work/`, digest, frozen `lib/work/` (types/enums/
  queryKeys/errors/mappers/directory resolver), reshape decisions.
- **Cases reads** — list (`/cases`) + profile (`/cases/[id]`) fully off mock: real WorkItem/WorkTask/
  activity, resolved owner/unit names, BS+Gregorian dates, 404 handling.
- **Task command layer** — `cases.commands.ts` (all task fetchers) + `cases.mutations.ts`
  (`useWorkMutation` + task hooks); **form-free task commands wired** (start / complete / archive in the
  TaskStrip menu, version-guarded).

---

## ▶ REMAINING (integrable — in plan order)

### Phase 1 — Form-free work-item lifecycle commands ✅ (commit 7d9dd5d)

- [x] `startWork`/`archiveWork`/`restoreWork` fetchers + hooks; wired into the WorkDetail header menu
      (status-aware, aggregate_version, spinner)

### Phase 2 — Dashboard `/my/*` reads (form-free) ✅ (commit dd81672)

- [x] `dashboard.api.ts` + hooks (my active work / pending assignments / pending reviews)
- [x] `AwaitingYou` widget (3 live lists, names resolved, deep-link to cases, per-list states); mounted
      above the mock board with Live badge + "sample workspace" caption (mock widgets stay mock)

### Phase 3 — Command forms (`/form-builder` → `FormWrapper`)

- [x] Ran `/form-builder` for the create-form family (controls/order/disclosure decided)
- [x] **Create task** — CreateTaskModal (FormWrapper) wired to profile "Add task" (commit 3b3a61c)
- [x] **Task reason forms** — return-uncompleted (reason+report), block (type+desc), unblock (note) in the TaskStrip menu (commit 693efbd)
- [x] **Work reason forms** — reopen, extend-deadline, **close** (outcome+summary) + form-free submit-review/submit-closure in the WorkDetail menu (commit 8e196e3)
- [ ] Drag-reorder tasks (DnD via @dnd-kit → `reorderTask` with `expected_version`) — last self-contained item
- [ ] **Create work** (New Case) — ⚠️ needs NEW org infrastructure in the client: the mintflow client
      has no org context (org/unit admin lives in mintflow-admin). Requires `organization` +
      `responsible_unit` → wire `/organization/memberships/mine` (org context) + org-scoped units list
      (unit `Select`). Endpoints are clean+tested, but it's a sub-project — do after the self-contained forms.
- [ ] **Assign / route / transfer** — also need actor/unit pickers (same org infra as create-work)
- [ ] Each command surfaces 409/permission/invalid-transition/gated; check-types + lint green · commit (split across commits)

### Phase 4 — Case sub-resource tabs (profile)

- [x] **Activity** — record-activity form on the Activity tab (commit 9227d5a); correct = later
- [x] **Evidence** tab — list + submit (text/external/structured) + verify/reject (commit 7db19b9)
- [ ] **Review** tab: list rounds + add comment + decide (self-review/stale guards surfaced)
- [ ] **Stakeholders**: create / update (bilingual names — self-contained); notify gated
- [ ] **Participants**: add / end — ⚠️ needs actor picker (org infra, deferred with create-work)
- [ ] check-types + lint green · commit (split per tab)

### Phase 5 — Finalize

- [ ] `docs/AI.md` (app + module) fully in sync · `GAPS.md` written (see below)
- [ ] `/verify` full green · `/visual-review` `/cases`, `/cases/[id]`, `/dashboard` against live backend
- [ ] Delete this todo file

---

## ⛔ GAPS — NOT integrable (stay mock; document, don't build)

No clean backend exists — out of scope until the backend adds endpoints:

- **Standalone `/tasks` kanban board** — no "my tasks across cases" endpoint.
- **`/calendar`** at task granularity — same reason.
- **Dashboard metrics tiles / task-flow board / work-files rail** — no metrics endpoint (facts are a
  backend-only selector), files gated.
- **File attachments + file-backed evidence** — gated `503 WORK_DOCUMENT_INTEGRATION_UNAVAILABLE`.
- **Restricted / confidential / explicit visibility creation** — gated `422 WORK_VISIBILITY_MODE_UNSUPPORTED`.
- **External stakeholder notifications** — gated (curated-template only).
