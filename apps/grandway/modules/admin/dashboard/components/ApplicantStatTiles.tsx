"use client";

import { Box, Stack } from "@peppermint/ui";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon";
import { useDashboardPipeline } from "../dashboard.hooks";
import { toneForShare } from "../dashboard.tone";
import { StatTile } from "./StatTile";
import type { ApplicantStatTilesProps } from "./ApplicantStatTiles.types";

/**
 * The two applicant figures the destination chart cannot show — and the two the
 * headline row above the tab bar does not already carry.
 *
 * `applicants_by_status` has three keys; "Active" is a `summary.volumes` figure
 * shown in `OverviewStats`, so showing it again here would be the same number
 * twice on one screen from two different endpoints on two different clocks — a
 * disagreement waiting to happen. This band takes the other two: who has gone
 * quiet, and how much of the roll is closed.
 *
 * Both read `pipeline.applicants_by_status` — one request, zero-filled, and the
 * same request the chart's band already needs — so the two tiles are always two
 * parts of one consistent answer. Dormant is toned as a share of the roll: it is
 * only a problem relative to how many applicants there are. Archived carries no
 * tone at all; archiving is the healthy end of the lifecycle, not an alert.
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
      <Box style={{ flex: 1 }}>
        <StatTile
          label="Archived"
          value={byStatus?.archived}
          icon={ArchiveIcon}
          size="sm"
          caption="Closed out of the roll"
          isPending={isPending}
          isError={isError}
        />
      </Box>
    </Stack>
  );
}
