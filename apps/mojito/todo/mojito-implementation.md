# Mojito — Implementation Plan

**App:** `apps/mojito` | **Stack:** Next.js App Router · React Query · Zustand · `@peppermint/ui` · `@peppermint/admin`

Modules follow two declared patterns plus custom pages:
- **ContainedModule** → `ModalTableShell` (single route, drawer CRUD)
- **MultiPageModule** → `DataTableShell` + `FormWrapper`/`FormShell` (list + dedicated new/edit/view pages)
- **Custom** → bespoke layout following the same shell/header conventions (Paper wrapper, `ModuleHeader` breadcrumbs, consistent page header group with title + description)

Every page that owns a Paper shell must include a page header section (`Group justify="space-between"` with title + description stack).

---

## What already exists

| Module | State | Notes |
|---|---|---|
| `modules/admin/channels` | ✅ Done | ContainedModule, ModalTableShell |
| `modules/admin/templates` | ✅ Done | MultiPageModule + canvas builder |
| `modules/admin/automations` | ✅ Partial | list + workflow view/DAG; needs Runs + schedule config |
| `modules/admin/calendar` | ✅ Partial | Week/Month views built; needs drag-reschedule, ContentItem data, status colours |
| `modules/admin/content-library` | ✅ Partial | Card grid + filters + detail view; needs real ContentItem data, approve/delete, bulk actions |
| `modules/admin/analytics` | ✅ Partial | Post Analysis built; needs all other sub-pages |
| `modules/admin/create` | ✅ Done | ComposeEditor with ChannelSelector, CaptionEditor, MediaPanel, AiPanel, PlatformPreview, ComposeActions |
| `modules/admin/home` | ⬜ Hardcoded | Bento grid with static data; rewire to real mock data last |
| `modules/sign-in` | ✅ Done | Mock session |

---

## Phase 0 — Foundation (data layer + nav + routes) ✅ COMPLETE

> Must be done first. Every other phase depends on these types and mock APIs.

### 0.1 Domain types ✅
- [x] Create `modules/admin/shared/domain.types.ts`
  - [x] `Platform` union (`instagram|facebook|x|linkedin|tiktok|youtube|threads|pinterest`)
  - [x] `ContentStatus` union (`draft|pending_review|approved|scheduled|publishing|published|failed`)
  - [x] `ContentSource` union (`manual|agent`)
  - [x] `ChannelVariant` interface (platform, channelId, enabled, format, caption, media, hashtags, mentions, firstComment, link, thread, poll)
  - [x] `ScheduleInfo` interface (scheduledAt?, timezone, queueSlotId?, publishedAt?)
  - [x] `ContentAnalyticsSummary` interface (impressions, reach, engagements, likes, comments, shares, clicks, saves, perPlatform)
  - [x] `ReviewInfo` interface (approvedBy?, rejectedBy?, decision, notes, decidedAt)
  - [x] `ContentItem` interface — full shape
  - [x] `MediaRef` interface (id, url, kind, alt, width?, height?)
  - [x] `ThreadPart` interface (text, media?)
  - [x] `PollOptions` interface (options[], durationHours)

- [x] Create `modules/admin/shared/entities.types.ts`
  - [x] `Channel` (extended with timezone, signature, defaultFirstComment, avatar)
  - [x] `MediaAsset`, `MediaFolder`
  - [x] `Workflow`, `AutomationRun`, `AutomationStep`
  - [x] `Conversation`, `InboxMessage`, `ThreadMessage`
  - [x] `Mention`, `Keyword`, `Competitor`, `Alert`
  - [x] `AnalyticsSeries`
  - [x] `User`, `TeamMember`, `Workspace`
  - [x] `Notification`, `Integration`
  - [x] `LinkInBioPage`, `BrandKit`
  - [x] `Report`, `QueueSlot`

### 0.2 Mock API pattern ✅
- [x] Create `modules/admin/shared/mock.utils.ts`
  - [x] `delay(ms?)` — returns `Promise<void>` with ~300ms default
  - [x] `paginate<T>(items, page, pageSize)` — returns `{ data, meta: {total, page, pageSize} }`
  - [x] `USE_MOCK` flag (`process.env.NEXT_PUBLIC_USE_MOCK !== 'false'`)

