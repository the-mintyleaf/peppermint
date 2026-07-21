"use client";

import { Box, Button, Group, Text } from "@peppermint/ui";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";

import { tokens } from "@/config/design";
import type { MomentumStripProps } from "./MomentumStrip.types";

/**
 * The weekly momentum card — one of only two motivation channels (spec §12).
 * Dark tile surface (the app's signature); rewards keeping commitments, not
 * task volume.
 */
export function MomentumStrip({
  momentum,
  onPlanTomorrow,
}: MomentumStripProps) {
  return (
    <Box
      p={20}
      style={{
        borderRadius: tokens.radius.tile,
        background: tokens.tile,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Group gap={10} wrap="nowrap" align="center" mb={11}>
        <TrendUpIcon size={19} weight="bold" color={tokens.blue} />
        <Text
          fw={600}
          c="#fff"
          style={{ fontSize: 15, letterSpacing: "-0.2px" }}
        >
          {momentum.title}
        </Text>
      </Group>
      <Text
        fz="12.5px"
        fw={500}
        c="rgba(255,255,255,0.62)"
        mb={15}
        style={{ lineHeight: 1.5 }}
      >
        {momentum.line}
      </Text>
      <Button
        color="accent"
        radius="md"
        size="compact-sm"
        onClick={onPlanTomorrow}
      >
        {momentum.actionLabel}
      </Button>
    </Box>
  );
}
