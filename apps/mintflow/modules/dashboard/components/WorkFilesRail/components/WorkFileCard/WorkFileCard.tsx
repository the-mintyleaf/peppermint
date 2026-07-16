"use client";

import {
  Avatar,
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Text,
  Tooltip,
} from "@peppermint/ui";

import { StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { AMBER, AMBER_SOFT, MOSS, MOSS_SOFT } from "../../../../module.api";
import type { WorkFileCardProps } from "./WorkFileCard.types";

/** 0–1 completion → whole-number percent. */
function toPct(completion: number): number {
  return Math.round(completion * 100);
}

/** A single ranked work-file card (spec §7) — presentational, mock data. */
export function WorkFileCard({ file, onOpenFile }: WorkFileCardProps) {
  const pct = toPct(file.completion);

  return (
    <Box
      style={{
        border: `1px solid ${tokens.line}`,
        borderRadius: tokens.radius.card,
        padding: 14,
      }}
    >
      <Stack gap={11}>
        {/* Identity: swatch + name + open count */}
        <Group justify="space-between" wrap="nowrap" align="center" gap={8}>
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
            <Box
              w={9}
              h={9}
              style={{
                borderRadius: 3,
                background: file.swatch,
                flex: "0 0 auto",
              }}
            />
            <Text fz="13px" fw={600} c={tokens.ink} truncate>
              {file.name}
            </Text>
            {file.alert ? (
              <Box
                w={6}
                h={6}
                role="img"
                aria-label="Needs attention"
                style={{
                  borderRadius: "50%",
                  background: AMBER,
                  flex: "0 0 auto",
                }}
              />
            ) : null}
          </Group>
          <Text
            ff="monospace"
            fz="11.5px"
            fw={700}
            c={tokens.muted}
            style={{ flex: "0 0 auto" }}
          >
            {file.openCount}
          </Text>
        </Group>

        <Text fz="11px" fw={500} c={tokens.muted} truncate>
          {file.department} · {file.milestone}
        </Text>

        {/* Progress */}
        <Group gap={9} wrap="nowrap" align="center">
          <Progress
            value={pct}
            color="green"
            size="sm"
            radius="xl"
            style={{ flex: 1 }}
            aria-label={`${pct}% complete`}
          />
          <Text ff="monospace" fz="11.5px" fw={700} c={tokens.ink}>
            {pct}%
          </Text>
        </Group>

        {/* Team + involvement badges */}
        <Group justify="space-between" wrap="nowrap" align="center" gap={8}>
          <Avatar.Group spacing="sm">
            {file.team.map((person) => (
              <Tooltip key={person.name} label={person.name} withArrow>
                <Avatar size={23} radius={7} color={person.color}>
                  {person.initials}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>

          <Group gap={6} wrap="nowrap" align="center">
            <StatusPill fg={MOSS} bg={MOSS_SOFT}>
              {file.yoursCount} yours
            </StatusPill>
            {file.overdueCount > 0 ? (
              <StatusPill fg={AMBER} bg={AMBER_SOFT} dot={AMBER}>
                {file.overdueCount} overdue
              </StatusPill>
            ) : null}
          </Group>
        </Group>

        <Button
          color="accent"
          radius="md"
          size="compact-sm"
          fullWidth
          onClick={() => onOpenFile(file)}
        >
          Open work file
        </Button>
      </Stack>
    </Box>
  );
}
