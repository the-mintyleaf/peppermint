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

- [ ] `applicants/` list (staff/admin projections, search, lifecycle/engagement tabs, dup warning)
- [ ] create form (staff vs admin field sets)
- [ ] overview page (badges, lock indicator, admin actions)
- [ ] edit form
- [ ] transition action (funnel + engagement, reason rules, assessment ref)
- [ ] lock/unlock (reason modals) + archive (DELETE)
- [ ] merge (surviving picker + field_resolutions)
- [ ] routes `app/admin/applicants/` + `[applicantId]/` + barrel
- [ ] Verify + commit + dual review

## Phase 2 — Addresses + profile image (staff+)

- [ ] `addresses/` address CRUD (primary demotion, lock/archive aware)
- [ ] profile-image view (streamed) + upload (multipart)
- [ ] route `[applicantId]/addresses/`
- [ ] Verify + commit + dual review

## Phase 3 — Profile records (admin) — parallel builders

- [ ] `identity/` — identity-documents + evidence-media (same-applicant refs, dup fingerprint)
- [ ] `education/` — educations · language-tests · trainings · skills · languages · academic-gradings
- [ ] `family/` — family-members · emergency-contacts · references
- [ ] routes + barrel wiring
- [ ] Verify + commit + dual review

## Phase 4 — Interests + CRM (admin)

- [ ] `interests/` — interest-profile (OneToOne) + qualification-assessments (append/supersede)
- [ ] `crm/` — interactions · sponsors · travel-history · visa-history · consents
- [ ] routes + barrel wiring
- [ ] Verify + commit + dual review

## Phase 5 — Cases + assignments (admin)

- [ ] `cases/` — nested list/create + `application-cases/[caseId]/` detail (update, transition, status-history)
- [ ] `assignments/` — assign / end (case-scoped)
- [ ] routes + barrel wiring
- [ ] Verify + commit + dual review

## Phase 6 — History + finish

- [ ] `history/` — lifecycle · lock · merge tabs
- [ ] polish: UI states audit, `/design-check`, `/visual-review`
- [ ] update `apps/mintway/docs/AI.md`
- [ ] final `/verify` + commit
- [ ] delete this file
