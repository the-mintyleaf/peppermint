"use client";

import type { ComponentType, ReactNode } from "react";
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
import {
  TONE_COLOR,
  toneForAlert,
  worstTone,
  type AlertBand,
  type FigureTone,
} from "../dashboard.tone";
import type { DashboardSummary } from "../dashboard.types";
import { DonutStat } from "./DonutStat";
import { MeterBar } from "./MeterBar";
import { OverviewCard, OverviewFigure } from "./OverviewCard";
import { SectionState } from "./SectionState";
import type { OverviewStatsProps } from "./OverviewStats.types";

/** One figure inside a card that carries several. */
interface AlertFigure {
  key: keyof DashboardSummary["alerts"];
  label: string;
  band: AlertBand;
}

interface CardSpec {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  /** The figures this card carries — one, or several to chart together. */
  figures: AlertFigure[];
  /** The owning module's PLAIN list. Never a `?status=` seed — this app's shells
   *  let `forceFilters` win over a column filter, so a seeded filter would lock
   *  the control rather than pre-fill it (`apps/grandway/docs/AI.md`). */
  href: string;
  destination: string;
  /**
   * The capability `href`'s route ACTUALLY checks — not the one that sounds
   * right. A card whose destination would 403 is not shown at all: every card
   * here is a button, and a button that lands the operator on "Access
   * Forbidden" is worse than the figure being absent. Keep this in step with
   * the gate on the destination page, not with the nav rail (the rail gates
   * `/admin/files/review` on `fileReview`; the page itself gates on
   * `documents`, and the page is what decides whether the click works).
   */
  capability: CapabilityName;
  /**
   * How the card draws its figures. `meters` compares magnitudes, `donut` splits
   * a total into named parts, `figure` is a single number — the module's chart
   * grammar (`dashboard.chartConfig.ts`), applied one level up.
   */
  shape: "figure" | "meters" | "donut";
  /** For a single-figure card: the volume it is a share OF, for context. */
  shareOf?: { key: keyof DashboardSummary["volumes"]; label: string };
}

/**
 * The alerts, grouped by the module you would go to about them.
 *
 * Eight figures, five cards. Grouping by destination is what lets a card carry a
 * chart at all — three checklist figures compared against each other say
 * something none of them says alone ("the overdue pile is twice the blocked
 * one") — and it keeps the promise every card makes: one card, one click, one
 * list. It also collapses the access rule to one gate per card rather than one
 * per figure, which is the shape the gating already wanted.
 *
 * Ordered by severity band, then by how directly the group blocks someone. The
 * icon names the ENTITY and is the glyph that entity wears in the nav rail, so a
 * card and the module it summarises are recognisably the same subject (§1.8).
 */
const ALERT_CARDS: CardSpec[] = [
  {
    id: "checklist-items",
    label: "Checklist items",
    icon: ListChecksIcon,
    figures: [
      { key: "overdue_checklist_items", label: "Overdue", band: "critical" },
      { key: "blocked_checklist_items", label: "Blocked", band: "warning" },
      { key: "due_soon_checklist_items", label: "Due soon", band: "info" },
    ],
    href: "/admin/checklists",
    destination: "Checklists",
    capability: "checklists",
    shape: "meters",
  },
  {
    id: "files",
    label: "Files",
    icon: FileMagnifyingGlassIcon,
    figures: [
      { key: "rejected_files", label: "Rejected", band: "critical" },
      {
        key: "files_awaiting_verification",
        label: "Awaiting",
        band: "info",
      },
    ],
    href: "/admin/files/review",
    destination: "File review",
    capability: "documents",
    shape: "donut",
  },
  {
    id: "stale-leads",
    label: "Stale leads",
    icon: AddressBookIcon,
    figures: [{ key: "stale_leads", label: "Stale leads", band: "warning" }],
    href: "/admin/lead-management",
    destination: "Lead board",
    capability: "leads",
    shape: "figure",
    shareOf: { key: "leads_total", label: "leads" },
  },
  {
    id: "journeys-without-checklist",
    label: "Journeys, no checklist",
    icon: CompassIcon,
    figures: [
      {
        key: "journeys_without_a_checklist",
        label: "Journeys without a checklist",
        band: "warning",
      },
    ],
    href: "/admin/applicant-journeys",
    destination: "Journeys",
    capability: "leads",
    shape: "figure",
    shareOf: { key: "journeys_total", label: "journeys" },
  },
  {
    id: "offers-awaiting",
    label: "Offers awaiting reply",
    icon: HandshakeIcon,
    figures: [
      {
        key: "offers_awaiting_response",
        label: "Offers awaiting response",
        band: "info",
      },
    ],
    href: "/admin/offers",
    destination: "Offers",
    capability: "leads",
    shape: "figure",
  },
];

