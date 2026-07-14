# Frontend Agentic Standards

These rules apply to all frontend work across apps and packages. Read this file when doing any frontend feature work. Skip it for config changes, package.json edits, or backend-only tasks.

---

### Read-before-write protocol

Before creating or editing frontend code, always inspect the relevant existing context first.

Required reading order:

1. App-level design docs:
   - `apps/<app>/docs/design/design-system.md`
   - `apps/<app>/docs/design/motion-system.md`
   - `apps/<app>/docs/design/DESIGN.md`

2. Relevant module docs under:
   - `apps/<app>/docs/modules/`
   - `apps/<app>/modules/<group>/<module>/docs/` if present

3. Existing components, hooks, stores, utils, and query patterns in the same module.
4. Shared package exports, especially `@peppermint/ui`, before creating new UI.
5. Similar existing implementations elsewhere in the repo.

Do not create a new component, hook, store, util, pattern, or visual style until existing reusable options have been checked.

If required context is missing, ask before inventing a pattern. If the assumption is minor and reversible, document it in the relevant docs file.

---

### App documentation bootstrap

When creating a new app, always create:

```txt
apps/<app-name>/docs/
├── design/
│   ├── design-system.md
│   ├── motion-system.md
│   └── DESIGN.md
├── components/
├── modules/
├── utils/
├── patterns/
├── decisions/
└── api-contracts/
```

Required docs:

- `design-system.md` — design tokens, typography, spacing, color, radius, shadow, layout, breakpoints, component rules, and usage constraints.
- `motion-system.md` — animation philosophy, reusable motion functions, durations, easings, reduced-motion behavior, and motion anti-patterns.
- `DESIGN.md` — full product design direction, visual personality, component mood, interaction principles, layout guidance, and examples of how the app should feel.
- `components/` — one doc per meaningful reusable component.
- `modules/` — one doc per major module.
- `utils/` — utility behavior, examples, and edge cases.
- `patterns/` — repeated app patterns such as filters, tables, drawers, forms, command menus, empty states, and page shells.
- `decisions/` — architecture and product decisions that should not be repeatedly re-decided.
- `api-contracts/` — frontend assumptions about backend DTOs, mock data, pending APIs, and response shapes.

Creating and updating docs is mandatory. Code is not complete until the related docs are updated.

Use `/bootstrap-docs <app-name>` to scaffold this structure automatically.

---

### Design system enforcement

All visual work must follow the app design system and motion system.

Never introduce one-off visual values unless they are documented and justified.

Avoid:

- raw hex colors
- arbitrary spacing values
- arbitrary border radii
- arbitrary shadows
- arbitrary z-index values
- one-off gradients
- one-off font sizes
- one-off animation durations
- inconsistent icon sizes
- custom layout patterns that duplicate existing ones

Use design tokens, Mantine theme values, and documented app patterns first.

If a new visual decision is genuinely needed, update:

```txt
apps/<app>/docs/design/design-system.md
apps/<app>/docs/design/DESIGN.md
```

If a new motion behavior is added, update:

```txt
apps/<app>/docs/design/motion-system.md
```

---

### Component quality standard

A finished component must be:

- typed with a dedicated `.types.ts` file
- accessible by default
- responsive or explicitly documented as desktop-only
- visually aligned with the design system
- efficient in rendering and state ownership
- documented if reusable or non-trivial
- exported through the correct barrel file
- free of duplicated logic that already exists elsewhere

Components should be composable, not overly abstract.

Do not create reusable components prematurely. Create a reusable component only when:

1. it is used in more than one place, or
2. it represents a stable design-system pattern, or
3. it significantly improves readability of a complex module.

For form-like components, clearly define whether the component is:

- controlled
- uncontrolled
- internally managed

Do not mix these patterns without documenting why.

---

### Required UI states

Every data-driven module or component must handle the full UI lifecycle.

Required states:

