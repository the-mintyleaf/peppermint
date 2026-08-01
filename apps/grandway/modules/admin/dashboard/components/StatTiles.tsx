"use client";

import type { ComponentType } from "react";
import { Button, Group, SimpleGrid, Stack, Text } from "@peppermint/ui";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { HandshakeIcon } from "@phosphor-icons/react/dist/csr/Handshake";
import { FileMagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/FileMagnifyingGlass";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { useDashboardSummary } from "../dashboard.hooks";
import { DASHBOARD_TAB_META, type DashboardTab } from "../dashboard.tabs";
import type { DashboardSummary } from "../dashboard.types";
import { StatTile } from "./StatTile";
import type { StatTileTone } from "./StatTile.types";
import type { StatTilesProps } from "./StatTiles.types";

type AlertKey = keyof DashboardSummary["alerts"];
type VolumeKey = keyof DashboardSummary["volumes"];

type IconType = ComponentType<{ size?: number }>;

interface VolumeSpec {
  key: VolumeKey;
  label: string;
  icon: IconType;
}

interface AlertSpec {
  key: AlertKey;
  label: string;
  icon: IconType;
  tone: StatTileTone;
  tab: DashboardTab;
}

/**
 * The three standing totals — context for every other figure on the page, and
 * never an alert (there is no such thing as "too many leads").
 */
const VOLUMES: VolumeSpec[] = [
  { key: "leads_total", label: "Total leads", icon: AddressBookIcon },
  { key: "applicants_active", label: "Active applicants", icon: UsersIcon },
  { key: "journeys_total", label: "Total journeys", icon: CompassIcon },
];

/**
 * The eight alerts, ordered by severity band and then by how directly they block
 * someone: red = an SLA already breached, orange = aging or at risk, gray = a
 * routine queue with no clock on it. The icon is the ENTITY's nav glyph, so
 * three checklist alerts share `ListChecks` and are told apart by label + tone.
 */
const ALERTS: AlertSpec[] = [
  {
    key: "overdue_checklist_items",
    label: "Overdue checklist items",
    icon: ListChecksIcon,
    tone: "critical",
    tab: "today",
  },
  {
    key: "rejected_files",
    label: "Rejected files",
    icon: FileMagnifyingGlassIcon,
    tone: "critical",
    tab: "blockers",
  },
  {
    key: "blocked_checklist_items",
    label: "Blocked checklist items",
    icon: ListChecksIcon,
    tone: "warning",
    tab: "blockers",
  },
  {
    key: "stale_leads",
    label: "Stale leads",
    icon: AddressBookIcon,
    tone: "warning",
    tab: "today",
  },
  {
    key: "journeys_without_a_checklist",
    label: "Journeys without a checklist",
    icon: CompassIcon,
    tone: "warning",
    tab: "blockers",
  },
  {
    key: "offers_awaiting_response",
    label: "Offers awaiting response",
    icon: HandshakeIcon,
    tone: "routine",
    tab: "today",
  },
  {
    key: "files_awaiting_verification",
    label: "Files awaiting verification",
    icon: FileMagnifyingGlassIcon,
    tone: "routine",
    tab: "today",
  },
  {
    key: "due_soon_checklist_items",
    label: "Due soon",
    icon: ListChecksIcon,
    tone: "routine",
    tab: "today",
  },
];

/**
 * The first band of the dashboard: every top-level number `/summary/` returns,
 * as one scannable grid — three standing volumes, then the eight alerts by
 * severity. Activating an alert tile opens the tab holding its rows, which is
 * why those tiles are buttons and the volume tiles are not: a volume has no
 * "rows behind it" to go to.
 *
 * All eleven come from ONE request, so the grid is internally consistent even
 * though the rest of the page has no cross-section consistency guarantee
 * (INTEGRATION.md §3).
 */
export function StatTiles({ filters, onOpenTab }: StatTilesProps) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardSummary(filters);

  return (
    <Stack gap="sm">
      {isError ? (
        <Group gap="sm">
          <Text size="sm" c="dimmed">
            Couldn&apos;t load the headline figures.
          </Text>
          <Button
            size="compact-xs"
            variant="default"
            leftSection={<ArrowClockwiseIcon size={13} aria-hidden />}
            onClick={() => refetch()}
            loading={isRefetching}
          >
            Retry
          </Button>
        </Group>
      ) : null}

      <SimpleGrid cols={{ base: 2, sm: 3, lg: 4, xl: 6 }} spacing="sm">
        {VOLUMES.map((spec) => (
          <StatTile
            key={spec.key}
            label={spec.label}
            value={data?.volumes[spec.key]}
            icon={spec.icon}
            tone="volume"
            isPending={isPending}
            isError={isError}
          />
        ))}

        {ALERTS.map((spec) => (
          <StatTile
            key={spec.key}
            label={spec.label}
            value={data?.alerts[spec.key]}
            icon={spec.icon}
            tone={spec.tone}
            isPending={isPending}
            isError={isError}
            onActivate={() => onOpenTab(spec.tab)}
            activateLabel={`${spec.label}: ${
              data ? data.alerts[spec.key] : "unavailable"
            }. Open ${DASHBOARD_TAB_META[spec.tab].label}.`}
          />
        ))}
      </SimpleGrid>

      {data ? (
        <Text size="xs" c="dimmed">
          Due-soon horizon: {data.due_within_days} days. Select an alert to open
          the queue behind it.
        </Text>
      ) : null}
    </Stack>
  );
}
