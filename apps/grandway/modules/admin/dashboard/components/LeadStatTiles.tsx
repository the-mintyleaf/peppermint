"use client";

import { Box, Stack } from "@peppermint/ui";
import { BellRingingIcon } from "@phosphor-icons/react/dist/csr/BellRinging";
import { HandshakeIcon } from "@phosphor-icons/react/dist/csr/Handshake";
import { useLeadBoardData } from "@/modules/admin/lead-management/leadManagement.hooks";
import { useDashboardPipeline } from "../dashboard.hooks";
import { toneForShare } from "../dashboard.tone";
import { StatTile } from "./StatTile";
import type { LeadStatTilesProps } from "./LeadStatTiles.types";

/**
 * The two lead figures that are exceptions rather than volumes, kept out of the
 * composite card so they can be loud when they need to be (§1.1 — emphasis is
 * borrowed from what you suppress).
 *
 * "Needs attention" is the client-computed category the lead board already uses
 * (`categorizeLead`), read from the SAME cached query the board and the queue
 * card read — so the tile, the queue beside it and the board can never disagree.
 * Its tone is a share, not a fixed threshold: twelve untouched leads out of
 * forty is a bad day, twelve out of twelve hundred is a Tuesday.
 */
export function LeadStatTiles({ filters }: LeadStatTilesProps) {
  const board = useLeadBoardData(filters.fiscalYear || null);
  const pipeline = useDashboardPipeline(filters);

  const needsAttention = board.isLoading
    ? undefined
    : board.counts.needs_attention;
  const converted = pipeline.data?.leads_by_stage.converted;

  return (
    <Stack gap="md" h="100%">
      <Box style={{ flex: 1 }}>
        <StatTile
          label="Needs attention"
          value={needsAttention}
          icon={BellRingingIcon}
          size="sm"
          tone={toneForShare(needsAttention, board.total)}
          caption="Untouched past the follow-up window"
          isPending={board.isLoading}
          isError={board.isError}
        />
      </Box>
      <Box style={{ flex: 1 }}>
        <StatTile
          label="Converted"
          value={converted}
          icon={HandshakeIcon}
          size="sm"
          tone={converted ? "good" : "neutral"}
          caption="Leads that became applicants"
          isPending={pipeline.isPending}
          isError={pipeline.isError}
        />
      </Box>
    </Stack>
  );
}
