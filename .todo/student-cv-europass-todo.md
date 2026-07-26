# Todo: Add Europass CV template to Grandway document stack

## Phase 0 — Pre-build design + tracking

- [x] Create this todo file
- [x] Design reasoning for Europass CV (section/field order fixed by the PDF; form uses module's `useForm` convention)

## Phase 1 — Data model + registration

- [x] Extend `CvContent` in `documents.types.ts` (`place_of_birth?`, `mother_tongue?`, `languages?[]`, `appearance?`)
- [x] Extend `DocumentConfigBarProps` with optional `onPersist?`
- [x] Add `student-cv-europass` slug to `documentTypeDefinitions.ts` student list
- [x] Register type + ConfigBar in `documentTypeConfig.ts`
- [x] Add `student-cv-europass` seed to `utils/defaultDocumentContent.ts`
- [x] Surface in `AddPageMenu` (getStudentMenuTypes) + route to create modal (usesCreateModal)

## Phase 2 — Raw Europass template

- [x] `components/templates/student-cv-europass/index.tsx` (Europass layout, appearance-driven)
- [x] `components/templates/student-cv-europass/template.module.css` (print/page-break rules)
- [x] `appearance.ts` with `readableTextColor()` + swatches + font stacks (no util existed)

## Phase 3 — Wrapper + form

- [x] `document-types/student-cv-europass/CvEuropassTemplate.tsx`
- [x] `document-types/student-cv-europass/CvEuropassForm.tsx` (place_of_birth, mother_tongue, CEFR languages; preserve `appearance` on submit)
- [x] `document-types/student-cv-europass/index.ts` barrel

## Phase 4 — Right-nav ConfigBar + persistence wiring

- [x] `document-types/student-cv-europass/CvEuropassConfigBar.tsx` (color swatches + serif/sans toggle)
- [x] Thread `onPersist` through `HistorySidebar.tsx` → `updateDocumentContent`

## Phase 5 — Verify + finalize

- [x] `pnpm format && pnpm check-types && pnpm lint` (green; only pre-existing warnings)
- [ ] Dual adversarial review + apply fixes
- [ ] Commit; delete this todo file
- [ ] Manual/visual test by user (add type, swatch/font change, reload persistence, multipage print)