### 0.3 ContentItem mock API ✅
- [x] Create `modules/admin/content/content.api.ts`
  - [x] In-memory seed: 40 ContentItems across all platforms, statuses, sources, dates spread over last 90 days
  - [x] `fetchContentItems(params?)` → paginated with status/source/platform/range/search filters
  - [x] `fetchContentItem(id)` → single item
  - [x] `createContentItem(data)` → mutates store
  - [x] `updateContentItem(id, data)` → mutates store
  - [x] `deleteContentItem(id)` → mutates store
  - [x] `scheduleContentItem(id, scheduledAt, timezone)` → sets status=scheduled
  - [x] `publishNowContentItem(id)` → simulates publishing (status: publishing → published after 1.5s)
  - [x] `approveContentItem(id, notes?)` → sets status=approved
  - [x] `rejectContentItem(id, notes)` → sets status=draft + stores review info
  - [x] `duplicateContentItem(id)` → clones with status=draft
  - [x] `// TODO(backend): replace in-memory store with real API adapter`
- [x] Create `modules/admin/content/content.queryKeys.ts`
- [x] Create `modules/admin/content/content.hooks.ts` — all hooks implemented

### 0.4 composeAi mock interface ✅
- [x] Create `modules/admin/compose/composeAi.api.ts`
  - [x] `generateCaption(params: { platform, brief, tone })` → returns mock caption string
  - [x] `generateVariations(caption, count)` → returns string[]
  - [x] `repurposeToAllPlatforms(caption)` → returns `Record<Platform, string>`
  - [x] `suggestHashtags(caption, platform)` → returns string[]
  - [x] `adjustTone(caption, tone)` → returns string
  - [x] `adjustLength(caption, direction)` → returns string
  - [x] `generateImage(prompt)` → returns mock image URL (use placeholder)
  - [x] `// TODO(backend): wire to real AI agent API`

### 0.5 Nav + routes ✅
- [x] Update `config/nav/admin-nav.ts` to full structure:
  - [x] Dashboard entry (`/admin`)
  - [x] Create → Compose (`/admin/create`)
  - [x] Publish group: Calendar, Queue, Drafts, Library, Approvals
  - [x] Engage group: Inbox
  - [x] Listening group: Mentions, Keywords & Hashtags, Competitors, Sentiment Stream, Alerts
  - [x] Automation group: Templates, Workflows, Runs/Monitoring
  - [x] Analytics group: Overview, Post Analysis, Channel Performance, Audience, Sentiment, Benchmark, ROI/Attribution, Reports
  - [x] Assets group: Media Library, Brand Kit, Link-in-bio
  - [x] Channels group: Accounts, Connect, Channel Settings
  - [x] Settings group: Profile, Workspace/Brand, Team & Roles, Notifications, Integrations, Billing/Plan
- [x] Scaffold all missing `app/admin/` route files (DummyPage stubs for all new routes)

---

## Phase 1 — Compose (`/admin/create`) ✅ COMPLETE

### 1.1 Compose types ✅
- [x] Create `modules/admin/compose/compose.types.ts`
  - [x] `ComposeState`, `VariantEditorState`, `ComposeDraft`
  - [x] `PLATFORM_CHAR_LIMITS`, `PLATFORM_LABELS`

### 1.2 Compose store (Zustand) ✅
- [x] Create `modules/admin/compose/compose.store.ts`
  - [x] All state and actions implemented

### 1.3 Compose sub-components ✅
- [x] `components/ChannelSelector/` — multi-select connected channels with platform badges
- [x] `components/CaptionEditor/` — textarea with character counter (per-platform limits), per-variant customize tabs
- [ ] `components/HashtagManager/` — insert hashtag, saved groups panel *(deferred)*
- [ ] `components/LinkInsert/` — URL input + UTM builder *(deferred)*
- [x] `components/MediaPanel/` — upload (local object URL), reorder, preview grid
- [ ] `components/FormatSwitcher/` — format selector per variant *(deferred)*
- [ ] `components/FirstCommentInput/` — collapsible first comment field *(deferred)*
- [x] `components/AiPanel/` — generate caption, variations, tone adjust, length adjust, image; loading skeletons
- [x] `components/PlatformPreview/` — IG / X / LinkedIn / TikTok mock previews
- [x] `components/ValidationBanner/` — per-platform blocking errors
- [x] `components/ComposeActions/` — Save Draft, Schedule, Submit for Approval, Publish Now

### 1.4 Compose page ✅
- [x] Build `modules/admin/compose/pages/compose/ComposeEditor.tsx` — two-column layout
- [x] Wire to `content.hooks.ts` create/update mutations
- [x] Wire to `channelsApi.list` for channel selector data
- [x] Wire to `composeAi.*` for AI panel
- [x] `modules/admin/compose/index.ts` — export `ModuleCompose`
- [x] Update `app/admin/create/page.tsx`

---

## Phase 2 — Publish ✅ COMPLETE

### 2.1 Calendar extension ✅
- [x] Wire calendar to `content.api.ts` range fetch
- [x] Update `calendar.api.ts` to use ContentItem data shape with STATUS_COLORS
- [x] Add status colour map for ContentItem statuses
- [x] Create-from-empty-slot: click empty day → route to Compose with `?date=` prefilled
- [x] Add filter bar: status select, platform select with clear action
- [x] `calendar/index.ts` — `ModuleCalendar` exported