interface VolumeSpec {
  key: keyof DashboardSummary["volumes"];
  label: string;
  icon: ComponentType<{ size?: number }>;
  caption: string;
}

/**
 * How big the office is, in the window the header controls describe. These are
 * standing totals with no health reading, so they are permanently `neutral` — a
 * volume is never an alert, and toning one would be the page crying wolf.
 *
 * They lead because they are the denominator the alerts are read against: twenty-
 * one stale leads is a bad week against 1,240 leads and a crisis against forty.
 * Two of the alert cards draw that comparison outright, from these same figures.
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

/** The figures a card carries, with each one's own tone resolved. */
function readFigures(spec: CardSpec, data: DashboardSummary | undefined) {
  return spec.figures.map((figure) => {
    const value = data?.alerts[figure.key];
    return {
      ...figure,
      value,
      tone: toneForAlert(value, figure.band),
    };
  });
}

type ReadFigure = ReturnType<typeof readFigures>[number];

/**
 * The card body, per shape. Split out because the three branches have nothing in
 * common but their height, and inlining them would bury the grid in a ternary.
 */
function CardBody({
  spec,
  figures,
  data,
  isPending,
  isError,
}: {
  spec: CardSpec;
  figures: ReadFigure[];
  data: DashboardSummary | undefined;
  isPending: boolean;
  isError: boolean;
}): ReactNode {
  if (spec.shape === "meters") {
    // Scaled against the largest sibling, so the bars answer "which pile is
    // biggest" — the only question three counts of the same thing can share.
    const max = Math.max(1, ...figures.map((figure) => figure.value ?? 0));
    return (
      <Stack gap="sm">
        {figures.map((figure) => (
          <MeterBar
            key={figure.key}
            label={figure.label}
            value={figure.value ?? 0}
            max={max}
            color={TONE_COLOR[figure.tone]}
            display={
              isError || figure.value === undefined
                ? "—"
                : figure.value.toLocaleString()
            }
            muted={!isPending && !isError && figure.value === 0}
            labelWidth={68}
          />
        ))}
      </Stack>
    );
  }

  if (spec.shape === "donut") {
    const total = figures.reduce((sum, figure) => sum + (figure.value ?? 0), 0);
    return (
      <DonutStat
        items={figures.map((figure) => ({
          label: figure.label,
          value: figure.value ?? 0,
          color: TONE_COLOR[figure.tone],
        }))}
        centerValue={isError ? "—" : total.toLocaleString()}
        centerLabel="in queue"
        size={84}
        thickness={10}
        layout="horizontal"
      />
    );
  }

  const [only] = figures;
  return (
    <OverviewFigure
      value={only.value}
      isPending={isPending}
      isError={isError}
      share={
        spec.shareOf
          ? { of: data?.volumes[spec.shareOf.key], label: spec.shareOf.label }
          : undefined
      }
    />
  );
}

/**
 * What the card announces to a screen reader.
 *
 * The button IS the card, so its name has to carry what the card shows — for a
 * multi-figure card that is the individual counts, not their sum. "Checklist
 * items: 24" tells a sighted user nothing the meters don't, but it is the WHOLE
 * message for someone who never sees them, and 12/7/5 and 0/0/24 are very
 * different mornings that both add up to 24.
 */
function cardActivateLabel(
  spec: CardSpec,
  figures: ReadFigure[],
  unreadable: boolean,
): string {
  const open = `Open ${spec.destination}.`;
  if (unreadable) return `${spec.label}: unavailable. ${open}`;
  const parts = figures
    .map((figure) => `${figure.value ?? 0} ${figure.label.toLowerCase()}`)
    .join(", ");
  return `${spec.label}: ${parts}. ${open}`;
}