- loading
- empty
- error
- success
- disabled
- pending mutation
- permission denied, when applicable
- no search results, when applicable
- offline or failed network state, when applicable

Never build only the happy path.

Loading states should use skeletons when the final layout is known. Use spinners only for small localized actions.

Mutation buttons must clearly show pending state and prevent duplicate submissions.

Errors must be visible, actionable, and not swallowed silently.

---

### Responsive standards

Every module must be checked against desktop, tablet, and mobile widths.

At minimum, consider:

- wide desktop
- standard laptop
- tablet
- mobile

If a feature cannot reasonably support small screens, document the minimum supported width and provide a graceful fallback.

Canvas-heavy, table-heavy, analytics-heavy, or organization-builder screens may use a desktop-first layout, but they must still avoid broken overflow, hidden actions, and unusable controls.

Responsive behavior must be intentional, not accidental.

---

### Accessibility standards

Target WCAG 2.1 AA.

Required accessibility rules:

- Use semantic HTML first.
- Do not use clickable `div`s.
- Icon-only buttons must have accessible labels.
- All interactive elements must be keyboard reachable.
- Focus states must be visible.
- Modals, drawers, popovers, and command menus must handle focus correctly.
- Forms must have labels, descriptions where needed, and field-level error messages.
- Tables must use proper table semantics.
- Color must not be the only way to communicate meaning.
- Motion must respect reduced-motion preferences.
- Destructive actions must be clearly identified and confirm when needed.

Do not add ARIA as a replacement for correct HTML.

---

### Motion standards

Motion should improve clarity, not decorate randomly.

Allowed uses:

- entering and exiting overlays
- revealing nested content
- drag/drop feedback
- state transitions
- focus or selection feedback
- subtle page/module transitions
- skeleton shimmer only when appropriate

Avoid:

- slow animations
- layout-shifting animations
- repeated decorative motion
- animations that block interaction
- different easing styles in the same module
- motion that ignores reduced-motion settings

Any animation longer than 300ms must be justified and must respect reduced motion.

Reusable motion helpers should live in an appropriate utility location and be documented in `motion-system.md`.

---

### Performance standards

Frontend code must be efficient by default.

Required rules:

- Keep `"use client"` boundaries as small as possible.
- Do not convert full pages or layouts into client components unless necessary.
- Avoid unnecessary global state.
- Avoid storing derived data in state.
- Avoid expensive computation inside render.
- Memoize only when it solves a real render problem.
- Virtualize long lists, large tables, and large search results.
- Lazy-load heavy modules, charts, editors, canvas tools, and rarely used dialogs.
- Avoid wrapping large trees in Framer Motion unless needed.
- Avoid unnecessary context updates across large subtrees.
- Do not create new Zustand stores for state that belongs locally, in URL params, or in React Query.

For canvas, organization-tree, kanban, analytics, and dashboard modules, explicitly consider render cost before adding state or animation.

---

### State ownership refinement

Use the smallest correct state owner.

State ownership rules:

- Server data, cache, async status, mutations → React Query
- Shareable route state such as filters, tabs, pagination, selected entity IDs → URL search params
- Global interactive client state → Zustand
- Scoped subtree dependencies → React Context
- Temporary UI state → local `useState`
- Derived values → compute from source state, do not duplicate in state

Before creating a Zustand store, check whether the state should instead live in:

- local component state
- parent props
- React Query cache
- URL search params
- React Context

React Context should not be used for frequently changing high-volume state unless the subtree is small and intentional.

---

### URL and navigation standards

Use URL state when the state should be shareable, restorable, bookmarkable, or browser-navigation friendly.

Common URL-owned state:

- active tab
- search query
- filters
- sort
- pagination
- selected entity
- view mode
- date range

Do not hide important navigation state only in local state when users would expect refresh/back/share to preserve it.

---

### Forms standards

Forms must use `@mantine/form` through `@peppermint/ui`.

Every form must define:

- initial values
- validation rules
- submit behavior
- pending state
- disabled state
- field-level error display
- server-error handling
- reset/cancel behavior when applicable

Submit buttons must prevent duplicate submissions.

Server validation errors must be mapped back to fields when possible.

Complex forms must have a short doc explaining structure, validation, and API assumptions.

Do not use React Hook Form, Formik, or other form libraries.

---

### API contract standards

Do not guess backend contracts silently.

When API contracts are available:

- use the real DTO shape
- keep mapping logic outside visual components
- document query keys and mutation behavior

When API contracts are missing:

- create explicit local mock types
- mark mock data clearly
- document assumptions in `docs/api-contracts/`
- avoid spreading invented fields across components
- isolate mock data so it can be replaced cleanly

Components should not directly depend on unstable backend response shapes when a mapper or adapter would make the UI safer.

---

### Data fetching standards

All server state must use React Query.

Required rules:

- No data fetching in `useEffect`.
- No Axios calls inside event handlers.
- Query keys live next to query functions.
- Mutations use `useMutation`.
- Invalidation must be explicit and scoped.
- Optimistic updates must include rollback behavior.
- Query loading, empty, and error states must be represented in the UI.

Use React Query cache intentionally. Do not duplicate server data into Zustand unless there is a documented reason.

---

### Documentation standards for components, modules, and utilities

When creating or significantly updating a reusable component, add or update:

```txt
apps/<app>/docs/components/<component-name>.md
```

Component docs should include:

- purpose
- when to use
- when not to use
- props summary
- states
- accessibility notes
- responsive behavior
- design-system notes
- examples if useful

When creating or significantly updating a major module, add or update:

```txt
apps/<app>/docs/modules/<module-name>.md
```

Module docs should include:

- purpose
- module type
- routes, if any
- major components
- state ownership
- data dependencies
- user flows
- loading/error/empty states
- permissions, if any
- design and motion notes
- known assumptions

When creating or significantly updating a utility, add or update:

```txt
apps/<app>/docs/utils/<utility-name>.md
```

Utility docs should include:

- purpose
- input/output
- examples
- edge cases
- where it is used

---

### Verification & Testing Standards

> **Scope rule:** Items 1–2 apply to every task; item 22 to every task that touches visual `.tsx` files (its own scope rule). All other categories apply when the task touches that area. Do not run all 22 categories for a one-line CSS fix.
>
> **ACTIVE vs DORMANT:** Categories marked **DORMANT** describe standards whose runner is not configured in this repo yet (no test framework, no analyzer, no Storybook app). They remain the target for when that infra lands. For a DORMANT category: **do not invent or run its scripts** (`rules.md`: only run commands that exist) — verify the checklist items manually where feasible and note what could not be verified. The only runnable scripts today are the root `package.json` scripts (`build`, `dev`, `lint`, `format`, `format:check`, `check-types`) plus native pnpm commands (`install`, `audit`).

A task is not complete until code, docs, exports, and checks are all handled.

---

#### 1. Install, build, and environment sanity

Run:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

Checks:

- App installs without dependency errors.
- Production build succeeds.
- No TypeScript, bundler, or route generation errors.
- No broken imports.
- No missing environment variables.
- No client-side use of server-only secrets.
- No hardcoded local URLs like `localhost`, `127.0.0.1`, staging tokens, or test API keys.

---

#### 2. Static quality checks

Run:

```bash
pnpm lint
pnpm check-types
pnpm format:check
```

`pnpm check-types` (turbo) now type-checks the `mintflow` app too (it has a
`check-types` script). App-level type errors surface here, not only in `pnpm build`.

Also run:

```bash
grep -rE '#[0-9a-fA-F]{3,6}\b' apps/ packages/ --include="*.tsx" --include="*.ts" --include="*.css"
```

Checks:

- ESLint passes.
- TypeScript passes with no `any` abuse unless justified.
- No unused variables, dead components, unused files, or unreachable code.
- No `console` spam except intentional logging.
- No `TODO`, `FIXME`, or temporary hacks left in production paths.
- No duplicated components when an existing shared component could be reused.
- No hardcoded hex colors or arbitrary pixel values — use design tokens only.

---

#### 3. Unit tests — DORMANT (no runner configured; do not invent scripts)

Run (once a runner exists — not today):

```bash
pnpm test
pnpm test:coverage
```

Test:

- Utility functions.
- Date, currency, number, and status formatting.
- Permission/role helpers.
- Data mappers and transformers.
- Form validation rules.
- Table filtering/sorting helpers.
- State reducers/stores.
- Edge cases: empty array, null, undefined, invalid input, very long text.

Minimum pass rule:

- Core business logic must be covered.
- No snapshot-only fake coverage.
- Critical helpers should have positive, negative, and edge-case tests.

---

#### 4. Component tests — DORMANT (no runner configured; do not invent scripts)

Use Vitest/Jest + Testing Library.

Run (once a runner exists — not today):

```bash
pnpm test:components
```

Test:

- Component renders correctly with normal data.
- Component renders correctly with empty data.
- Loading state appears.
- Error state appears.
- Disabled state works.
- Required fields show validation.
- Buttons, menus, drawers, dialogs, modals, tabs, tables, filters, and pagination behave correctly.
- Keyboard interaction works for menus, dialogs, dropdowns, and forms.

Prefer queries in this order: `getByRole()` → `getByLabelText()` → `getByText()` → `getByPlaceholderText()`.

Avoid fragile tests based on implementation details like internal class names.

---

#### 5. Integration tests — DORMANT (no runner configured; do not invent scripts)

Test full feature behavior, not isolated UI pieces.

Examples:

- Create item flow.
- Edit item flow.
- Delete item flow.
- Search/filter/sort flow.
- Form submit with API success.
- Form submit with API validation error.
- Drawer/modal opens, saves, closes, and refreshes list.
- Route params load correct data.
- User permissions hide or disable forbidden actions.
- Optimistic updates roll back on failure.
- Cache invalidation works after mutation.
- Empty, loading, error, and success states are all reachable.

**Data persistence round-trip:** For every create/edit flow, verify the data survives a hard refresh — not just that the API returned a success response.

---

#### 6. End-to-end browser tests — DORMANT (no runner configured; do not invent scripts)

Use Playwright or Cypress.

Run (once a runner exists — not today):

```bash
pnpm test:e2e
```

Test on: Chromium · Firefox · WebKit/Safari where possible.

E2E flows:

- User can open the page.
- User can complete the main happy path.
- User can recover from validation errors.
- User can navigate away and back.
- User can refresh without losing required state.
- Protected routes redirect correctly.
- Forbidden users cannot access restricted UI.
- Deep links work.
- Back/forward browser navigation works.
- Toasts/notifications appear correctly.
- Destructive actions require confirmation.
- Cancel buttons actually cancel.

---

#### 7. Visual regression tests — DORMANT (no tooling configured; `/visual-review` covers the manual variant)

Test:

- Dashboard · list/table · detail page · create/edit form.
- Empty state · loading state · error state.
- Dark mode · mobile · tablet · desktop.

Checks:

- No layout shift, clipped text, overlapping buttons, or broken spacing.
- No unreadable contrast, hidden actions, or modal/drawer overflow.
- No broken icons, images, or scrollbars.

---

#### 8. Accessibility tests — DORMANT script, ACTIVE manual checks

There is no `test:a11y` script yet — run the checklist below manually (axe DevTools or Playwright accessibility snapshot when available).

Use axe, Playwright accessibility checks, or equivalent.

Also test manually with `prefers-reduced-motion` enabled (Chrome DevTools → Rendering → Emulate CSS media → prefers-reduced-motion: reduce). Verify no jarring or fully-disabled animations, as required by the `useReducedMotion()` rule in CLAUDE.md.

