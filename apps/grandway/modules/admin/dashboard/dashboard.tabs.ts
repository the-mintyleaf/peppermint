import type { ComponentType } from "react";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { GaugeIcon } from "@phosphor-icons/react/dist/csr/Gauge";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import type { Capabilities, CapabilityName } from "@/config/access";

export type DashboardTabValue = "leads" | "applicants" | "operations";

export interface DashboardTabSpec {
  value: DashboardTabValue;
  /** The operator's word for the band, and the name the tab carries. */
  label: string;
  /** The question the tab answers. Sits under the bar, not inside every card. */
  subtitle: string;
  icon: ComponentType<{ size?: number }>;
  /**
   * The capability that makes this tab visible, or `null` for a tab every
   * staff tier gets. Read through `visibleDashboardTabs` — never by branching
   * on a role name, which is how a fourth tier ends up seeing nothing.
   */
  capability: CapabilityName | null;
}

/**
 * The three tabs, in the order the work decays: leads rot fastest, the people
 * those leads became come second, and standing measurement — queues, conversion
 * rates, cross-team workload — comes last because it is an Admin's view of the
 * office rather than a caseworker's view of their day.
 *
 * The icon is the glyph the entity already wears in the nav rail, so a tab and
 * the module it summarises are recognisably the same subject (§1.8).
 *
 * Note what is NOT behind these tabs: the eight alerts and three volumes live
 * above the bar, always visible to both staff tiers. A tab hides detail, never
 * the fact that something needs a human.
 */
export const DASHBOARD_TABS: DashboardTabSpec[] = [
  {
    value: "leads",
    label: "Leads",
    subtitle:
      "Who is waiting to hear from us, and how the live pipeline is shaped.",
    icon: AddressBookIcon,
    capability: null,
  },
  {
    value: "applicants",
    label: "Applicants",
    subtitle:
      "Where the book of work is going, who has just joined it, and what we owe them.",
    icon: UsersIcon,
    capability: null,
  },
  {
    value: "operations",
    label: "Operations",
    subtitle: "The queues, the standing measures, and what just changed.",
    icon: GaugeIcon,
    capability: "dashboardOperations",
  },
];

/** The tabs this caller may open, in declared order. Never empty — the first
 *  two carry no capability, and `AdminHome` has already turned away anyone
 *  without `caps.dashboard`. */
export function visibleDashboardTabs(caps: Capabilities): DashboardTabSpec[] {
  return DASHBOARD_TABS.filter(
    (tab) => tab.capability === null || caps[tab.capability],
  );
}
