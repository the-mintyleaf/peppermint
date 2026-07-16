"use client";

import {
  Avatar,
  Box,
  Button,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Tooltip,
} from "@peppermint/ui";
import { PushPinIcon } from "@phosphor-icons/react/dist/csr/PushPin";

import { CaseIcon, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import { AMBER, AMBER_SOFT, MOSS, MOSS_SOFT } from "../../../../module.api";
import type { WorkFileCardProps } from "./WorkFileCard.types";

/** 0–1 completion → whole-number percent. */
function toPct(completion: number): number {
  return Math.round(completion * 100);
}

/** Header: icon + name/meta + open count. Extracted to keep the card small. */
function CardHeader({ file }: { file: WorkFileCardProps["file"] }) {
  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start" gap={10}>
      <Group gap={10} wrap="nowrap" align="center" style={{ minWidth: 0 }}>
        <CaseIcon
          kind={file.icon}
          color={file.swatch}
          tint="rgba(0,0,0,0.05)"
          size={38}
          radius={12}
        />
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Group gap={6} wrap="nowrap" align="center" style={{ minWidth: 0 }}>
            <Text fz={14} fw={700} c={tokens.ink} truncate>
              {file.name}
            </Text>
            {file.pinned ? (
              <PushPinIcon
                size={13}
                weight="fill"
                color={tokens.muted}
                aria-label="Pinned work file"
                style={{ flex: "0 0 auto" }}
              />
            ) : null}
            {file.alert ? (
              <Box
                w={7}
                h={7}
                aria-label="Needs attention"
                style={{
                  borderRadius: "50%",
                  background: AMBER,
                  flex: "0 0 auto",
                }}
              />
            ) : null}
          </Group>
          <Text fz={11} fw={500} c={tokens.muted2} truncate>
            {file.department} · {file.milestone}
          </Text>
        </Stack>
      </Group>

      <Stack gap={0} align="center" style={{ flex: "0 0 auto" }}>
        <Text ff="monospace" fw={700} fz={16} c={tokens.ink} lh={1}>
          {file.openCount}
        </Text>
        <Text fz={9} fw={600} c={tokens.muted} tt="uppercase">
          open
        </Text>
      </Stack>
    </Group>
  );
}

/** A single ranked work-file card (spec §7) — presentational, mock data. */
export function WorkFileCard({ file, onOpenFile }: WorkFileCardProps) {
  const pct = toPct(file.completion);

  return (
    <Paper
      withBorder
      radius={tokens.radius.card}
      p={14}
      bg="white"
      style={{ boxShadow: tokens.shadow.card }}
    >
      <Stack gap={12}>
        <CardHeader file={file} />

        <Stack gap={4}>
          <Progress
            value={pct}
            color="green"
            size="sm"
            radius="xl"
            aria-label={`${pct}% complete`}
          />
          <Text ff="monospace" fz={10} fw={600} c={tokens.muted} ta="right">
            {pct}%
          </Text>
        </Stack>

        <Group justify="space-between" wrap="nowrap" align="center" gap={8}>
          <Avatar.Group>
            {file.team.map((person) => (
              <Tooltip key={person.name} label={person.name} withArrow>
                <Avatar size={24} radius="xl" color={person.color}>
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
          variant="light"
          color="gray"
          radius="xl"
          size="compact-sm"
          fullWidth
          onClick={() => onOpenFile(file)}
        >
          Open work file
        </Button>
      </Stack>
    </Paper>
  );
}