Checks:

- All inputs have labels. Buttons have accessible names. Icon-only buttons have `aria-label`.
- Dialogs trap focus. Escape closes overlays. Focus returns to trigger on close.
- Tab order is logical. Keyboard-only users can complete main flows.
- Color contrast meets WCAG 2.1 AA. Color is not the sole communicator.
- Error messages are announced or clearly connected to fields.
- Images have meaningful `alt` or empty `alt=""` when decorative.
- No duplicate IDs. No inaccessible custom dropdowns.
- Tables have proper headers. Page has correct heading structure.
- `prefers-reduced-motion` disables or reduces all animations > 300ms.

---

#### 9. Responsive design tests

Test at: 320px · 375px · 390px · 430px · 768px · 1024px · 1280px · 1440px · 1920px.

Checks:

- No horizontal scroll unless intentionally designed.
- Navigation, forms, tables, drawers/modals all work at each breakpoint.
- Buttons are tappable. Text does not overflow cards. Sticky elements do not cover content.
- Empty/error/loading states work on all sizes.

---

#### 10. Performance and optimization tests — DORMANT tooling (`analyze`/`lighthouse` not configured)

Run:

```bash
pnpm build
```

Core Web Vitals targets: LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1.

Checks:

- Initial JS bundle is not too large. Heavy components are lazy-loaded.
- Images are compressed and correctly sized. Fonts are optimized.
- No unnecessary re-renders or expensive render-path calculations.
- No huge dependencies for tiny features. No duplicate libraries.
- Route-level code splitting works. Loading skeletons appear for slow data.
- Large lists use pagination or virtualization. Animations do not cause jank.

---

#### 11. Bundle and dependency tests — DORMANT analyzer (`pnpm analyze` not configured)

Run:

```bash
pnpm build && pnpm audit
```

Checks:

- No unexpected large package added. No duplicate versions of major libraries.
- No unused or vulnerable dependency. Lockfile is committed.
- Tree-shaking works. Icons imported individually (not as full icon pack).
- Chart, editor, drag/drop, or date libraries are justified.

---

#### 12. Security tests

Run:

```bash
pnpm audit
```

Also inspect code manually.

Checks:

- No secret or private API key in frontend bundle.
- No `dangerouslySetInnerHTML` unless sanitized and documented.
- No rendering raw user input as HTML. User-generated text is escaped.
- URL params and redirect URLs are sanitized/validated.
- File uploads validate type and size client-side (not relied upon as sole defense).
- Auth tokens not stored unsafely. No sensitive data in logs, query params, or `localStorage`.
- Protected UI backed by backend checks — hidden buttons are not real security.
- CSP headers considered for production. Third-party scripts minimized.

Security payload tests (must render as harmless text):

```
<script>alert(1)</script>
<img src=x onerror=alert(1)>
javascript:alert(1)
"><svg/onload=alert(1)>
```

---

#### 13. Form tests

Test every form with: valid input · empty required fields · invalid email/phone · long text · special characters · duplicate submit · slow network · failed request · server validation error · success · cancel · reset · unsaved-changes warning.

Checks:

- Submit button disables while submitting. User cannot double-submit.
- Error messages are clear. Focus moves to first invalid field.
- Form does not lose user input after a recoverable error. Success state is obvious.

---

#### 14. API and network tests

Checks:

- Correct endpoint, HTTP method, and payload shape.
- Loading/error states appear. Retry behavior works if designed.
- 401 → login redirect. 403 → forbidden state. 404 → not found. 500 → graceful error.
- Offline/timeout behavior is acceptable.
- API calls are cancelled when component unmounts. No infinite loops or duplicate fetches.

---

#### 15. State management tests

Checks:

- State initializes correctly and resets on page exit if required.
- Filters persist only when intended. Selected items clear after delete.
- Modal/drawer state does not leak between routes.
- Optimistic state matches server after refetch. Cache invalidates after create/edit/delete.
- No stale Zustand or React Query state in UI. No memory leaks from subscriptions.
- **React Query cache reconciliation:** After every mutation, optimistic UI converges with the server response on refetch. No stale cache survives after explicit invalidation.

---

#### 16. Routing and navigation tests

Checks:

- All routes load. Invalid route shows 404. Back button and refresh work on nested pages.
- Direct URL access works. Breadcrumbs and active nav item are correct.
- Query params preserved when needed, removed on reset.
- Protected and role-based routes enforce access.
- **URL shareability:** A URL with filter/tab/sort/pagination params must reproduce the same view when opened in a new tab. Required — STANDARDS.md mandates URL state for shareable UI.

---

#### 17. Error boundary tests

Checks:

- Component crash does not blank the entire app.
- Error boundary shows a useful fallback. User can retry or navigate away.
- Errors are logged to monitoring if configured.
- Failed dynamic imports are handled. Suspense fallback appears correctly.

---

#### 18. UX polish tests

Checks:

- Loading states are not blank. Empty states tell user what to do next. Error states are human-readable.
- Buttons have clear labels. Destructive actions are visually distinct. Success actions show feedback.
- Long names truncate. Tooltips appear where needed. Skeletons match final layout.
- Page title is correct. Cursor and disabled states are correct. Animations are smooth and not excessive.

---

#### 19. Storybook component story tests — DORMANT (no `apps/storybook` app exists yet)

Every public-facing UI component in `@peppermint/*` packages must have a story in `apps/storybook` once that app exists.

Stories must cover at minimum: default · loading · empty · error · disabled · dark mode · responsive/constrained-width.

Checks:

- All stories render without console errors.
- Interactive stories verify expected user interactions.
- Story data is realistic, not lorem ipsum placeholder.

---

#### 20. Session and authentication lifecycle tests

Distinct from API-level 401 handling in #14 — test the full user session lifecycle.

Checks:

- **Token expiry mid-session:** Expires while user is active → graceful redirect or refresh prompt, not a blank error page.
- **Token refresh:** Succeeds → user continues without interruption; current view state preserved.
- **Multi-tab logout sync:** Logout in Tab A → Tab B detects expired session on next interaction.
- **Session timeout warning:** If designed, warning appears before expiry with option to extend.
- **Hard refresh after expiry:** Any protected route → redirect to login, not a 401 rendered in UI.
- **Post-login redirect:** After login, user lands on the originally requested page, not always the dashboard.

---

#### 21. Browser compatibility tests

Test on: Chrome · Firefox · Safari/WebKit · Mobile Safari · Android Chrome (where possible).

Checks:

- CSS, sticky/fixed elements, scroll containers, and date inputs work across browsers.
- Drag/drop, file upload, copy/paste, and keyboard shortcuts behave correctly.

---

#### 22. UI design (applies to visual components, pages, layouts, forms, tables, dashboards)

> Scope rule: Run this category whenever the task touches any `.tsx` file in `layouts/`, `modules/`, or `components/`. Skip for config-only, type-only, or backend changes.

Doctrine reference: `.claude/DESIGN.md`

**Output contract — all required states present or explicitly N/A:**

- [ ] Empty state (no data yet)
- [ ] No-results state (filtered to nothing) — required for filterable lists
- [ ] Loading and partial loading states
- [ ] Request-failed state with retry path
- [ ] Permission-denied state
- [ ] Read-only mode (when applicable)
- [ ] Archived/deleted record state (when applicable)
- [ ] Conflicting edits state (when applicable — multi-user forms)
- [ ] Unsaved changes warning (forms and settings)
- [ ] Long-running / background job state (when applicable)

**Design non-negotiables:**

