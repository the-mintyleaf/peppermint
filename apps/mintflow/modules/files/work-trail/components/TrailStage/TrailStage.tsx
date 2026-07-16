"use client";

import { Box, Group } from "@peppermint/ui";

import type { TrailStageProps } from "../../WorkTrail.types";

/**
 * One vertical-timeline row: a fixed 48px left rail carrying the node circle and
 * the connector line down to the next stage, plus a flexible content column.
 */
export function TrailStage({
  node,
  connector,
  connectorColor = "rgba(0,0,0,0.4)",
  children,
}: TrailStageProps) {
  return (
    <Group wrap="nowrap" align="stretch" gap={0}>
      <Box style={{ position: "relative", flex: "0 0 48px", width: 48 }}>
        {connector !== "none" ? (
          <Box
            style={{
              position: "absolute",
              left: 23,
              top: 24,
              bottom: 0,
              ...(connector === "solid"
                ? { width: 2, background: connectorColor }
                : { width: 0, borderLeft: `2px dotted ${connectorColor}` }),
            }}
          />
        ) : null}
        <Box style={{ display: "flex", justifyContent: "center" }}>{node}</Box>
      </Box>
      <Box style={{ flex: 1, minWidth: 0, paddingBottom: 26 }}>{children}</Box>
    </Group>
  );
}
