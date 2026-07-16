"use client";

import { Box, Group, Paper, Stack, Text } from "@peppermint/ui";
import { FlagIcon } from "@phosphor-icons/react/dist/csr/Flag";
import { TargetIcon } from "@phosphor-icons/react/dist/csr/Target";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";

import { MonoText, SectionLabel } from "@/components";
import { tokens } from "@/config/design";
import type { ScheduleItem, ScheduleKind } from "../../module.api";
import type { ScheduleRailProps } from "./ScheduleRail.types";

// loading/error/permission handled by the parent ModuleDashboard.
// This rail is a pure timeline readout (spec §9): it shows meetings, focus
// blocks, deadlines, and plain free-time gaps. It makes NO workload-vs-capacity
// judgment and carries no time estimates (spec §11).

const AMBER = "rgb(176,116,20)";

/** Icon + accent color per timed kind (gaps render without an icon). */
const KIND_STYLE: Record<
  Exclude<ScheduleKind, "gap">,
  { color: string; Icon: typeof UsersThreeIcon }
> = {
  meeting: { color: tokens.blueInk, Icon: UsersThreeIcon },
  focus_block: { color: tokens.accentDark, Icon: TargetIcon },
  deadline: { color: AMBER, Icon: FlagIcon },
};

/** A single timeline row — time column · tinted icon chip · label. */
function ScheduleRow({ item }: { item: ScheduleItem }) {
  if (item.kind === "gap") {
    return (
      <Box
        py={9}
        px={14}
        style={{
          borderRadius: tokens.radius.pill,
          background: tokens.greenTint,
        }}
      >
        <Text fz="11.5px" fw={600} c={tokens.muted2}>
          {item.label}
        </Text>
      </Box>
    );
  }

  const { color, Icon } = KIND_STYLE[item.kind];

  return (
    <Group gap={12} wrap="nowrap" align="center">
      <MonoText
        fz="11px"
        fw={700}
        c={tokens.muted2}
        ta="right"
        style={{ width: 64, flex: "0 0 auto" }}
      >
        {item.time}
      </MonoText>

      <Box
        w={26}
        h={26}
        style={{
          borderRadius: 8,
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
      >
        <Icon size={14} weight="bold" color={color} aria-hidden />
      </Box>

      <Text fz="13px" fw={600} c={tokens.ink} style={{ minWidth: 0 }}>
        {item.label}
      </Text>
    </Group>
  );
}

export function ScheduleRail({ items }: ScheduleRailProps) {
  return (
    <Paper
      withBorder
      radius={tokens.radius.tile}
      p={18}
      style={{ background: "#fff", boxShadow: tokens.shadow.card }}
    >
      <Stack gap={14}>
        <SectionLabel>Today&rsquo;s schedule</SectionLabel>

        {items.length === 0 ? (
          <Stack align="center" gap={4} py={20}>
            <Text fz="14px" fw={600} c={tokens.muted2}>
              Nothing scheduled today
            </Text>
            <Text fz="12px" fw={500} c={tokens.muted} ta="center">
              A clear day — your focus tasks set the pace.
            </Text>
          </Stack>
        ) : (
          <Box style={{ position: "relative" }}>
            {/* Subtle connecting rail behind the icon chips. */}
            <Box
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 64 + 12 + 13,
                width: 1,
                background: tokens.line,
              }}
            />
            <Stack gap={10} style={{ position: "relative" }}>
              {items.map((item) => (
                <ScheduleRow key={item.id} item={item} />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
