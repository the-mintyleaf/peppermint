"use client";

import { Box, Button, Group, Stack, Text } from "@peppermint/ui";
import { SunHorizonIcon } from "@phosphor-icons/react/dist/csr/SunHorizon";

import { tokens } from "@/config/design";
import { MOSS } from "../../../../module.api";
import type { MomentumStripProps } from "./MomentumStrip.types";

/**
 * The weekly momentum line — one of only two motivation channels (spec §12).
 * Soft moss strip; rewards keeping commitments, not task volume.
 */
export function MomentumStrip({
  momentum,
  onPlanTomorrow,
}: MomentumStripProps) {
  return (
    <Box
      p={16}
      style={{
        borderRadius: tokens.radius.tile,
        background:
          "linear-gradient(135deg, rgba(16,130,85,0.12) 0%, rgba(143,226,182,0.14) 100%)",
        border: `1px solid ${tokens.greenTint}`,
      }}
    >
      <Group gap={12} wrap="nowrap" align="flex-start">
        <Box
          w={38}
          h={38}
          style={{
            flex: "0 0 auto",
            borderRadius: 12,
            background: "rgba(255,255,255,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SunHorizonIcon size={20} weight="duotone" color={MOSS} />
        </Box>
        <Stack gap={10} style={{ minWidth: 0 }}>
          <Text fz="12.5px" fw={600} c={tokens.ink} style={{ lineHeight: 1.4 }}>
            {momentum.line}
          </Text>
          <Button
            size="compact-sm"
            radius="xl"
            color="green"
            variant="light"
            onClick={onPlanTomorrow}
            style={{ alignSelf: "flex-start" }}
          >
            {momentum.actionLabel}
          </Button>
        </Stack>
      </Group>
    </Box>
  );
}
