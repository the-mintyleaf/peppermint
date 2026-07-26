# Dependent catalogue modules — institutions, offers, clients

Branch: `dev/grandway-document-stack` (stay on it). App: `apps/grandway`.

## Phase 0 — Backend sync (contract digests + typed API)

- [x] `/sync-api` institutions → `apps/grandway/docs/backend/institutions/`
- [x] `/sync-api` offers → `apps/grandway/docs/backend/offers/`
- [x] `/sync-api` clients → `apps/grandway/docs/backend/clients/`
- [x] Verify DTO shapes against §4 Models (ignore stale "Send" duplicate names)
- [x] Commit Phase 0

## Phase 1 — Clients + Institutions — DONE (commits 308ecd7, 5179a65)

- [x] Clients ContainedModule (list/CRUD/retire/restore/history/detail drawer)
- [x] Institutions sub-nav group (programs + providers + reference-data modal)
- [x] Availability-note rule enforced client-side
- [x] Routes + nav + CLIENTS*/INSTITUTIONS* error copy wired; check-types + lint clean
- [x] Dual adversarial review (Codex + Opus); fixes applied + committed

### Known limitations (accepted, bounded scale — follow-ups if catalogue grows)

- Option pickers (country/institution/field/campus) fetch page 1 only (page_size 100); >100 institutions unreachable in the program-form Select + column filters. Add server-search/pagination if a catalogue exceeds this.
- Program "Offerable only" switch is silently overridden when the Availability column filter is set (backend precedence).
- CountryCard/FieldCard rely on the reference modal being admin-only (not internally re-gated like CampusCard).

## Phase 2 — Offers (MultiPageModule) — DONE (commits 3a265c9, aa7430b)

- [x] Data layer (offers + conditions + issue/decision/history actions)
- [x] OffersWorklist + columns (overdue + open-conditions badges)
- [x] OfferDetail `/admin/offers/[id]` (summary, conditions, actions, history)
- [x] OfferCreateForm (journey + program/manual reference + money + conditions) + OfferEditForm (changed-fields-only)
- [x] Action modals: Issue, RecordDecision, ConditionStatus, AddCondition, EditCondition
- [x] Routes + nav + OFFERS\_ error copy; check-types + lint clean
- [x] Dual adversarial review (Codex clean; Opus minor); fixes applied + committed

## Phase 3 — Wiring, docs, verification — DONE (commit b84a9bb)

- [x] Nav entries in `config/nav/admin-nav.ts` (Catalogue group + Offers + Clients + gating flags)
- [x] `docs/AI.md` per module + app-level map registered (`/update-ai-map`)
- [x] `pnpm check-types` + `pnpm lint` clean (0 errors; 3 pre-existing warnings, none in new code)
- [ ] `/design-check` + `/visual-review` on the 3 routes — DEFERRED: needs the app running against the live backend (not available in this headless session). Recommend the user run these.

Commits: Phase 0 `bbf524e` · Phase 1 `308ecd7`,`5179a65` · Phase 2 `3a265c9`,`aa7430b` · Phase 3 `b84a9bb`.
Keep this file until the visual audits are run; then delete.