### 2.2 Queue ✅
- [x] Create `modules/admin/queue/queue.api.ts` — 3 channels × 5 slots/day; CRUD operations
- [x] Create `queue.queryKeys.ts` + `queue.hooks.ts`
- [x] Build `QueuePage.tsx` — per-channel columns with slot management
- [x] `modules/admin/queue/index.ts` — export `ModuleQueue`
- [x] Wire `app/admin/publish/queue/page.tsx` to `ModuleQueue`

### 2.3 Drafts ✅
- [x] Create `modules/admin/drafts/` — queryKeys, hooks, DraftsList with Resume/Duplicate/Delete
- [x] `modules/admin/drafts/index.ts` — export `ModuleDrafts`
- [x] Wire `app/admin/publish/drafts/page.tsx` to `ModuleDrafts`

### 2.4 Content Library extension
- [ ] Rewire `content-library/module.api.ts` to delegate to `content.api.ts`
- [ ] Add approve, reject, delete, duplicate actions
- [ ] Add source filter (manual / agent)

### 2.5 Approvals ✅
- [x] Create `modules/admin/approvals/` — api, queryKeys, hooks
- [x] `ApprovalsList.tsx` — expandable rows, Approve/Reject buttons
- [x] `components/RejectModal/` — notes textarea + confirm
- [x] `modules/admin/approvals/index.ts` — export `ModuleApprovals`
- [x] Wire `app/admin/publish/approvals/page.tsx` to `ModuleApprovals`

---

## Phase 3 — Channels (extend) ✅ COMPLETE

### 3.1 Channels API extension ✅
- [x] Added `connectChannel`, `disconnectChannel`, `reconnectChannel`, `updateChannelSettings`

### 3.2 Connect ✅
- [x] `ChannelsConnect.tsx` — grid of 8 platform cards with connect/add/disconnect
- [x] Exported from channels index; wired `app/admin/channels/connect/page.tsx`

### 3.3 Channel Settings ✅
- [x] `ChannelSettings.tsx` — channel list + per-channel form (timezone, signature, first comment)
- [x] Exported from channels index; wired `app/admin/channels/settings/page.tsx`

---

## Phase 4 — Automation (extend) ✅ COMPLETE

### 4.1 Automation Runs ✅
- [x] `runs.api.ts` — 15 seed runs across all statuses, full CRUD + approveGate/retryRun/cancelRun
- [x] `runs.queryKeys.ts` + `runs.hooks.ts` — polling when `status=running`
- [x] `pages/list/index.tsx` — tabbed table (All/Running/Waiting Review/Succeeded/Failed)
- [x] `pages/view/RunView.tsx` — step timeline, approve gate banner, generated content links, polling
- [x] Wired `app/admin/automation/runs/page.tsx` + `[id]/page.tsx`

### 4.2 Workflows extension
- [ ] Add trigger config panel (schedule/webhook/manual, cron, next-run preview) *(deferred)*

---

## Phase 5 — Analytics (extend) ✅ COMPLETE

### 5.1 Analytics API ✅
- [x] Extended `analytics.api.ts` with `fetchOverview`, `fetchChannelPerformance`, `fetchAudience`, `fetchSentimentAnalytics`, `fetchBenchmark`, `fetchROI`, `fetchReports`, `createReport`, `deleteReport`, `exportReport`
- [x] All seeded with chart-ready data

### 5.2 Analytics Overview ✅ — `AnalyticsOverview.tsx` with KPI cards, AreaChart, DonutChart, top posts table
### 5.3 Post Analysis extension — skipped (existing page works; deep-dive deferred)
### 5.4 Channel Performance ✅ — `ChannelPerformance.tsx` with per-platform tabs, LineChart, BarChart
### 5.5 Audience ✅ — `Audience.tsx` with DonutChart, geo BarChart, active hours BarChart
### 5.6 Sentiment ✅ — `AnalyticsSentiment.tsx` with stacked AreaChart + topic BarChart
### 5.7 Benchmark ✅ — `Benchmark.tsx` with comparative LineChart + competitor table
### 5.8 ROI ✅ — `ROI.tsx` with funnel Progress bars + campaign ROI table
### 5.9 Reports ✅ — `ReportsList.tsx` with card grid, modal builder, PDF/CSV export

---

## Phase 6 — Engage / Inbox (`/admin/engage/inbox`) ✅ COMPLETE

