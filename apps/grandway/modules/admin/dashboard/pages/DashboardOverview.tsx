"use client";

import type { ComponentType } from "react";
import { ModuleErrorBoundary } from "@peppermint/admin";
import {
  ModalPaper,
  ModuleHeader,
  Stack,
  Tabs,
  Text,
  useQueryClient,
} from "@peppermint/ui";
import { useCapabilities } from "@/config/access";
import { applicantsQueryKeys } from "@/modules/admin/applicants/applicants.queryKeys";
import { dueRemindersKey } from "@/modules/admin/reminders/reminders.queryKeys";
import {
  useDashboardFilters,
  useDashboardSummary,
  useDashboardTab,
} from "../dashboard.hooks";
import {
  visibleDashboardTabs,
  type DashboardTabValue,
} from "../dashboard.tabs";
import {
  ApplicantsBand,
  LeadsBand,
  OperationsBand,
} from "../components/DashboardBands";
import { DashboardGreeting } from "../components/DashboardGreeting";
import { DashboardHeaderControls } from "../components/DashboardHeaderControls";
import { OverviewStats } from "../components/OverviewStats";
import { SectionBand } from "../components/SectionBand";
import type { DashboardBandProps } from "../components/DashboardBands.types";

/**
 * Every cache root the "Refresh all" control has to reach.
 *
 * `["dashboard"]` covers the eight contract sections. The other two are
 * cross-module reads that sit under their own roots — the Follow-ups card
 * (`reminders.due`) and the per-country applicant counts / recent applicants
 * (`applicants`) — and a prefix match will never find them from here.
 */
const REFRESH_KEYS = [
  ["dashboard"],
  dueRemindersKey(),
  applicantsQueryKeys.all,
] as const;

/** The body each tab renders. Keyed by tab value so the tab list stays the one
 *  place a tab is declared — adding a tab to `dashboard.tabs.ts` without a band
 *  here is a type error rather than an empty panel. */
const BANDS: Record<DashboardTabValue, ComponentType<DashboardBandProps>> = {
  leads: LeadsBand,
  applicants: ApplicantsBand,
  operations: OperationsBand,
};

/**
 * The operational command centre, read top to bottom.
 *
 * The page opens on the operator by name, then answers the two questions a
 * dashboard owes, in the order it owes them (`DESIGN.md` Part 5C):
 *
 * 1. **Is the office healthy?** — `OverviewStats`, always visible above the bar:
 *    three standing volumes and the eight things with a clock on them, out of
 *    ONE `/summary/` request. Nothing that needs a human is ever behind a tab,
 *    because an alert one click away is an alert nobody sees on the morning it
 *    matters ("at a glance, no tab-hunting").
 * 2. **What is behind those figures?** — the tabs, in the order the work decays:
 *    leads rot fastest, the people those leads became come second, and standing
 *    measurement comes last.
 *
 * The eight contract sections stay independent — one request each, one
 * `ModuleErrorBoundary` per region, so a slow or failing section never blocks
 * the rest of the page (CONCEPT.md). `keepMounted={false}` is load-bearing:
 * Mantine keeps hidden panels mounted by DEFAULT, which would fire every tab's
 * queries on first paint and quietly undo the whole saving. With it the page
 * opens on the headline request plus one band's, and React Query keeps what has
 * already landed, so coming back to a tab is instant rather than a second
 * round-trip.
 *
 * **Follow-ups is a ninth section that is not part of the dashboard contract at
 * all** — `/api/v1/dashboard/` has no reminder data, so that card reads
 * `/api/v1/reminders/` directly. It carries the same no-cross-section-
 * consistency caveat as the other eight, and it sits in the **Applicants**
 * tab on purpose (see the comment at the card).
 */
export function DashboardOverview() {
  const filters = useDashboardFilters();
  // Staff get the two tabs that ARE the work — the leads waiting on them and the
  // applicants those became. Operations is standing measurement (queues,
  // conversion rates, cross-team workload), which is an Admin's view of the
  // office, not a caseworker's view of their day. The HEADLINE figures above the
  // bar are deliberately NOT gated: the alerts are the office's shared worklist,
  // and every one of them links into a module a `lead_manager` can already open.
  const caps = useCapabilities();
  const tabs = visibleDashboardTabs(caps);
  const { tab, setTab } = useDashboardTab(tabs);
  const queryClient = useQueryClient();
  // `summary` only for its fetch time — `OverviewStats` reads the same cached entry.
  const { dataUpdatedAt } = useDashboardSummary(filters);
  const resetKeys = [filters.fiscalYear, filters.country];

  // The control is labelled "Refresh all", so it must reach every card —
  // including the ones that read another module's endpoint and therefore live
  // outside the `["dashboard"]` prefix. Missing one of these is silent: the card
  // simply keeps its cached answer while everything around it moves.
  const refreshAll = () => {
    REFRESH_KEYS.forEach((queryKey) => {
      void queryClient.invalidateQueries({ queryKey });
    });
  };

  return (
    <>
      <ModuleHeader breadcrumbItems={[{ label: "Home", href: "/admin" }]} />

      {/* `ModalPaper` is a fixed-height box with `overflow: hidden` — a report
          page has no internal scroll of its own, so it would be clipped.
          Override to scroll vertically inside the paper. */}
      <ModalPaper withBorder style={{ overflowY: "auto" }}>
        <Stack gap="xl" p="md">
          <DashboardGreeting
            controls={
              <DashboardHeaderControls
                fiscalYear={filters.fiscalYear}
                country={filters.country}
                fetchedAt={dataUpdatedAt}
                onFiscalYearChange={filters.setFiscalYear}
                onCountryChange={filters.setCountry}
                onRefresh={refreshAll}
              />
            }
          />

          <ModuleErrorBoundary resetKeys={resetKeys}>
            <OverviewStats filters={filters} />
          </ModuleErrorBoundary>

          {/* `keepMounted={false}`: Mantine mounts hidden panels by DEFAULT,
              which would fire every tab's queries on first paint. Only the open
              band should cost anything. */}
          <Tabs value={tab} onChange={setTab} keepMounted={false}>
            <Tabs.List aria-label="Dashboard sections">
              {tabs.map((spec) => (
                <Tabs.Tab
                  key={spec.value}
                  value={spec.value}
                  leftSection={<spec.icon size={16} aria-hidden />}
                >
                  {spec.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {tabs.map((spec) => {
              const Band = BANDS[spec.value];
              return (
                <Tabs.Panel key={spec.value} value={spec.value} pt="md">
                  {/* One boundary per band, not per page: a band that throws
                      leaves the headline figures and the other tabs reachable. */}
                  <ModuleErrorBoundary resetKeys={resetKeys}>
                    <SectionBand subtitle={spec.subtitle}>
                      <Band filters={filters} />
                    </SectionBand>
                  </ModuleErrorBoundary>
                </Tabs.Panel>
              );
            })}
          </Tabs>

          <Text size="xs" c="dimmed" ff="monospace">
            {caps.dashboardOperations
              ? "Access: admin · lead_manager."
              : "Access: lead_manager — the Operations tab is admin-only."}{" "}
            Fiscal year and destination country (top right) scope every card
            except Recent activity, which is fiscal-year only, and Follow-ups,
            which reads neither and covers client reminders as well as applicant
            ones. Overdue and expiry flags are computed server-side, except on
            Follow-ups, where the due day is a Nepal calendar day resolved in
            the browser. Figures come from different endpoints and different
            windows — read each card on its own terms, never across them.
          </Text>
        </Stack>
      </ModalPaper>
    </>
  );
}
