# Bank / LOR / MOI form microcopy + fixes

## Phase 1 — Bank statement & certificate (in-place microcopy)

- [ ] BankStatementForm.tsx — sentence-case labels, placeholders, descriptions
- [ ] BankCertificateForm.tsx — sentence-case labels, placeholders, descriptions

## Phase 2 — LOR & MOI (route through shared schema renderer)

- [ ] utils/letterFormSchema.ts — LOR/MOI field metadata (label/control/placeholder/section) + buildLorSchema/buildMoiSchema (dedupe, institution constants as defaults)
- [ ] sharedForms.tsx — rewrite createLorForm/createMoiForm to render via WodaForm schema (fixes duplicate + snake_case fields, adds prefill + honorific/pronoun controls)

## Phase 3 — Verify

- [ ] pnpm format && check-types && lint (own files)
- [ ] Dual adversarial review of the diff
- [ ] Delete this todo file
