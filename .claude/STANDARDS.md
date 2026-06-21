# Frontend Agentic Standards

These rules apply to all frontend work across apps and packages. Read this file when doing any frontend feature work. Skip it for config changes, package.json edits, or backend-only tasks.

---

### Read-before-write protocol

Before creating or editing frontend code, always inspect the relevant existing context first.

Required reading order:

1. App-level design docs:

   * `apps/<app>/docs/design/design-system.md`
   * `apps/<app>/docs/design/motion-system.md`
   * `apps/<app>/docs/design/DESIGN.md`
2. Relevant module docs under:

   * `apps/<app>/docs/modules/`
   * `apps/<app>/modules/<group>/<module>/docs/` if present
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

* `design-system.md` — design tokens, typography, spacing, color, radius, shadow, layout, breakpoints, component rules, and usage constraints.
* `motion-system.md` — animation philosophy, reusable motion functions, durations, easings, reduced-motion behavior, and motion anti-patterns.
* `DESIGN.md` — full product design direction, visual personality, component mood, interaction principles, layout guidance, and examples of how the app should feel.
* `components/` — one doc per meaningful reusable component.
* `modules/` — one doc per major module.
* `utils/` — utility behavior, examples, and edge cases.
* `patterns/` — repeated app patterns such as filters, tables, drawers, forms, command menus, empty states, and page shells.
* `decisions/` — architecture and product decisions that should not be repeatedly re-decided.
* `api-contracts/` — frontend assumptions about backend DTOs, mock data, pending APIs, and response shapes.

Creating and updating docs is mandatory. Code is not complete until the related docs are updated.

Use `/bootstrap-docs <app-name>` to scaffold this structure automatically.

---

### Design system enforcement

All visual work must follow the app design system and motion system.

Never introduce one-off visual values unless they are documented and justified.

Avoid:

* raw hex colors
* arbitrary spacing values
* arbitrary border radii
* arbitrary shadows
* arbitrary z-index values
* one-off gradients
* one-off font sizes
* one-off animation durations
* inconsistent icon sizes
* custom layout patterns that duplicate existing ones

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

* typed with a dedicated `.types.ts` file
* accessible by default
* responsive or explicitly documented as desktop-only
* visually aligned with the design system
* efficient in rendering and state ownership
* documented if reusable or non-trivial
* exported through the correct barrel file
* free of duplicated logic that already exists elsewhere

Components should be composable, not overly abstract.

Do not create reusable components prematurely. Create a reusable component only when:

1. it is used in more than one place, or
2. it represents a stable design-system pattern, or
3. it significantly improves readability of a complex module.

For form-like components, clearly define whether the component is:

* controlled
* uncontrolled
* internally managed

Do not mix these patterns without documenting why.

---

### Required UI states

Every data-driven module or component must handle the full UI lifecycle.

Required states:

* loading
* empty
* error
* success
* disabled
* pending mutation
* permission denied, when applicable
* no search results, when applicable
* offline or failed network state, when applicable

Never build only the happy path.

Loading states should use skeletons when the final layout is known. Use spinners only for small localized actions.

Mutation buttons must clearly show pending state and prevent duplicate submissions.

Errors must be visible, actionable, and not swallowed silently.

---

### Responsive standards

Every module must be checked against desktop, tablet, and mobile widths.

At minimum, consider:

* wide desktop
* standard laptop
* tablet
* mobile

If a feature cannot reasonably support small screens, document the minimum supported width and provide a graceful fallback.

Canvas-heavy, table-heavy, analytics-heavy, or organization-builder screens may use a desktop-first layout, but they must still avoid broken overflow, hidden actions, and unusable controls.

Responsive behavior must be intentional, not accidental.

---

### Accessibility standards

Target WCAG 2.1 AA.

Required accessibility rules:

* Use semantic HTML first.
* Do not use clickable `div`s.
* Icon-only buttons must have accessible labels.
* All interactive elements must be keyboard reachable.
* Focus states must be visible.
* Modals, drawers, popovers, and command menus must handle focus correctly.
* Forms must have labels, descriptions where needed, and field-level error messages.
* Tables must use proper table semantics.
* Color must not be the only way to communicate meaning.
* Motion must respect reduced-motion preferences.
* Destructive actions must be clearly identified and confirm when needed.

Do not add ARIA as a replacement for correct HTML.

---

### Motion standards

Motion should improve clarity, not decorate randomly.

Allowed uses:

* entering and exiting overlays
* revealing nested content
* drag/drop feedback
* state transitions
* focus or selection feedback
* subtle page/module transitions
* skeleton shimmer only when appropriate

Avoid:

* slow animations
* layout-shifting animations
* repeated decorative motion
* animations that block interaction
* different easing styles in the same module
* motion that ignores reduced-motion settings

Any animation longer than 300ms must be justified and must respect reduced motion.

Reusable motion helpers should live in an appropriate utility location and be documented in `motion-system.md`.

---

### Performance standards

Frontend code must be efficient by default.

Required rules:

* Keep `"use client"` boundaries as small as possible.
* Do not convert full pages or layouts into client components unless necessary.
* Avoid unnecessary global state.
* Avoid storing derived data in state.
* Avoid expensive computation inside render.
* Memoize only when it solves a real render problem.
* Virtualize long lists, large tables, and large search results.
* Lazy-load heavy modules, charts, editors, canvas tools, and rarely used dialogs.
* Avoid wrapping large trees in Framer Motion unless needed.
* Avoid unnecessary context updates across large subtrees.
* Do not create new Zustand stores for state that belongs locally, in URL params, or in React Query.

For canvas, organization-tree, kanban, analytics, and dashboard modules, explicitly consider render cost before adding state or animation.

---

### State ownership refinement

Use the smallest correct state owner.

State ownership rules:

* Server data, cache, async status, mutations → React Query
* Shareable route state such as filters, tabs, pagination, selected entity IDs → URL search params
* Global interactive client state → Zustand
* Scoped subtree dependencies → React Context
* Temporary UI state → local `useState`
* Derived values → compute from source state, do not duplicate in state

Before creating a Zustand store, check whether the state should instead live in:

* local component state
* parent props
* React Query cache
* URL search params
* React Context

React Context should not be used for frequently changing high-volume state unless the subtree is small and intentional.

---

### URL and navigation standards

Use URL state when the state should be shareable, restorable, bookmarkable, or browser-navigation friendly.

Common URL-owned state:

* active tab
* search query
* filters
* sort
* pagination
* selected entity
* view mode
* date range

Do not hide important navigation state only in local state when users would expect refresh/back/share to preserve it.

---

### Forms standards

Forms must use `@mantine/form` through `@peppermint/ui`.

Every form must define:

* initial values
* validation rules
* submit behavior
* pending state
* disabled state
* field-level error display
* server-error handling
* reset/cancel behavior when applicable

Submit buttons must prevent duplicate submissions.

Server validation errors must be mapped back to fields when possible.

Complex forms must have a short doc explaining structure, validation, and API assumptions.

Do not use React Hook Form, Formik, or other form libraries.

---

### API contract standards

Do not guess backend contracts silently.

When API contracts are available:

* use the real DTO shape
* keep mapping logic outside visual components
* document query keys and mutation behavior

When API contracts are missing:

* create explicit local mock types
* mark mock data clearly
* document assumptions in `docs/api-contracts/`
* avoid spreading invented fields across components
* isolate mock data so it can be replaced cleanly

Components should not directly depend on unstable backend response shapes when a mapper or adapter would make the UI safer.

---

### Data fetching standards

All server state must use React Query.

Required rules:

* No data fetching in `useEffect`.
* No Axios calls inside event handlers.
* Query keys live next to query functions.
* Mutations use `useMutation`.
* Invalidation must be explicit and scoped.
* Optimistic updates must include rollback behavior.
* Query loading, empty, and error states must be represented in the UI.

Use React Query cache intentionally. Do not duplicate server data into Zustand unless there is a documented reason.

---

### Documentation standards for components, modules, and utilities

When creating or significantly updating a reusable component, add or update:

```txt
apps/<app>/docs/components/<component-name>.md
```

Component docs should include:

* purpose
* when to use
* when not to use
* props summary
* states
* accessibility notes
* responsive behavior
* design-system notes
* examples if useful

When creating or significantly updating a major module, add or update:

```txt
apps/<app>/docs/modules/<module-name>.md
```

Module docs should include:

* purpose
* module type
* routes, if any
* major components
* state ownership
* data dependencies
* user flows
* loading/error/empty states
* permissions, if any
* design and motion notes
* known assumptions

When creating or significantly updating a utility, add or update:

```txt
apps/<app>/docs/utils/<utility-name>.md
```

Utility docs should include:

* purpose
* input/output
* examples
* edge cases
* where it is used

---

### Verification checklist

Before finishing any frontend task, run all available checks.

Use the existing repo scripts. Prefer:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm format
```

Only run commands that exist in the repo. Use `/verify` to run this sequence automatically.

If a command does not exist, do not invent infrastructure unless explicitly asked.

For visual work, also verify:

* desktop layout
* tablet layout
* mobile layout
* loading state
* empty state
* error state
* keyboard navigation
* reduced-motion behavior
* dark mode if the app supports it
* design-system consistency

A task is not complete until code, docs, exports, and checks are all handled.

---

### Storybook and preview standards

When Storybook exists, reusable visual components should include stories.

Stories should cover:

* default
* loading
* empty
* error
* disabled
* selected/active
* responsive or constrained-width examples
* dark mode, if supported

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

* summary
* changed files/areas
* screenshots or visual notes for UI work
* docs updated
* checks run
* known risks
* follow-up tasks, if any

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

* Never expose secrets in frontend code.
* Never hardcode private tokens, API keys, or credentials.
* Never log sensitive user data.
* Sanitize or safely render user-generated HTML.
* Avoid `dangerouslySetInnerHTML`; if needed, document why and sanitize input.
* Validate file uploads on the client where applicable, but do not rely on client validation alone.
* Do not store sensitive auth data in Zustand or localStorage unless the architecture explicitly allows it.

---

### Final response standard for coding agents

When finishing a task, respond with:

* what changed
* docs updated
* checks run
* files touched at a high level
* any assumptions
* any follow-up needed

Do not write long explanations unless asked.

If the task is incomplete, clearly say what is done, what is not done, and why.
