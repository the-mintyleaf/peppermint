"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor, Stack, Text } from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { STAGE_LABELS as JOURNEY_STAGE_LABELS } from "@/modules/admin/applicant-journeys/applicantJourneys.labels";
import {
  OFFER_STATUS_COLORS,
  OFFER_STATUS_LABELS,
} from "@/modules/admin/offers/offers.labels";
import {
  CHECKLIST_STATUS_COLORS,
  CHECKLIST_STATUS_LABELS,
} from "@/modules/admin/checklists/checklists.labels";
import { STATUS_META as DOCUMENT_STATUS_META } from "@/modules/documents/documents.status";
import {
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "@/modules/admin/uploaded-files/uploadedFiles.labels";
import { useDashboardPipeline } from "../dashboard.hooks";
import type { DashboardPipeline } from "../dashboard.types";
import { CategoryBarChart } from "./CategoryBarChart";
import { DistributionBar } from "./DistributionBar";
import { DonutStat } from "./DonutStat";
import { PanelCard } from "./PanelCard";
import { SectionState } from "./SectionState";
import type { PipelinePanelProps } from "./PipelinePanel.types";

/**
 * `leads_by_stage` and `applicants_by_status` are NOT views here — the leads and
 * applicants bands above already own those figures, and nothing on this page
 * renders twice. All of it is one cached `pipeline` request either way, so where
 * a count appears is a render decision, never a fetch decision.
 */
const VIEWS = [
  {
    value: "journeys",
    label: "Journeys by stage",
    description: "Where the study journeys sit",
    href: "/admin/applicant-journeys",
  },
  {
    value: "offers",
    label: "Offers by status",
    description: "Issued, accepted, expired…",
    href: "/admin/offers",
  },
  {
    value: "checklists",
    label: "Checklists by status",
    description: "Draft through archived",
    href: "/admin/checklists",
  },
  {
    value: "documents",
    label: "Documents & files",
    description: "Two distributions, never one total",
    href: "/admin/documents/all",
  },
];

function toDonutItems<K extends string>(
  counts: Record<K, number>,
  labels: Record<K, string>,
  colors: Record<K, string>,
) {
  return (Object.keys(counts) as K[]).map((key) => ({
    label: labels[key],
    value: counts[key],
    color: colors[key],
  }));
}

function total(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, value) => sum + value, 0);
}

function PipelineView({
  view,
  data,
}: {
  view: string;
  data: DashboardPipeline;
}) {
  if (view === "journeys") {
    return (
      <CategoryBarChart
        orientation="horizontal"
        color="brand"
        ariaLabel="Journeys by stage"
        items={(
          Object.keys(data.journeys_by_stage) as Array<
            keyof typeof data.journeys_by_stage
          >
        ).map((key) => ({
          label: JOURNEY_STAGE_LABELS[key],
          value: data.journeys_by_stage[key],
        }))}
      />
    );
  }

  if (view === "offers") {
    return (
      <DonutStat
        items={toDonutItems(
          data.offers_by_status,
          OFFER_STATUS_LABELS,
          OFFER_STATUS_COLORS,
        )}
        centerValue={total(data.offers_by_status)}
        centerLabel="offers"
      />
    );
  }

  if (view === "checklists") {
    return (
      <DonutStat
        items={toDonutItems(
          data.checklists_by_status,
          CHECKLIST_STATUS_LABELS,
          CHECKLIST_STATUS_COLORS,
        )}
        centerValue={total(data.checklists_by_status)}
        centerLabel="checklists"
      />
    );
  }

  return (
    <Stack gap="lg">
      <DistributionBar
        heading="Documents"
        data={(
          Object.keys(data.documents_by_status) as Array<
            keyof typeof data.documents_by_status
          >
        ).map((key) => ({
          key,
          label: DOCUMENT_STATUS_META[key].label,
          color: DOCUMENT_STATUS_META[key].color,
          value: data.documents_by_status[key],
        }))}
      />
      <DistributionBar
        heading="Files"
        data={(
          Object.keys(data.files_by_verification) as Array<
            keyof typeof data.files_by_verification
          >
        ).map((key) => ({
          key,
          label: VERIFICATION_STATUS_LABELS[key],
          color: VERIFICATION_STATUS_COLORS[key],
          value: data.files_by_verification[key],
        }))}
      />
      {/* Always `false`; it exists so the panel can be labelled honestly rather
          than imply the country filter reached a document. */}
      {data.documents_by_status_is_country_filtered === false ? (
        <Text size="xs" c="dimmed">
          Documents are never narrowed by the country filter — a document
          belongs to an applicant, not a study destination.
        </Text>
      ) : null}
    </Stack>
  );
}

/**
 * Where everything is. The zero-filled count maps windowed on CREATION date
 * (INTEGRATION.md §7), one view at a time.
 *
 * Chart grammar is the section's, not the view's: a status **breakdown** of a
 * total is a ring, an ordered **magnitude** is a single-hue bar chart, and two
 * small heterogeneous sets stay stacked `Progress` bars. Each view links to its
 * owning module's PLAIN list — this app's shells let `forceFilters` win over a
 * column filter, so a `?status=` deep link would lock the control rather than
 * seed it, and the contract offers no drill-down guarantee anyway (§9).
 */
export function PipelinePanel({ filters }: PipelinePanelProps) {
  const [view, setView] = useState("journeys");
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardPipeline(filters);
  const active = VIEWS.find((entry) => entry.value === view);

  return (
    <PanelCard
      title="Pipeline"
      subtitle={active?.description}
      icon={FunnelIcon}
      views={VIEWS}
      activeView={view}
      onViewChange={setView}
      actions={
        active ? (
          <Anchor component={Link} href={active.href} size="xs" fw={500}>
            View list <ArrowRightIcon size={11} aria-hidden />
          </Anchor>
        ) : null
      }
      minBodyHeight={300}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load pipeline counts."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={300}
      >
        {data ? <PipelineView view={view} data={data} /> : null}
      </SectionState>
    </PanelCard>
  );
}
