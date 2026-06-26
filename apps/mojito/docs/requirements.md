# Mojito — Frontend Requirements

**Project:** Mojito by MintyLeaf — AI-assisted social media management admin app
**Scope of this document:** Frontend only. Build the **complete** UI with **all functionalities working against mock data**. A real backend will be built later and must slot in by swapping the data layer only.
**App location:** `apps/mojito`

---

## 0. How to use this document (for Claude Code)

- Build **one module at a time**, in the order given in §4 (Build Order). Do not start a new module until the current one type-checks and renders all of its states.
- **Match the existing codebase conventions** in §2. Do not introduce new UI libraries, state libraries, or styling systems.
- Everything is **frontend-only**. There is no real network. All data comes from in-memory mock APIs (§3). Never call a real social platform, never implement real OAuth, never assume a server.
- The single most important rule: **all data access goes through the typed API layer in §3.** UI components never hold persistent data themselves — they read/write through React Query hooks that call a `*.api.ts` module. This is the seam that lets a real backend replace mocks later.
- When a module is done, it must satisfy the **Definition of Done** in §5.
- If a requirement is ambiguous, prefer the simplest implementation that keeps the data seam clean, and leave a `// TODO(backend):` comment describing what the real backend will need to provide.

---

## 1. Goal & non-goals

### Goal

A production-shaped frontend for creating, automating, scheduling, engaging, listening, and analyzing social content across multiple platforms and connected accounts, for a single team/workspace. Every screen is fully interactive against mock data, with realistic loading/empty/error states.

### Non-goals (explicitly out of scope)

- Real backend, database, or server routes.
- Real OAuth or real publishing to any social platform. The "Connect" flow is a simulated UI that returns a mock connected account.
- Real authentication. Sign-in is a UI that sets a mock session in client state.
- Real AI agent calls. AI-assist features call a mock that returns canned/generated-looking responses behind the same interface a real agent would use later.
- Real-time transport (websockets). Where "live" updates are needed (e.g. automation run progress, publishing status), **simulate** with React Query polling / `setInterval` on mock state.

> The AI agents already exist on the backend side. This frontend only defines the _interface_ it will eventually call. Mock all AI responses now behind that interface.

---

## 2. Tech stack & conventions (hard constraints)

| Layer              | Use                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------- |
| Framework          | Next.js 16 (App Router), React 19                                                     |
| UI                 | `@peppermint/ui` (Mantine-based), Tailwind 4, Phosphor icons                          |
| Admin shell        | `@peppermint/admin` — `AdminShell`, `DataTableShell`, `ModalTableShell`, `SignInPage` |
| Server/data state  | TanStack React Query v5                                                               |
| Client/local state | Zustand (already used for the template builder)                                       |
| Diagrams           | `@xyflow/react` (automation DAGs)                                                     |
| Charts             | `@mantine/charts`                                                                     |

### Structural conventions (follow exactly)

- Routes live under `app/admin/...` (App Router).
- Feature code lives in `modules/admin/<feature>/` containing: `*.api.ts` (mock data + typed API), React Query hooks, components, and types.
- Navigation is configured in `config/nav/admin-nav.ts`. Update it to match the final nav in §4.
- Page shell pattern: most admin pages wrap content in `<Paper withBorder radius="lg" h="calc(100vh - 16px)">`.
- List screens use `DataTableShell` or `ModalTableShell` from `@peppermint/admin`. The Templates list also uses a custom card grid; reuse that pattern where a card grid fits (Library, Media).
- Layout hierarchy: root `LayoutApp` (theme + React Query) → `LayoutAdmin` (`AdminShell` + sidebar).

### Global UX requirements (apply to every screen)

- Every data-bound view implements four states: **loading** (skeletons, not spinners where possible), **empty** (illustration + primary CTA), **error** (message + retry), **populated**.
- Mutations show optimistic UI where safe, and a success/error toast.
- Destructive actions require confirmation.
- Forms validate inline; submit is disabled until valid; show field-level errors.
- Responsive down to tablet width; sidebar collapses per `AdminShell` behavior.
- Respect the app theme (light/dark) via Mantine tokens — no hardcoded colors.
- Keyboard accessible: focus order, escape closes modals/drawers, enter submits.

