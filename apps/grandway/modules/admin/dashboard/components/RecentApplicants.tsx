"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor, Divider, Stack, Text } from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { useRecentApplicants } from "../dashboard.hooks";
import { ApplicantRowView } from "./ApplicantRowView";
import { PanelCard } from "./PanelCard";
import { SectionState } from "./SectionState";
import type { RecentApplicantsProps } from "./RecentApplicants.types";

const VISIBLE_ROWS = 6;

/**
 * `creation_source` is a real server-side filter on `/applicants/`, so these
 * three views are three server answers — not one list sliced in the browser,
 * which would make "6 shown" mean something different in each view.
 */
const VIEWS = [
  {
    value: "all",
    label: "All new applicants",
    description: "However they arrived",
  },
  {
    value: "lead_conversion",
    label: "Converted from a lead",
    description: "Came through the lead pipeline",
  },
  {
    value: "direct_admin",
    label: "Added directly",
    description: "Entered by an admin, no lead behind them",
  },
];

/**
 * Who just joined the roll. `/applicants/` is newest-first by contract with no
 * client-controlled ordering, so this is honestly just its first page — there is
 * no sort to send and none is pretended.
 *
 * It sits beside the destination chart because the two answer one question
 * between them: where the book of work is, and what is being added to it.
 */
export function RecentApplicants({ filters }: RecentApplicantsProps) {
  const [view, setView] = useState("all");
  const source = view === "all" ? null : view;
  const { data, isPending, isError, refetch, isRefetching } =
    useRecentApplicants(filters, source, VISIBLE_ROWS);

  const rows = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  return (
    <PanelCard
      title="Recently added applicants"
      subtitle={VIEWS.find((entry) => entry.value === view)?.description}
      icon={UserPlusIcon}
      views={VIEWS}
      activeView={view}
      onViewChange={setView}
      actions={
        <Anchor component={Link} href="/admin/applicants" size="xs" fw={500}>
          Open applicants <ArrowRightIcon size={11} aria-hidden />
        </Anchor>
      }
      minBodyHeight={300}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load applicants."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        isEmpty={rows.length === 0}
        emptyMessage="No applicants added in this scope yet."
        skeletonHeight={300}
      >
        <Stack gap={0}>
          {rows.map((applicant, index) => (
            <Stack key={applicant.id} gap={0}>
              {index > 0 ? <Divider /> : null}
              <ApplicantRowView applicant={applicant} />
            </Stack>
          ))}

          {total > rows.length ? (
            <Text size="xs" c="dimmed" pt="xs">
              Showing the {rows.length} newest of {total.toLocaleString()}.
            </Text>
          ) : null}
        </Stack>
      </SectionState>
    </PanelCard>
  );
}
