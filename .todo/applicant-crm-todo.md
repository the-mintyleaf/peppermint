# Applicant CRM — mintway build

Plan: `~/.claude/plans/adaptive-yawning-teacup.md`. Branch: `dev/applicant-crm`.
Scope: every non-document applicant API. Do NOT touch `modules/documents/` or `components/templates/`.

## Phase 0 — Foundations (`_shared` spine)

- [x] `_shared/applicant.types.ts` — domain types, role projections, `*_bs`
- [x] `_shared/applicant.enums.ts` — label/color maps + select options
- [x] `_shared/applicant.api.ts` — applicant-core client (CRUD + transition/lock/unlock/histories/merge) + duplicate-meta capture
- [x] `_shared/applicantQueryKeys.ts` — `createQueryKeys` per resource
- [x] `_shared/childResource/` — config-driven nested-CRUD factory (ModalTableShell-backed)
- [x] `_shared/useApplicant.ts` + `useApplicantMutation.ts`
- [x] `_shared/ApplicantDetailShell/` — detail chrome (header + section nav)
- [x] `components/RequireAuth/` (staff-inclusive gate); admin sections reuse `RequireStaff`
- [x] Extend `lib/authErrorMessages.ts` with `APPLICANT_*` codes
- [x] `_shared/index.ts` barrel
- [~] Nav group + `ModuleApplicant` barrel — deferred to Phase 1 (need the routes first)
- [x] Verify my files (format/check-types/lint clean); commit checkpoint
- [~] Dual review — run after Phase 1 (spine reviewed together with its first usage)

> Note: pre-existing untracked `modules/documents/` + `components/templates/` (the
> excluded in-progress work) fail app-wide check-types/lint; my files are verified via
> a path-filtered check. Not committing those files.

## Phase 1 — Applicants list + overview + core actions

- [x] `applicants/` list (staff/admin projections, search, lifecycle tabs, dup warning)
- [x] create form (staff vs admin field sets) + edit form (onEditTrigger fetches full record)
- [x] overview page (info cards, badges, lock indicator, edit modal, action bar)
- [x] transition action (funnel + engagement, reason rules, assessment ref)
- [x] lock/unlock (reason modals) + archive (DELETE + reason)
- [x] merge (surviving picker + field_resolutions → routes to survivor)
- [x] routes `app/admin/applicants/` + `[applicantId]/` + `ModuleApplicant` barrel + nav
- [x] Verify my files (types/prettier/eslint clean); commit
- [x] Dual review (Codex + adversarial) done; fixes applied + committed (8537aff)

## Phase 2 — Addresses + profile image (staff+)

- [x] `addresses/` address CRUD via child factory (AddressForm + columns; primary/lock/archive server-guarded)
- [x] profile-image view (streamed blob → object URL) + upload (multipart, client-validated)
- [x] route `[applicantId]/addresses/` + barrel + group wiring
- [x] Verify (types/prettier/eslint clean); commit
- [~] Dual review — batch with Phase 3

## Phase 3 — Profile records (admin) — parallel builders

- [x] `identity/` (orchestrator) — identity-documents (issued≤expiry) + evidence-media (upload/view/delete). Media-ref linking + dup-fingerprint warning deferred (documented).
- [x] `education/` (agent) — educations · language-tests · trainings · skills · languages · academic-gradings
- [x] `family/` (agent) — family-members · emergency-contacts · references
- [x] routes (identity/education/family) + group barrel wiring
- [x] Verify full module (types/prettier/eslint clean)
- [x] Commit + dual review (Phase 2 + 3) done; fixes applied

### Phase 2+3 review fixes (Codex + adversarial)

- [x] CRITICAL: multipart uploads were JSON-stringified (instance defaults Content-Type
      to application/json → axios drops the file). Override to multipart/form-data on both
      upload calls. Verified against axios@1.17.0 source.
- [x] ProfileImagePanel object-URL: create+revoke in effect (not render useMemo)
- [x] Evidence view: open tab synchronously (popup-safe) + null-check + revoke-on-fail
- [x] FileButton resetRef on both panels (re-pick same file after failure)
- [x] Clear-on-edit fixed for address + identity forms
- [~] Clear-on-edit for agent child forms (education/family): documented v1 limitation —
  hard-deletable records; delete+recreate to clear an optional field. Not blocking.

## Phase 4 — Interests + CRM (admin)

- [x] `interests/` — interest-profile OneToOne (create/view/edit/delete, TagsInput lists) + qualification-assessments (append-only via child factory, edit/delete disabled)
- [x] `crm/` (agent) — interactions · sponsors · travel-history · visa-history · consents (edit-aware payload; decimal money kept as strings)
- [x] routes (interests/crm) + barrel wiring
- [x] Verify (types/prettier/eslint clean)
- [ ] Commit; dual review batched with Phase 5

## Phase 5 — Cases + assignments (admin)

- [x] `cases/` — nested list/open (CasesSection) + top-level `application-cases/[caseId]/` detail (edit, transition with reason rules + own record_version, status-history feed)
- [x] `assignments/` — assign (user + case picker) / end (case-scoped); history table
- [x] routes (cases/assignments detail sections + application-cases/[caseId]) + barrel
- [x] Verify (types/prettier/eslint clean); commit
- [ ] Dual review (Phase 4 + 5) — next

## Phase 6 — History + finish

- [x] `history/` — lifecycle · lock · merge read-only feeds (DataTableShell) + route
- [ ] polish: UI states audit, `/design-check`, `/visual-review`
- [ ] update `apps/mintway/docs/AI.md`
- [ ] final `/verify` + commit
- [ ] delete this file