---

## 3. Data layer (the backend seam)

This is the most important section. Implement it before any feature module.

### 3.1 Pattern

- Each feature exposes a **typed API interface** and a **mock implementation** in `modules/admin/<feature>/<feature>.api.ts`.
- Mock implementations: in-memory arrays as the source of truth, every method returns a `Promise`, every method awaits a `~300ms` simulated delay, mutations mutate the in-memory array and return the updated entity.
- A single switch decides mock vs real, e.g. `const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'`. The real implementation (added later) will be a `fetch`-based adapter with the **same interface**. UI must never know which is active.
- Each feature also exposes **React Query hooks** (`use<Feature>List`, `use<Feature>`, and mutation hooks) with a query-key factory and correct `invalidateQueries` on mutation.
- Seed every mock with realistic data (see per-module seed counts). Use stable ids, varied statuses, and timestamps spread across recent dates.

### 3.2 Core domain model — the unified `ContentItem`

A single content entity backs Compose, Calendar, Queue, Drafts, Library, Approvals, agent output, and Analytics. Manual posts and agent-generated posts are the **same entity** so they flow through one pipeline.

```
ContentItem
  id
  source: 'manual' | 'agent'
  status: 'draft' | 'pending_review' | 'approved' | 'scheduled'
          | 'publishing' | 'published' | 'failed'
  title?               // internal label
  variants: ChannelVariant[]
  schedule: ScheduleInfo
  templateId?          // if produced from a template
  automationRunId?     // if produced by an agent run
  review?: ReviewInfo  // approver, decision, notes
  analytics?: ContentAnalyticsSummary  // populated after 'published'
  error?: { message, failedPlatforms: Platform[] }
  createdBy, createdAt, updatedAt

ChannelVariant
  platform: Platform   // instagram|facebook|x|linkedin|tiktok|youtube|threads|pinterest
  channelId            // which connected account
  enabled: boolean
  format: 'single'|'carousel'|'thread'|'story'|'reel'|'short'|'poll'
  caption
  media: MediaRef[]    // ordered; references MediaAsset
  hashtags: string[]
  mentions: string[]
  firstComment?
  link?: { url, utm? }
  thread?: ThreadPart[]   // for x/threads
  poll?: { options[], durationHours }

ScheduleInfo
  scheduledAt?   // ISO
  timezone       // IANA
  queueSlotId?
  publishedAt?

ContentAnalyticsSummary
  impressions, reach, engagements, likes, comments, shares, clicks, saves
  perPlatform: Record<Platform, {...}>
```

### 3.3 Other entities (name + key fields; full shapes are the builder's call)

- **Channel** — id, platform, handle, displayName, avatar, status (`connected|expired|disconnected`), timezone, defaultFirstComment, signature.
- **Template** — id, name, platform, slots[], html, version, thumbnail (already partially built).
- **Workflow** — id, name, status (`active|paused`), nodes/edges (DAG), schedule, lastRunAt.
- **AutomationRun** — id, workflowId, status (`running|succeeded|failed|waiting_review`), steps[] (each with status + log), startedAt, producedContentIds[].
- **MediaAsset** — id, kind (`image|video|gif`), url, thumbnailUrl, alt, width, height, durationSec, tags[], folderId.
- **Conversation / InboxMessage** — id, channelId, platform, type (`comment|mention|dm|review`), author, text, status (`open|assigned|done`), assignedTo, threadMessages[], createdAt.
- **Mention** (listening) — id, source, platform, author, text, url, sentiment, reach, createdAt.
- **Keyword / Competitor / Alert** — tracked query, volume series, status.
- **AnalyticsSeries** — metric, granularity, points[{date,value}], perPlatform breakdown.
- **User / TeamMember / Role** — id, name, email, avatar, role (`owner|admin|editor|viewer`), status.
- **Workspace** — id, name, logo, timezone.
- **Notification** — id, type, text, read, createdAt, link.
- **Integration** — id, name, category, connected, logo.
- **LinkInBioPage** — id, slug, links[], theme, clickStats.
- **BrandKit** — logos[], palette[], fonts[], watermark.
- **Report** — id, name, range, sections[], schedule.

