# Applicants integration — against `docs/applicants/integration/` pack v1.0.0

Plan: `~/.claude/plans/following-this-integration-guide-proud-honey.md`

## Phase 1 — Correctness bugs (silent data loss)

- [x] 1a-i. `language-tests`: rename `overall`/`listening`/`reading`/`writing` → `*_score` (types, form types, form, columns)
- [x] 1a-ii. `sponsors`: rename `relationship`→`relationship_to_applicant`, `occupation`→`occupation_or_business`, `organization`→`organization_name`, `annual_income_currency`→`income_currency`, `funding_amount_currency`→`funding_currency`
- [x] 1a-iii. `qualification-assessments`: rename `language_summary`→`language_readiness`, `financial_summary`→`financial_readiness`
- [x] 1b. Archive: refetch fresh `record_version` instead of reading it off the list row
- [x] 1c. Remove `record_version ?? 0` fallbacks (ApplicantOverview, ApplicantProfileModal)
- [x] 1d. Print event `document_revision` is a UUID, not a number — fix `NaN` rendering
- [x] 1e. Drop over-required `country` on travel-history + visa-history forms
- [x] 1f. Gate applicant create on admin role; point staff at leads
- [ ] Phase 1 verify (`pnpm format && check-types && lint`) + commit + dual adversarial review

## Phase 2 — Contract gaps in existing entities

- [ ] 2a. Split `Applicant` into 4 documented role projections; fix enum `""` nullability
- [ ] 2b. `payment_status` end-to-end
- [ ] 2c. Missing enums: `payment_status`, `education_level`, `LockAction` + `confidentiality_level` label maps
- [ ] 2d-i. `educations` — 8 missing fields
- [ ] 2d-ii. `application-case` — 10 missing type fields + form coverage (6/17 → full)
- [ ] 2d-iii. `document` / `document-revision` / `print-event` / `signature` missing fields
- [ ] 2d-iv. Smaller: `age_snapshot`, `assignment.created_at`, `verified_at`, `interactions.metadata`, `evidence_media`, `application_case` links
- [ ] 2d-v. Identity-document media links (`image_front`, `image_back`, `file`)
- [ ] 2e. `change_reason` on document PATCH
- [ ] 2f. Filters, ordering (`sortable` columns), `include_archived`, document list paging
- [ ] 2g. Register missing error codes; field-level error routing
- [ ] 2h. Non-disclosing 404 on document/signature surfaces + gate editor route
- [ ] 2i. Behavioural: lock/staff-edit, merge fields, assignment cache invalidation, interest-profile 409, identity duplicate meta, assessment ordering + id handoff, case↔document link, evidence media params, print statuses, document 409 confirm
- [ ] 2j. Validation: max-lengths, email, language-test score ranges
- [ ] Phase 2 verify + commit + dual adversarial review

## Phase 3 — Missing modules

- [ ] 3a-0. `/design-decisions` + `/form-builder` for leads
- [ ] 3a. `leads` module (types, api, keys, columns, form, list, convert modal, route, nav, errors)
- [ ] 3b. `work-experiences` child resource + education tab
- [ ] 3c. Cross-applicant document search
- [ ] Phase 3 verify + commit + dual adversarial review

## Phase 4 — Bikram Sambat + remaining surfaces

- [ ] 4a-i. Add ~20 missing `_bs` type fields
- [ ] 4a-ii. Shared BS display component + `dateColumnBs` helper
- [ ] 4a-iii. Apply across all date columns and detail views
- [ ] 4b. Revision diff (`changed_fields`), print artifact multipart, signature validity window, detail reads
- [ ] 4c. `/update-ai-map` — app AI.md + applicant module AI.md
- [ ] Phase 4 verify + commit + dual adversarial review
