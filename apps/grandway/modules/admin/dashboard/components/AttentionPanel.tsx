"use client";

import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { SimpleGrid, Stack, Text } from "@peppermint/ui";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";
import { FileMagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/FileMagnifyingGlass";
import { HandshakeIcon } from "@phosphor-icons/react/dist/csr/Handshake";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { useDashboardSummary } from "../dashboard.hooks";
import { toneForAlert, type AlertBand } from "../dashboard.tone";
import type { DashboardSummary } from "../dashboard.types";
import { PanelCard } from "./PanelCard";
import { SectionState } from "./SectionState";
import { StatTile } from "./StatTile";
import type { AttentionPanelProps } from "./AttentionPanel.types";

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
  },
  {
    key: "rejected_files",
    label: "Rejected files",
    icon: FileMagnifyingGlassIcon,
    band: "critical",
    href: "/admin/files",
    destination: "Files",
  },
  {
    key: "blocked_checklist_items",
    label: "Blocked checklist items",
    icon: ListChecksIcon,
    band: "warning",
    href: "/admin/checklists",
    destination: "Checklists",
  },
  {
    key: "stale_leads",
    label: "Stale leads",
    icon: AddressBookIcon,
    band: "warning",
    href: "/admin/lead-management",
    destination: "Lead board",
  },
  {
    key: "journeys_without_a_checklist",
    label: "Journeys without a checklist",
    icon: CompassIcon,
    band: "warning",
    href: "/admin/applicant-journeys",
    destination: "Journeys",
  },
  {
    key: "offers_awaiting_response",
    label: "Offers awaiting response",
    icon: HandshakeIcon,
    band: "info",
    href: "/admin/offers",
    destination: "Offers",
  },
  {
    key: "files_awaiting_verification",
    label: "Files awaiting verification",
    icon: FileMagnifyingGlassIcon,
    band: "info",
    href: "/admin/files",
    destination: "Files",
  },
  {
    key: "due_soon_checklist_items",
    label: "Due soon",
    icon: ListChecksIcon,
    band: "info",
    href: "/admin/checklists",
    destination: "Checklists",
  },
];

/**
 * The eight things that need a human. All eight come from ONE `/summary/`
 * request, so the grid is internally consistent even though the rest of the page
 * carries no cross-section consistency guarantee (INTEGRATION.md §3).
 *
 * Every tile is a button into the owning module's plain list — the alert says
 * how many, the list is where you do something about it. Tone is computed from
 * each figure, so the panel is a wall of calm teal on a good morning and only
 * the breached band is red, which is the whole point of putting them together.
 */
export function AttentionPanel({ filters }: AttentionPanelProps) {
  const router = useRouter();
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardSummary(filters);

  return (
    <PanelCard
      title="Needs attention"
      subtitle="Everything with a clock on it, in one request"
      icon={WarningIcon}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load the headline figures."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={320}
      >
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            {ALERTS.map((spec) => {
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

          {data ? (
            <Text size="xs" c="dimmed">
              Due-soon horizon: {data.due_within_days} days.
            </Text>
          ) : null}
        </Stack>
      </SectionState>
    </PanelCard>
  );
}