- [ ] Page has one dominant anchor; regional anchors subordinate and non-competing (§1.1)
- [ ] State ≠ Action: badge/fact and button/lever look different and sit in different positions (§1.9)
- [ ] Status expressed as words + color + position — never color alone (Layer 4)
- [ ] Actions labeled by risk tier (safe / important / risky / destructive); destructive ones spatially separated (§1.5, Layer 5)
- [ ] Recovery path exists for every consequential action (undo / audit / retry / restore) (Layer 5)
- [ ] Confirmations for dangerous actions state what happens, who is affected, and whether it's reversible — not just "Are you sure?" (§1.10)
- [ ] Consistent components: table, drawer, confirmation, badge reused from `@peppermint/ui` — no per-page reinvention (§1.8)

**Decision ladder applied when principles conflict:**
Safety > Truth > Clarity > Speed > Density > Consistency > Aesthetics

**Verification steps:**

- [ ] `/verify` Step 2b (design scan) ran and passed — no BLOCK violations, WARN items reviewed
- [ ] `/design-check` run for new page patterns, complex flows, or pre-release polish

---

#### 23. Production readiness tests

Run before final answer (runnable subset — `clean`/`test`/`test:e2e` have no scripts yet):

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm check-types
pnpm build
pnpm audit
```

Checks:

- Fresh install works from scratch. No hidden dependency on local cache.
- Production build succeeds. No generated files missing.
- No broken deployment output. No source maps exposing secrets.
- No debug UI, test routes, or hardcoded environment values in production.

---

### Storybook and preview standards

When Storybook exists, reusable visual components should include stories.

Stories should cover:

- default
- loading
- empty
- error
- disabled
- selected/active
- responsive or constrained-width examples
- dark mode, if supported

If Storybook does not exist, do not add it unless explicitly asked. For complex visual work, create an app-local preview only if the existing app has a preview pattern.

---

### Agentic Git workflow

Never work directly on `main`.

For major modules, frameworks, refactors, or tasks spanning multiple phases:

1. Create a branch: `git checkout -b dev/<work-name>`
2. Create a task todo file: `.todo/<work-name>-todo.md`
3. Track each phase as a checkbox.
4. Commit after each meaningful phase.
5. Update docs before the final commit.
6. Run `/verify` before opening the PR.
7. Push the branch.
8. Open or prepare one PR per task/feature — not one per phase. Use `/pre-pr` to automate.

Use atomic commits. Do not create noisy commits for tiny incomplete edits.

Preferred commit style:

```txt
[<package-or-app>/<area>] <type>: <description>
```

PR description must include:

- summary
- changed files/areas
- screenshots or visual notes for UI work
- docs updated
- checks run
- known risks
- follow-up tasks, if any

If the environment cannot create a PR directly, prepare the PR title and body in the final response.

---

### Dependency standards

Do not add new dependencies unless necessary.

Before adding a dependency:

1. Check whether the repo already has an equivalent package.
2. Check whether `@peppermint/ui`, `@peppermint/utils`, or app-local utilities already solve the need.
3. Explain why the new dependency is needed.
4. Confirm it does not duplicate existing stack responsibilities.

Never add a new styling, form, data-fetching, state-management, animation, icon, or date library without explicit approval.

---

### Security and safety standards

Frontend code must avoid unsafe patterns.

Rules:

- Never expose secrets in frontend code.
- Never hardcode private tokens, API keys, or credentials.
- Never log sensitive user data.
- Sanitize or safely render user-generated HTML.
- Avoid `dangerouslySetInnerHTML`; if needed, document why and sanitize input.
- Validate file uploads on the client where applicable, but do not rely on client validation alone.
- Do not store sensitive auth data in Zustand or localStorage unless the architecture explicitly allows it.

---

### Final response standard for coding agents

When finishing a task, respond with:

- what changed
- docs updated
- checks run
- files touched at a high level
- any assumptions
- any follow-up needed

Do not write long explanations unless asked.

If the task is incomplete, clearly say what is done, what is not done, and why.