### 6.1 Inbox API ✅
- [x] `inbox.api.ts` — 25 conversations seed, fetchConversations (with filters), fetchConversation, replyToConversation, assignConversation, resolveConversation, reopenConversation
- [x] `inbox.queryKeys.ts` + `inbox.hooks.ts`

### 6.2 Inbox UI ✅
- [x] `InboxPage.tsx` — two-panel layout (left: filters+list, right: thread view)
- [x] `ConversationList/` — avatar, type+status badges, selection highlight
- [x] `ConversationThread/` — full message thread, reply/internal-note SegmentedControl, resolve/reopen actions
- [x] `InboxFilters/` — search, status Select, type Select
- [x] `inbox/index.ts` — exports `ModuleInbox`
- [x] `app/admin/engage/inbox/page.tsx` — wired

---

## Phase 7 — Listening ✅ COMPLETE

### 7.1 Listening API ✅ — `listening.api.ts` with 30 mentions, 10 keywords, 5 competitors, 10 alerts; `listening.queryKeys.ts` + `listening.hooks.ts`
### 7.2 Mentions ✅ — `MentionsFeed.tsx` with filter bar, sentiment/platform selects, paginated mention cards
### 7.3 Keywords ✅ — `KeywordsList.tsx` with expandable volume LineChart per keyword, add/delete modal
### 7.4 Competitors ✅ — `CompetitorsList.tsx` with expandable volume LineChart, add/delete modal
### 7.5 Sentiment Stream ✅ — `SentimentStream.tsx` with stacked AreaChart + sentiment KPI cards
### 7.6 Alerts ✅ — `AlertsPage.tsx` with color-coded alert feed, mark-read, mark-all-read

---

## Phase 8 — Assets ✅ COMPLETE

### 8.1 Media API ✅ — `media.api.ts` (30 assets, 4 folders), `media.queryKeys.ts` + `media.hooks.ts`
### 8.2 Media Library ✅ — `MediaLibrary.tsx` with folder sidebar, search/filter, upload, bulk delete, paginated grid
### 8.3 Brand Kit API ✅ — `brandKit.api.ts`, `brandKit.queryKeys.ts` + `brandKit.hooks.ts`
### 8.4 Brand Kit ✅ — `BrandKitPage.tsx` with logos, color palette, fonts, tagline/watermark
### 8.5 Link-in-Bio API ✅ — `linkInBio.api.ts` with page CRUD + publish
### 8.6 Link-in-Bio ✅ — `LinkInBioEditor.tsx` with live phone preview, link manager, theme/color/slug settings

---

## Phase 9 — Settings ✅ COMPLETE

### 9.1 Settings API ✅ — `settings.api.ts` (user, workspace, team, notifPrefs, integrations, billing), `settings.queryKeys.ts` + `settings.hooks.ts`
### 9.2 Profile ✅ — `ProfileSettings.tsx` with name, email, timezone, avatar URL
### 9.3 Workspace ✅ — `WorkspaceSettings.tsx` with name, logo, website, industry, timezone
### 9.4 Team ✅ — `TeamList.tsx` with invite modal, role select per member, remove action
### 9.5 Notifications ✅ — `NotificationSettings.tsx` with email + in-app toggle groups
### 9.6 Integrations ✅ — `IntegrationsList.tsx` with 8 integrations, connect/disconnect, category filter
### 9.7 Billing ✅ — `Billing.tsx` with plan card, usage Progress bars, plan comparison, invoices table

---

## Phase 10 — Dashboard rewire (`/admin`) ✅ COMPLETE

- [x] Replaced all static data with React Query hooks
- [x] KPI cards (Published / Pending Review / Failed) from `content.api.ts`
- [x] Upcoming schedule list: next 4 scheduled ContentItems with platform badge
- [x] Volume chart: last 14-day stacked BarChart by status (published/draft/failed)
- [x] Mini calendar: highlights days with scheduled posts + today's date
- [x] Quick actions bar: Create Content + View Approvals wired to routes
- [x] Fixed `@mantine/charts` → `@peppermint/ui` import (was violating stack rules)

---

## Definition of Done (per phase / module)

Before marking a phase done:
- [ ] All routes in the phase render and are reachable from the sidebar
- [ ] All four states (loading skeletons / empty with CTA / error with retry / populated) implemented for every data-bound view
- [ ] All listed actions work end-to-end against the mock API and persist within the session
- [ ] All data access goes through typed `*.api.ts` + React Query hooks; no fetch calls or hardcoded data in components
- [ ] Mutations invalidate the right queries and show success/error toasts
- [ ] `// TODO(backend):` comments mark every place needing a real endpoint
- [ ] TypeScript compiles with no errors; no `any` on domain types
- [ ] Every page has a proper header (Group with title + description, or `ModuleHeader` with breadcrumbs where multi-level)
