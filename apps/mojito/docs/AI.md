# Mojito — AI Navigation Map

## App purpose

Multi-domain admin platform. Primary domain: social media content lifecycle management (compose, schedule, queue, approve, publish, analyze). Secondary domain: library management (books, loans, members).

Stack: Next.js App Router, Mantine (via `@peppermint/ui`), React Query, Zustand, `@peppermint/admin` shells.

---

## Read by task type

| Task                    | Read first                                                                                        | Then inspect                  |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------- |
| Edit visual design      | `docs/design/DESIGN.md`, `docs/design/design-system.md` — run `/bootstrap-docs mojito` if missing | target component only         |
| Add UI component        | `@peppermint/ui` exports, `@peppermint/admin` exports                                             | target component folder       |
| Edit existing module    | module `docs/AI.md` if exists, else module folder directly                                        | target module files only      |
| Add channel integration | `modules/admin/channels/channels.api.ts`, `channels.types.ts`                                     | channel form and pages        |
| Add content feature     | `modules/admin/compose/compose.store.ts` first (check for existing state)                         | compose pages and components  |
| Add analytics view      | `modules/admin/analytics/`                                                                        | relevant analytics sub-module |
| Add library feature     | `modules/admin/books/` or `modules/admin/loans/`                                                  | module api + types            |
| Scaffold new module     | `.claude/CLAUDE.md` (module type rules), `usage-doc/module-patterns/README.md`                    | run `/new-module`             |

---

## App structure

```
apps/mojito/
├── app/admin/               # Next.js App Router — re-exports only
├── layouts/admin/           # Admin layout shell
├── modules/admin/           # Feature modules grouped by domain below
└── modules/sign-in/         # Sign-in page
```

---

## Major modules — Social media domain

| Module          | Path                             | Route(s)                                                                                             | Module AI map |
| --------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------- |
| Compose         | `modules/admin/compose/`         | `/admin/compose`, `/admin/create`                                                                    | —             |
| Channels        | `modules/admin/channels/`        | `/admin/channels`, `/admin/channels/settings`, `/admin/channels/connect`                             | —             |
| Calendar        | `modules/admin/calendar/`        | `/admin/calendar`                                                                                    | —             |
| Queue           | `modules/admin/queue/`           | `/admin/queue`                                                                                       | —             |
| Drafts          | `modules/admin/drafts/`          | `/admin/drafts`                                                                                      | —             |
| Approvals       | `modules/admin/approvals/`       | `/admin/approvals`                                                                                   | —             |
| Content Library | `modules/admin/content-library/` | `/admin/content-library`                                                                             | —             |
| Content         | `modules/admin/content/`         | —                                                                                                    | —             |
| Analytics       | `modules/admin/analytics/`       | `/admin/analytics/*` (overview, social-media, post-analysis, audience, sentiment, reports, channels) | —             |
| Templates       | `modules/admin/templates/`       | —                                                                                                    | —             |
| Automations     | `modules/admin/automations/`     | —                                                                                                    | —             |
| Automation Runs | `modules/admin/automation-runs/` | —                                                                                                    | —             |
| Media           | `modules/admin/media/`           | —                                                                                                    | —             |
| Brand Kit       | `modules/admin/brand-kit/`       | —                                                                                                    | —             |
| Listening       | `modules/admin/listening/`       | —                                                                                                    | —             |
| Inbox           | `modules/admin/inbox/`           | —                                                                                                    | —             |
| Link in Bio     | `modules/admin/link-in-bio/`     | —                                                                                                    | —             |
| AI Chat         | —                                | `/admin/ai-chat`                                                                                     | —             |

## Major modules — Library domain

| Module  | Path                     | Route(s)                                                | Module AI map |
| ------- | ------------------------ | ------------------------------------------------------- | ------------- |
| Books   | `modules/admin/books/`   | `/admin/books`                                          | —             |
| Loans   | `modules/admin/loans/`   | `/admin/loans`, `/admin/loans/new`, `/admin/loans/[id]` | —             |
| Members | `modules/admin/members/` | `/admin/members`                                        | —             |

## Major modules — Platform

| Module       | Path                          | Route(s)                                                                             | Module AI map |
| ------------ | ----------------------------- | ------------------------------------------------------------------------------------ | ------------- |
| Organization | `modules/admin/organization/` | `/admin/organization`                                                                | —             |
| Settings     | `modules/admin/settings/`     | `/admin/settings/*` (workspace, integrations, profile, team, notifications, billing) | —             |
| Shared       | `modules/admin/shared/`       | —                                                                                    | —             |

Note: Create module-level `docs/AI.md` files as you build or significantly edit each module. Use `/update-ai-map` after any structural change.

---

## Shared resources

| Resource                | Location                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------- |
| UI components           | `@peppermint/ui` (Mantine re-exports + app wrappers)                                  |
| Admin shells            | `@peppermint/admin` (`DataTableShell`, `ModalTableShell`, `FormWrapper`, `FormShell`) |
| Shared module utilities | `modules/admin/shared/`                                                               |
| Design docs             | `docs/design/` — run `/bootstrap-docs mojito` to scaffold if missing                  |
| API contracts           | `docs/api-contracts/` — create when backend DTOs are defined                          |

---

## State management locations

| State type                            | Location                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| Server data, cache                    | React Query — query functions in module `.api.ts` or `.hooks.ts`, keys in `.queryKeys.ts` |
| Compose / draft state                 | `modules/admin/compose/compose.store.ts`                                                  |
| Shareable filters / tabs / pagination | URL search params                                                                         |
| Local UI state                        | `useState` in component                                                                   |

---

## Key domain types

| Entity                | Location                                                   |
| --------------------- | ---------------------------------------------------------- |
| Channel               | `modules/admin/channels/channels.types.ts`                 |
| Compose / ContentItem | `modules/admin/compose/compose.types.ts`                   |
| Books                 | `modules/admin/books/books.types.ts`                       |
| Loans                 | `modules/admin/loans/module.api.ts` (check for types file) |
| Shared content types  | `modules/admin/shared/` or `modules/admin/content/`        |

---

## Do not do

- Do not scan the full `modules/` tree — use domain groupings above and module AI maps.
- Do not create duplicate channel or content types — check `modules/admin/shared/` first.
- Do not mix social-media domain state into the library domain or vice versa.
- Do not import from `@mantine/*` directly — use `@peppermint/ui`.
- Do not add `"use client"` to `app/` pages or layouts.
- Do not fetch data in `useEffect` — use `useQuery`.
- Do not mutate server state with direct Axios calls — use `useMutation`.
- Do not invent new folder patterns not described in `.claude/CLAUDE.md`.
- Do not create a new Zustand store without checking `compose.store.ts` and other existing stores first.
