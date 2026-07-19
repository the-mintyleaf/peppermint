# WODA forms rebuild

## Phase 1 — Schema engine + renderer

- [x] `utils/wodaFormSchema.ts` — WodaControl / WodaField / WodaSection / WodaFormSchema types + occupation column type
- [x] `components/WodaForm/OccupationsField.tsx` — repeatable table (add/remove rows, variant-aware columns)
- [x] `components/WodaForm/WodaForm.tsx` — schema renderer (initialValues merge + prefill, Fieldset sections, half-width pairing, control mapping)
- [x] `components/WodaForm/WodaForm.types.ts` + `index.ts`
- [x] `utils/wodaCommonSections.ts` — HONORIFICS/RELATIONS consts + field/section builders

## Phase 2 — Convert the 10 factory variants

- [x] woda-surname
- [x] woda-address
- [x] woda-dob
- [x] woda-fiscal
- [x] woda-income
- [x] woda-occupation
- [x] woda-tax-clearance
- [x] woda-migration
- [x] woda-relationship
- [x] woda-agriculture-income

## Phase 3 — Convert custom variant

- [x] woda-affidavit-financial

## Phase 4 — Cleanup + surface

- [x] Remove `createWodaForm` from `utils/sharedForms.tsx`
- [x] Bump CreateDocumentModal size md → lg

## Phase 5 — Verify

- [ ] pnpm format && check-types && lint
- [ ] Dual adversarial review of the diff
- [ ] Delete this todo file
