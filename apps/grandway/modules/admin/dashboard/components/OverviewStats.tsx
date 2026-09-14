"use client";

import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { SimpleGrid, Stack, Text } from "@peppermint/ui";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";
import { FileMagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/FileMagnifyingGlass";
import { HandshakeIcon } from "@phosphor-icons/react/dist/csr/Handshake";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { useCapabilities } from "@/config/access";
import type { CapabilityName } from "@/config/access";
import { useDashboardSummary } from "../dashboard.hooks";
import { toneForAlert, type AlertBand } from "../dashboard.tone";
import type { DashboardSummary } from "../dashboard.types";
import { SectionState } from "./SectionState";
import { StatTile } from "./StatTile";
import type { OverviewStatsProps } from "./OverviewStats.types";

interface VolumeSpec {
  key: keyof DashboardSummary["volumes"];
  label: string;
  icon: ComponentType<{ size?: number }>;
  caption: string;
}

/**
 * How big the office is, in the window the header controls describe. These are
 * standing totals with no health reading, so they are permanently `neutral` —
 * a volume is never an alert, and toning one would be the page crying wolf.
 *
 * They lead because they are the denominator the alerts are read against:
 * twenty-one stale leads is a bad week against 1,240 leads and a crisis
 * against forty. Without them the alert wall is eight numbers with no scale.
 */
const VOLUMES: VolumeSpec[] = [
  {
    key: "leads_total",
    label: "Leads",
    icon: AddressBookIcon,
    caption: "Every lead in the window",
  },
  {
    key: "applicants_active",
    label: "Active applicants",
    icon: UsersIcon,
    caption: "People currently in play",
  },
  {
    key: "journeys_total",
    label: "Journeys",
    icon: CompassIcon,
    caption: "Applications under way",
  },
];

interface AlertSpec {
  key: keyof DashboardSummary["alerts"];
  label: string;
  icon: ComponentType<{ size?: number }>;
  band: AlertBand;
  /** The owning module's PLAIN list. Never a `?status=` seed — this app's shells
   *  let `forceFilters` win over a column filter, so a seeded filter would lock
   *  the control rather than pre-fill it (`apps/grandway/docs/AI.md`). */
  href: string;
  destination: string;
  /**
   * The capability `href`'s route ACTUALLY checks — not the one that sounds
   * right. A tile whose destination would 403 is not shown at all: every tile
   * here is a button, and a button that lands the operator on "Access
   * Forbidden" is worse than the figure being absent. Keep this in step with
   * the gate on the destination page, not with the nav rail (the rail gates
   * `/admin/files/review` on `fileReview`; the page itself gates on
   * `documents`, and the page is what decides whether the click works).
   */
  capability: CapabilityName;
}

/**
 * Ordered by severity band, then by how directly the item blocks someone. The
 * icon names the ENTITY and is the glyph that entity wears in the nav rail, so
 * three checklist alerts share `ListChecks` and are told apart by their label
 * and tone rather than by three invented glyphs (§1.8).
 */
const ALERTS: AlertSpec[] = [
  {
    key: "overdue_checklist_items",
    label: "Overdue checklist items",
    icon: ListChecksIcon,
    band: "critical",
    href: "/admin/checklists",
    destination: "Checklists",
    capability: "checklists",
  },
  {
    key: "rejected_files",
    label: "Rejected files",
    icon: FileMagnifyingGlassIcon,
    band: "critical",
    href: "/admin/files/review",
    destination: "File review",
    capability: "documents",
  },
  {
    key: "blocked_checklist_items",
    label: "Blocked checklist items",
    icon: ListChecksIcon,
    band: "warning",
    href: "/admin/checklists",
    destination: "Checklists",
    capability: "checklists",
  },
  {
    key: "stale_leads",
    label: "Stale leads",
    icon: AddressBookIcon,
    band: "warning",
    href: "/admin/lead-management",
    destination: "Lead board",
    capability: "leads",
  },
  {
    key: "journeys_without_a_checklist",
    label: "Journeys without a checklist",
    icon: CompassIcon,
    band: "warning",
    href: "/admin/applicant-journeys",
    destination: "Journeys",
    capability: "leads",
  },
  {
    key: "offers_awaiting_response",
    label: "Offers awaiting response",
    icon: HandshakeIcon,
    band: "info",
    href: "/admin/offers",
    destination: "Offers",
    capability: "leads",
  },
  {
    key: "files_awaiting_verification",
    label: "Files awaiting verification",
    icon: FileMagnifyingGlassIcon,
    band: "info",
    href: "/admin/files/review",
    destination: "File review",
    capability: "documents",
  },
  {
    key: "due_soon_checklist_items",
    label: "Due soon",
    icon: ListChecksIcon,
    band: "info",
    href: "/admin/checklists",
    destination: "Checklists",
    capability: "checklists",
  },
];

/**
 * The page's headline: how big the office is, and the eleven figures that say
 * whether it is healthy — the whole of `/summary/` in one always-visible region
 * above the tab bar.
 *
 * It sits OUTSIDE the tabs on purpose. The dashboard pattern owes the operator
 * an at-a-glance read of current state with no tab-hunting (`DESIGN.md` Part 5C:
 * freshness -> key health indicators -> exception cards), and an alert that is
 * one click away is an alert nobody sees on the morning it matters. The tabs
 * below hold the *detail* behind these figures, which is a second question.
 *
 * All eleven come from ONE `/summary/` request, so this region is internally
 * consistent even though the rest of the page carries no cross-section
 * consistency guarantee (INTEGRATION.md §3) — and it costs exactly one request
 * no matter which tab is open.
 *
 * Every alert tile is a button into the owning module's plain list: the alert
 * says how many, the list is where you do something about it. Tone is computed
 * from each figure, so this is a wall of calm teal on a good morning and only
 * the breached band is red, which is the whole point of putting them together.
 */
export function OverviewStats({ filters }: OverviewStatsProps) {
  const router = useRouter();
  const caps = useCapabilities();
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardSummary(filters);

  // Only the alerts this caller can actually act on. A `lead_manager` has
  // neither `checklists` nor `documents`, so the three checklist tiles and the
  // two file tiles would each land them on "Access Forbidden" — they get the
  // three funnel alerts and the volumes instead. The request is unchanged
  // either way: `/summary/` returns all eight figures and always did.
  const alerts = ALERTS.filter((spec) => caps[spec.capability]);
  // The horizon only explains the Due soon tile, so it goes when that tile does.
  const showsDueSoon = alerts.some(
    (spec) => spec.key === "due_soon_checklist_items",
  );

  return (
    <SectionState
      isPending={isPending}
      isError={isError}
      errorMessage="Couldn't load the headline figures."
      onRetry={() => refetch()}
      isRetrying={isRefetching}
      skeletonHeight={280}
    >
      <Stack gap="sm">
        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md">
          {VOLUMES.map((spec) => (
            <StatTile
              key={spec.key}
              label={spec.label}
              value={data?.volumes[spec.key]}
              icon={spec.icon}
              size="lg"
              caption={spec.caption}
              isPending={isPending}
              isError={isError}
            />
          ))}
        </SimpleGrid>

        {alerts.length > 0 ? (
          <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, lg: 4 }} spacing="sm">
            {alerts.map((spec) => {
              const value = data?.alerts[spec.key];
              return (
                <StatTile
                  key={spec.key}
                  label={spec.label}
                  value={value}
                  icon={spec.icon}
                  size="sm"
                  tone={toneForAlert(value, spec.band)}
                  caption={`Open ${spec.destination}`}
                  isPending={isPending}
                  isError={isError}
                  onActivate={() => router.push(spec.href)}
                  activateLabel={`${spec.label}: ${
                    value ?? "unavailable"
                  }. Open ${spec.destination}.`}
                />
              );
            })}
          </SimpleGrid>
        ) : null}

        {data && showsDueSoon ? (
          <Text size="xs" c="dimmed">
            Due-soon horizon: {data.due_within_days} days.
          </Text>
        ) : null}
      </Stack>
    </SectionState>
  );
}
