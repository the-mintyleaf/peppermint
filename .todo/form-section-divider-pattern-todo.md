# Form section: bordered card → Divider + heading

## Phase 1 — Reusable FormSection component

- [x] Create apps/grandway/components/FormSection/{FormSection.tsx,FormSection.types.ts,index.ts}
- [x] Wire into apps/grandway/components barrel (N/A — no top-level barrel; imported as @/components/FormSection)
- [x] Commit Phase 1

## Phase 2 — Convert Fieldset forms

- [x] JourneyForm.tsx — 3 Fieldsets → FormSection
- [x] offers ReferenceFields.tsx — decision section (header toggle button)
- [x] offers MoneyFields.tsx — 3 Fieldsets → FormSection (covers create + edit)
- [x] offers ConditionsRepeater.tsx — FormSection + "Add condition" in actions
- [x] OfferCreateForm.tsx — "Offer details" Divider → FormSection
- [x] OfferEditForm.tsx — wrap OfferBasicsFields in "Offer details" FormSection
- [x] ChecklistCreateForm.tsx — decision section (header toggle button)
- [x] WodaForm.tsx — Fieldset map → FormSection map (description prop)
- [ ] Commit Phase 2 + post-phase review

## Phase 3 — Unify Divider-label forms

- [x] ProgramForm.tsx — Divider label → FormSection
- [x] BankCertificateForm.tsx — Divider+Text → FormSection
- [x] BankStatementForm.tsx — Divider+Text → FormSection (Transactions actions preserved)
- [x] Commit Phase 3
- [x] Post-phase review (Phase 1+2 adversarial) — findings addressed in commit 81cc8ce
      (role=group/aria-labelledby, toggle aria-labels, wrap, WodaForm doc, AI.md).
      Finding "journey-gated body" dismissed: pre-existing behavior, out of scope.

## Phase 4 — Verify

- [x] format (own files) — prettier clean on all touched files
- [x] check-types — grandway `tsc --noEmit` exit 0
- [x] lint — eslint exit 0 on every touched file
- [ ] Visual review affected surfaces (light + dark) — DEFERRED: needs running app +
      opening each modal; offered to user.