/** What the footer says a multi-figure card adds up to. */
function alertCaption(spec: CardSpec, figures: ReadFigure[]): string {
  if (spec.figures.length === 1) return `Open ${spec.destination}`;
  const total = figures.reduce((sum, figure) => sum + (figure.value ?? 0), 0);
  return `${total.toLocaleString()} in total · Open ${spec.destination}`;
}

/**
 * The page's headline: how big the office is, and everything with a clock on it
 * — the whole of `/summary/` in one always-visible grid above the tab bar.
 *
 * It sits OUTSIDE the tabs on purpose. The dashboard pattern owes the operator an
 * at-a-glance read of current state with no tab-hunting (`DESIGN.md` Part 5C:
 * freshness -> key health indicators -> exception cards), and an alert that is one
 * click away is an alert nobody sees on the morning it matters. The tabs below
 * hold the *detail* behind these figures, which is a second question.
 *
 * **One card size, three kinds of body.** Every card is the same width and the
 * same height; what differs is whether the answer is a number, a comparison or a
 * split. Eight figures that each got their own tile said less than five cards
 * that group them by the module you would go to — a chart of three checklist
 * counts says "the overdue pile is twice the blocked one", which no one of them
 * says alone.
 *
 * All eleven figures come from ONE `/summary/` request, so this region is
 * internally consistent even though the rest of the page carries no cross-section
 * consistency guarantee (INTEGRATION.md §3) — and it costs exactly one request no
 * matter which tab is open. That is also why a share track is only ever drawn
 * against a `volumes` figure: both halves of the fraction arrive together.
 *
 * Every alert card is a button into the owning module's plain list: the card says
 * how many, the list is where you do something about it. Tone is computed from
 * the figures, so this is a wall of calm teal on a good morning and only the
 * breached card is red, which is the whole point of putting them together.
 */
export function OverviewStats({ filters }: OverviewStatsProps) {
  const router = useRouter();
  const caps = useCapabilities();
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardSummary(filters);

  // Only the alerts this caller can actually act on. A `lead_manager` has neither
  // `checklists` nor `documents`, so those two cards would each land them on
  // "Access Forbidden" — they get the three funnel cards and the volumes instead.
  // The request is unchanged either way: `/summary/` returns all eight figures
  // and always did; this only decides what is drawn.
  const alertCards = ALERT_CARDS.filter((spec) => caps[spec.capability]);
  // The horizon only explains the Due soon meter, so it goes when that card does.
  const showsDueSoon = alertCards.some((spec) => spec.id === "checklist-items");

  return (
    <SectionState
      isPending={isPending}
      isError={isError}
      errorMessage="Couldn't load the headline figures."
      onRetry={() => refetch()}
      isRetrying={isRefetching}
      skeletonHeight={360}
    >
      <Stack gap="sm">
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 4 }} spacing="md">
          {VOLUMES.map((spec) => (
            <OverviewCard
              key={spec.key}
              label={spec.label}
              icon={spec.icon}
              caption={spec.caption}
              isPending={isPending}
              isError={isError}
            >
              <OverviewFigure
                value={data?.volumes[spec.key]}
                isPending={isPending}
                isError={isError}
              />
            </OverviewCard>
          ))}

          {alertCards.map((spec) => {
            const figures = readFigures(spec, data);
            // The card wears its worst news — see `worstTone`.
            const tone: FigureTone = worstTone(
              figures.map((figure) => figure.tone),
            );
            return (
              <OverviewCard
                key={spec.id}
                label={spec.label}
                icon={spec.icon}
                tone={tone}
                caption={alertCaption(spec, figures)}
                isPending={isPending}
                isError={isError}
                onActivate={() => router.push(spec.href)}
                activateLabel={cardActivateLabel(
                  spec,
                  figures,
                  isError || isPending,
                )}
              >
                <CardBody
                  spec={spec}
                  figures={figures}
                  data={data}
                  isPending={isPending}
                  isError={isError}
                />
              </OverviewCard>
            );
          })}
        </SimpleGrid>

        {data && showsDueSoon ? (
          <Text size="xs" c="dimmed">
            Due-soon horizon: {data.due_within_days} days. Each card groups the
            alerts for one module and opens that module&apos;s list.
          </Text>
        ) : null}
      </Stack>
    </SectionState>
  );
}
