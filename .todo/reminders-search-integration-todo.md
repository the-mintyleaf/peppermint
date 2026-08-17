# Reminders + Global Search — Grandway Frontend Integration

Plan: `/Users/decoffee/.claude/plans/following-things-have-been-synthetic-lemon.md`

## Phase 0 — Sync backend docs

- [ ] Create `apps/grandway/docs/backend/reminders/CONCEPT.md`
- [ ] Create `apps/grandway/docs/backend/reminders/FLOWS.md`
- [ ] Create `apps/grandway/docs/backend/reminders/INTEGRATION.md`
- [ ] Create `apps/grandway/docs/backend/search/CONCEPT.md`
- [ ] Create `apps/grandway/docs/backend/search/FLOWS.md`
- [ ] Create `apps/grandway/docs/backend/search/INTEGRATION.md`
- [ ] Drift-check `apps/grandway/docs/backend/notifications/INTEGRATION.md` to backend v1.1.0 (`custom_reminder`)
- [ ] Commit Phase 0

## Phase 1 — Reminders data layer + capabilities

- [ ] `modules/admin/reminders/reminders.types.ts`
- [ ] `modules/admin/reminders/reminders.queryKeys.ts`
- [ ] `modules/admin/reminders/reminders.api.ts`
- [ ] `modules/admin/reminders/reminders.labels.ts`
- [ ] `modules/admin/reminders/reminders.utils.ts` (incl. `nepalToday()`)
- [ ] `modules/admin/reminders/reminders.hooks.ts`
- [ ] `modules/admin/reminders/index.ts`
- [ ] `config/access/capabilities.types.ts` — add `reminders`, `search`
- [ ] `config/access/capabilities.ts` — wire both for NONE/SUPERADMIN/ADMIN/LEAD_MANAGER
- [ ] Commit Phase 1

## Phase 2 — RecordRemindersPanel + form + wiring

- [ ] `_shared/ReminderRow/`
- [ ] `_shared/RecordRemindersPanel/`
- [ ] `form/ReminderForm/` (run `/form-builder` first)
- [ ] Error-message mapping for 409 / `REMINDERS_OWNER_NOT_FOUND`
- [ ] Wire the Reminders tab into `ApplicantDetail.tsx`
- [ ] Wire the panel into `ClientDetailDrawer.tsx`
- [ ] Commit Phase 2
- [ ] Adversarial review of Phase 2 diff + apply fixes

## Phase 3 — Notifications `custom_reminder`

- [ ] `notifications.types.ts` — add the 15th type
- [ ] `notifications.labels.ts` — label + icon
- [ ] `notifications.utils.ts` — `resolveNotificationLink` case
- [ ] `notifications/docs/AI.md` update
- [ ] Commit Phase 3

## Phase 4 — Dashboard "Follow-ups" panel

- [ ] `dashboard.hooks.ts` — `useDueReminders()`
- [ ] `dashboard/components/RemindersPanel.tsx` (+ `.types.ts`)
- [ ] `dashboard/pages/DashboardOverview.tsx` — place outside the `dashboardOperations` gate
- [ ] `dashboard/docs/AI.md` update
- [ ] Commit Phase 4
- [ ] Adversarial review of Phase 4 diff + apply fixes

## Phase 5 — Global search migration

- [ ] `globalSearch.types.ts` rewrite
- [ ] `globalSearch.api.ts` rewrite (2 endpoints)
- [ ] `globalSearch.routes.ts` (new)
- [ ] `globalSearch.provider.ts` rewrite
- [ ] Delete `globalSearch.sources.ts`
- [ ] `layouts/admin/Admin.tsx` — gate on `caps.search`, set minQueryLength/debounce
- [ ] Commit Phase 5
- [ ] Adversarial review of Phase 5 diff + apply fixes

## Phase 6 — Docs + verification

- [ ] `modules/admin/reminders/docs/AI.md`
- [ ] `apps/grandway/docs/AI.md` — modules table, tree, role gates, cross-module embeds
- [ ] `pnpm format && pnpm check-types && pnpm lint`
- [ ] Commit Phase 6
- [ ] Delete this todo file