---

## 4. Navigation & modules

Update `config/nav/admin-nav.ts` to this structure. Each leaf is a route under `app/admin/`.

```
Dashboard                         /admin

Create
  └ Compose                       /admin/create

Publish
  ├ Calendar                      /admin/publish/calendar
  ├ Queue                         /admin/publish/queue
  ├ Drafts                        /admin/publish/drafts
  ├ Content Library               /admin/publish/library
  └ Approvals                     /admin/publish/approvals

Engage
  └ Inbox                         /admin/engage/inbox

Listening
  ├ Mentions                      /admin/listening/mentions
  ├ Keywords & Hashtags           /admin/listening/keywords
  ├ Competitors                   /admin/listening/competitors
  ├ Sentiment Stream              /admin/listening/sentiment
  └ Alerts                        /admin/listening/alerts

Automation
  ├ Templates                     /admin/automation/templates
  ├ Workflows                     /admin/automation/workflows
  └ Runs / Monitoring             /admin/automation/runs

Analytics
  ├ Overview                      /admin/analytics/overview
  ├ Post Analysis                 /admin/analytics/post-analysis
  ├ Channel Performance           /admin/analytics/channels
  ├ Audience                      /admin/analytics/audience
  ├ Sentiment                     /admin/analytics/sentiment
  ├ Competitor / Benchmark        /admin/analytics/benchmark
  ├ ROI / Attribution             /admin/analytics/roi
  └ Reports                       /admin/analytics/reports

Assets
  ├ Media Library                 /admin/assets/media
  ├ Brand Kit                     /admin/assets/brand-kit
  └ Link-in-bio                   /admin/assets/link-in-bio

Channels
  ├ Accounts                      /admin/channels
  ├ Connect                       /admin/channels/connect
  └ Channel Settings              /admin/channels/settings

Settings
  ├ Profile                       /admin/settings/profile
  ├ Workspace / Brand             /admin/settings/workspace
  ├ Team & Roles                  /admin/settings/team
  ├ Notifications                 /admin/settings/notifications
  ├ Integrations                  /admin/settings/integrations
  └ Billing / Plan                /admin/settings/billing
```

### Build Order

1. **Data layer** (§3) — domain types, API pattern, React Query setup, seed data.
2. **Compose** — biggest net-new build; everything references `ContentItem`.
3. **Publish** (Calendar → Queue → Drafts → Library → Approvals).
4. **Channels** (Accounts → Connect → Settings) — Compose needs channels to target.
5. **Automation** (Runs/Monitoring; Templates & Workflows already exist — extend).
6. **Analytics** (Overview → Post Analysis → the rest).
7. **Engage / Inbox**.
8. **Listening**.
9. **Assets**.
10. **Settings**.
11. **Dashboard** — wire to real mock data last (it aggregates everything above).

---

## 5. Definition of Done (per module)

A module is done when:

- All routes render and are reachable from the sidebar.
- All four states (loading / empty / error / populated) are implemented for every data-bound view.
- All listed actions work end-to-end against the mock API and persist within the session.
- All data access goes through a typed `*.api.ts` + React Query hooks; no fetch calls, no hardcoded data in components.
- Mutations invalidate the right queries and show toasts.
- `// TODO(backend):` comments mark every place that will need a real endpoint.
- TypeScript compiles with no errors; no `any` on domain types.

---

## 6. Module specifications

For each module: **purpose**, **functionalities**, **key states**, and **data needs** (what the mock API must provide).

### 6.1 Dashboard — `/admin`

**Purpose:** at-a-glance overview, aggregates other modules.
**Functionalities:** KPI cards (scheduled / published / pending review / failed); upcoming schedule list; recent activity feed; active automations status; needs-attention alerts (failed posts, expired channels); quick actions (New Post, Open Queue, Review Pending); volume chart; mini calendar.
**Data needs:** aggregate selectors over ContentItem, AutomationRun, Channel, Notification.

### 6.2 Compose — `/admin/create`

**Purpose:** create/edit a `ContentItem` across multiple platforms.
**Functionalities:**

