# Gaps & assumptions

What the backend docs do **not** answer. Each entry is a question for the backend
or an assumption the frontend is making — **ask, don't invent**. Nothing here may
be silently resolved in code without confirmation.

| #   | Gap                                                                                                                                                                                     | Impact on frontend                                                                 | Assumption (if any)                                                                                        | Where the assumption lives          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | Exact **401 / 403 response bodies** are not shown (only status codes).                                                                                                                  | Can't type the auth-error body; rely on status code + the standard error envelope. | Auth errors follow the standard `error` envelope with a `code`.                                            | api client 401/403 handling         |
| 2   | Full **serializer validation-error body** (`error.details` shape) is not enumerated per field.                                                                                          | Can't reliably map field errors to form fields.                                    | Treat `error.details` as an **opaque object**; fall back to `error.message`. Do not hard-map a shape.      | form error mapper                   |
| 3   | Whether **staff may read another staff member's** created applicants/leads beyond the restricted projection.                                                                            | Affects list scoping expectations for staff.                                       | Role-only scoping (no per-record ownership filter yet).                                                    | applicant/lead list query           |
| 4   | Superadmin-only gating of **confidential interactions** is documented but **not yet enforced**.                                                                                         | If the UI relies on it, confidential rows may reach admin.                         | Treat `is_confidential` as display-only for now; do not gate on it.                                        | `crm-children.md` interactions      |
| 5   | The **case-status transition graph** is not rigidly encoded server-side (statuses listed, not edges).                                                                                   | The UI can't derive "allowed next status" from a fixed graph.                      | Offer all statuses; let the server reject invalid moves via `APPLICANT_CASE_TRANSITION_INVALID`.           | `application-case.md` transition    |
| 6   | The **`document-prefill` response shape** is defined per document family in the backend's `document-schemas.md`, not here.                                                              | Can't type the prefill seed generically.                                           | Treat prefill as `Record<string, unknown>`; confirm per family before binding fields.                      | `document.md` prefill               |
| 7   | The **53 `document_type` slugs** and their per-family content schemas live in `document-schemas.md`, not in this pack.                                                                  | Can't build type-specific document editors from the pack alone.                    | Surface only the slugs the UI supports; keep `document_content` as `Record<string, unknown>`.              | `document.md` / `enums.md`          |
| 8   | **Default page size** (when `?page_size` is omitted) is not stated (only max 100).                                                                                                      | Table page size / prefetch counts are a guess.                                     | Assume the DRF project default (20) until confirmed; always send an explicit `page_size`.                  | list query params                   |
| 9   | **Default ordering per list** (when `?ordering` is omitted) is not stated (only that lists are "newest first" for history/append-only).                                                 | Row order for the main applicant/lead lists is non-deterministic.                  | Always send an explicit `ordering`; don't rely on a server default.                                        | list query params                   |
| 10  | The **lead JSON snapshot** shape (`education_qualification` / `work_experience` entry objects) is only "a flat object" — no field contract.                                             | Can't build a typed sub-form for those entries.                                    | Treat each entry as `Record<string, unknown>` (≤50 per list); confirm a shape before building a form.      | `lead.md` §1                        |
| 11  | The **`meta.matches[]` duplicate shape on identity-document create** is described (adds `identity_match: true`) but the base `DuplicateMatch` fields aren't re-confirmed for that path. | Minor — reuse the create `DuplicateMatch` shape.                                   | Reuse `DuplicateMatch` + an extra optional `identity_match: boolean`.                                      | `profile-children.md` identity-docs |
| 12  | The **admin `document/search` and `workspaces` pagination/ordering defaults** are not stated.                                                                                           | Same as #8/#9 for those admin surfaces.                                            | Send explicit `page_size`/`ordering`; treat `workspaces` as an unpaginated grouping unless told otherwise. | `document.md` search/workspaces     |

> When a gap is resolved (backend answers, or a new doc version lands), delete its
> row and fold the truth into the relevant entity file — don't leave stale
> assumptions.

## Resolved against the frozen example

For reference, a few items that were open questions in the frozen `example/` pack
are **answered** in this live pack and therefore are **not** gaps here:

- The **admin applicant list serializer** field set is fully enumerated (see
  `applicant.md` §2 `ApplicantListRowAdmin`).
- The **six qualification-assessment summary fields** have confirmed names
  (`education_summary`, `study_gap_summary`, `language_readiness`,
  `financial_readiness`, `funding_summary`, `visa_risk_summary` — see
  `qualification-assessment.md`).
- The **revision `restore`** endpoint takes **no body** and returns the refreshed
  **document** (not the new revision) — see `document-revision.md` §3.
