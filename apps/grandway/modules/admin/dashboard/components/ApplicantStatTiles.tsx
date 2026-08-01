"use client";

import { Box, Stack } from "@peppermint/ui";
import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { useDashboardPipeline } from "../dashboard.hooks";
import { toneForShare } from "../dashboard.tone";
import { StatTile } from "./StatTile";
import type { ApplicantStatTilesProps } from "./ApplicantStatTiles.types";

/**
 * The two applicant figures the destination chart cannot show: how many people
 * are actually in play, and how many have gone quiet.
 *
 * Both read `pipeline.applicants_by_status` — one request, zero-filled, and the
 * same request the chart's band already needs — so "active" and "dormant" are
 * always two halves of one consistent answer rather than two clocks. Dormant is
 * toned as a share of the roll: it is only a problem relative to how many
 * applicants there are.
 */
export function ApplicantStatTiles({ filters }: ApplicantStatTilesProps) {
  const { data, isPending, isError } = useDashboardPipeline(filters);

  const byStatus = data?.applicants_by_status;
  const roll = byStatus
    ? byStatus.active + byStatus.dormant + byStatus.archived
    : undefined;

  return (
    <Stack gap="md" h="100%">
      <Box style={{ flex: 1 }}>
        <StatTile
          label="Active applicants"
          value={byStatus?.active}
          icon={UsersIcon}
          size="sm"
          tone={byStatus?.active ? "good" : "neutral"}
          caption="People currently in play"
          isPending={isPending}
          isError={isError}
        />
      </Box>
      <Box style={{ flex: 1 }}>
        <StatTile
          label="Dormant"
          value={byStatus?.dormant}
          icon={MoonIcon}
          size="sm"
          tone={toneForShare(byStatus?.dormant, roll)}
          caption="Gone quiet, not archived"
          isPending={isPending}
          isError={isError}
        />
      </Box>
    </Stack>
  );
}