- Channel target selector (multi-select connected accounts); toggle "customize per platform" to split into per-`ChannelVariant` editing.
- Rich text editor with emoji + live character counter against per-platform limits.
- Hashtag manager (insert, saved hashtag groups) and @-mention / location / collaborator inputs.
- Link insert with UTM builder and link preview card.
- Media: upload (local object URLs in mock), pick from Media Library, reorder, per-platform crop/aspect ratio, alt text, basic video trim UI.
- Format switch per variant: single / carousel / thread / story / reel / short / poll (thread editor for x/threads; poll editor with options + duration).
- First comment per platform.
- AI assist panel (mocked): generate caption, generate variations, repurpose one → all platforms, suggest hashtags, adjust tone/length, **generate image**. All behind a `composeAi` interface returning mock results after a delay.
- Live per-platform preview (IG / X / LinkedIn / etc. mock chrome).
- Validation: per-platform constraints; blocking vs soft warnings.
- Actions: Save Draft, Schedule (date/time + timezone), Add to Queue (pick slot), Publish Now (mock → publishing → published), Submit for Approval, Duplicate.
  **Key states:** new vs editing existing; per-variant validity; AI loading; publishing in progress.
  **Data needs:** `contentApi.create/update/get`, `channelsApi.list`, `mediaApi.list/upload`, `composeAi.*`, `queueApi.slots`.

### 6.3 Publish

**Calendar — `/admin/publish/calendar`** _(extend existing)_

- Week / month / list views; status colors; drag-to-reschedule (updates `schedule`); click → preview drawer; create-from-empty-slot (opens Compose prefilled with date).
- Filters: platform, channel, status, source.
- Data needs: `contentApi.list({range, filters})`, `contentApi.reschedule(id, scheduledAt)`.

**Queue — `/admin/publish/queue`**

- Per-channel time-slot grid; add/edit/remove slots; reorder queued items; "next available slot" placement; best-time suggestion badges (mock); evergreen/recycling toggle on an item.
- Data needs: `queueApi.slots/list/reorder`, content placement into slots.

**Drafts — `/admin/publish/drafts`**

- List of `status='draft'` items; resume (→ Compose); duplicate; delete; bulk delete.

**Content Library — `/admin/publish/library`** _(extend existing)_

- Card/list grid; filters (platform, status, source, automation, date); search; detail drawer; edit (→ Compose); duplicate; delete; approve; bulk actions.
- Data needs: paginated `contentApi.list`, `contentApi.approve`.

**Approvals — `/admin/publish/approvals`**

- Queue of `status='pending_review'`; approve / reject with note; reassign; preview; status flow updates `review` + `status`.
- Data needs: `contentApi.list({status})`, `contentApi.approve/reject/assign`.

### 6.4 Engage — Inbox — `/admin/engage/inbox`

**Functionalities:** unified stream of comments / mentions / DMs / reviews across channels; filters (channel, type, status, assignee); conversation view with threaded replies; reply box; assign to teammate; mark done/open; internal notes; saved replies/macros; bulk mark-done; mock "comment automation" rules list.
**States:** empty inbox, conversation loading, sending reply.
**Data needs:** `inboxApi.list/get/reply/assign/updateStatus`, `teamApi.list` (for assignee).

### 6.5 Listening

- **Mentions** `/admin/listening/mentions` — feed of tracked brand mentions; filters; sentiment tag; open source; assign to inbox.
- **Keywords & Hashtags** `/admin/listening/keywords` — manage tracked terms; volume-over-time charts; add/remove.
- **Competitors** `/admin/listening/competitors` — add competitor handles; comparative volume/engagement.
- **Sentiment Stream** `/admin/listening/sentiment` — sentiment over time + by topic; positive/neutral/negative breakdown.
- **Alerts** `/admin/listening/alerts` — alert rules (spike/crisis/keyword); alert feed; mark read.
  **Data needs:** `listeningApi.mentions/keywords/competitors/sentiment/alerts` with chart series.

### 6.6 Automation

