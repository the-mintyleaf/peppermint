# Applicant photograph integration

Backend: no photo field on `applicants`. A photograph is an `uploaded_files` row
(`applicant=<id>`, `category=photograph`), bytes only via the audited download
endpoint. No URL exists anywhere in a payload; nothing marks a primary photo, so
"the photograph" = newest current, non-archived `photograph` file.

Decisions (confirmed with user):

- Upload lives on the applicant **edit** form, not create (create has no id yet).
- Templates: auto-fill from the applicant's photograph, manual URL override kept.
- Editing the photo inside a CV/certificate form uploads to the applicant
  (replace → version chain), so it updates everywhere at once.
- App scope: grandway only.
- Surfaces: applicant detail header, applicant list rows, journey/offer detail,
  documents workspace sidebar.

## Phase 1 — Photograph data layer

- [x] `photograph/applicantPhotograph.utils.ts` — photo extension allowlist, "newest current" picker
- [x] `photograph/applicantPhotograph.hooks.ts` — `useApplicantPhotograph`, `useSaveApplicantPhotograph` (upload-or-replace)
- [x] `photograph/index.ts` barrel + export from the applicants module barrel

## Phase 2 — Shared components

- [x] `ApplicantPhoto/` — resolved-blob avatar with initials fallback, loading + error states
- [x] `ApplicantPhotoField/` — file picker + preview, used by the edit form and the document forms

## Phase 3 — Applicant edit form

- [x] `photograph` added to `ApplicantFormValues` (edit mode only)
- [x] Photo control in step 1, with size/type validation
- [x] Edit page uploads after the PATCH resolves; create page unaffected

## Phase 4 — Display surfaces

- [ ] `ProfileSidebar` gains `avatarSrc`
- [ ] Applicant detail header
- [ ] Applicant list rows (thumbnail column)
- [ ] Journey detail + offer detail
- [ ] Documents workspace sidebar

## Phase 5 — Documents / templates

- [ ] `StudentFullData.photoUrl` + `DocumentEditorProvider` resolves it
- [ ] `createCvTemplateAdapter` feeds `image` (covers all 4 CV templates)
- [ ] `CertificateTemplate` feeds `image`
- [ ] Photo control in the 5 student doc forms; europass "Photo URL" becomes the override

## Phase 6 — Verification

- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] Update `docs/AI.md` for applicants + uploaded-files + documents
- [ ] Adversarial review of the diff, apply fixes