- **Templates** `/admin/automation/templates` _(built — keep)_: list, builder canvas, slots, preview, CRUD, versioning.
- **Workflows** `/admin/automation/workflows` _(built — extend)_: list, DAG editor, run/pause, history; add trigger & schedule config UI.
- **Runs / Monitoring** `/admin/automation/runs` _(new)_: run list with status; run detail with step-by-step progress (simulate live via polling mock), step logs, retries, failure detail; **human-in-the-loop gates** (a `waiting_review` run surfaces an approve-to-continue action); **generated-content review** linking a run's produced items into the Approvals/Library flow.
  **Data needs:** `automationApi.runs/run/approveGate/retry`, links to `contentApi` for produced items.

### 6.7 Analytics _(Post Analysis built — extend the rest)_

- **Overview** `/admin/analytics/overview` — cross-channel summary cards + trends.
- **Post Analysis** `/admin/analytics/post-analysis` _(built)_ — period toggle (7/30/90d), stat cards, volume/performance charts, platform donut, automation table.
- **Per-post deep dive** — single ContentItem metrics + engagement timeline (reachable from a post).
- **Channel Performance** `/admin/analytics/channels` — per-platform performance, follower growth.
- **Audience** `/admin/analytics/audience` — demographics, active times, growth.
- **Sentiment** `/admin/analytics/sentiment` — sentiment trends (shares data shape with Listening).
- **Competitor / Benchmark** `/admin/analytics/benchmark` — comparison vs competitors/industry.
- **ROI / Attribution** `/admin/analytics/roi` — link activity → leads/revenue (mock funnel), per-campaign ROI table.
- **Reports** `/admin/analytics/reports` — build report from sections, choose range/comparison, schedule, export (mock PDF/CSV download).
  **Data needs:** `analyticsApi.*` returning `AnalyticsSeries` and breakdowns; all chart-ready.

### 6.8 Assets

- **Media Library** `/admin/assets/media` — DAM grid; upload; folders; tags; search; detail (alt text, dimensions); use-in-compose; delete; bulk.
- **Brand Kit** `/admin/assets/brand-kit` — logos, color palette, fonts, default watermark; edit/save.
- **Link-in-bio** `/admin/assets/link-in-bio` — bio page builder (add/reorder/style links), live preview, mock click stats, publish toggle + shareable slug.
  **Data needs:** `mediaApi.*`, `brandKitApi.get/update`, `linkInBioApi.get/update/stats`.

### 6.9 Channels _(Accounts built — add Connect + Settings)_

- **Accounts** `/admin/channels` _(built)_ — connected-account CRUD via `ModalTableShell` + form.
- **Connect** `/admin/channels/connect` — per-platform connect cards; simulated OAuth (button → mock delay → returns a connected `Channel`); health/status badges; reconnect; disconnect.
- **Channel Settings** `/admin/channels/settings` — per-channel default timezone, signature, default first comment.
  **Data needs:** `channelsApi.list/connect/disconnect/reconnect/update`.

### 6.10 Settings

- **Profile** `/admin/settings/profile` — user details, avatar, preferences.
- **Workspace / Brand** `/admin/settings/workspace` — workspace name/logo/timezone; (single workspace for now — leave a `// TODO(backend): multi-workspace switcher` hook).
- **Team & Roles** `/admin/settings/team` — members list, invite, role assignment (owner/admin/editor/viewer), remove; permission matrix display.
- **Notifications** `/admin/settings/notifications` — in-app/email toggles by category; notification center (read/unread).
- **Integrations** `/admin/settings/integrations` — connector marketplace cards (Zapier, CRM, e-commerce); connect/disconnect (mock).
- **Billing / Plan** `/admin/settings/billing` — current plan, usage vs limits, plan comparison (static), invoices (mock).
  **Data needs:** `userApi`, `workspaceApi`, `teamApi`, `notificationsApi`, `integrationsApi`, `billingApi`.

### 6.11 Auth — `/` (sign-in)

- Existing `SignInPage` UI. On submit, set a mock session in client state and route to `/admin`. Provide sign-out. `// TODO(backend): real auth`.

---

## 7. Acceptance summary

The frontend is complete when: every route in §4 exists and is navigable; every module meets the §5 Definition of Done; the unified `ContentItem` flows manual + agent content through Compose → Approvals → Calendar/Queue → (mock) publish → Library → Analytics; and switching `NEXT_PUBLIC_USE_MOCK=false` is the only change a future real backend requires at the UI boundary.
