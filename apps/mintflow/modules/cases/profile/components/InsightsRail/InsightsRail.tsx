"use client";

import {
  Avatar,
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Text,
} from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";

import { MonoText, SectionLabel, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import {
  PRIORITY_METER,
  TASK_STATE_STYLE,
  type CaseView,
} from "../../caseView";
import type { InsightsRailProps } from "./InsightsRail.types";

const CARD_STYLE = {
  background: tokens.paper,
  border: `1px solid ${tokens.line}`,
  borderRadius: tokens.radius.card,
  boxShadow: tokens.shadow.card,
} as const;

/** Dark card: the accountable owner + responsible unit. */
function OwnerCard({ view }: { view: CaseView }) {
  const { owner } = view;
  if (!owner) return null;
  return (
    <Box
      p={20}
      style={{
        background: tokens.tile,
        borderRadius: tokens.radius.card,
        boxShadow: tokens.shadow.nav,
        color: tokens.paper,
      }}
    >
      <SectionLabel c={tokens.accent}>Accountable owner</SectionLabel>
      <Group gap={12} mt={14} wrap="nowrap">
        <Avatar
          color={owner.color}
          radius="md"
          size={44}
          styles={{ placeholder: { fontSize: 15, fontWeight: 700 } }}
        >
          {owner.initials}
        </Avatar>
        <Box style={{ minWidth: 0 }}>
          <Text fz="16px" fw={700} truncate>
            {owner.name}
          </Text>
          <Text fz="12px" c="rgba(255,255,255,0.7)" truncate>
            {owner.role}
          </Text>
        </Box>
      </Group>

      <Group
        gap={8}
        mt={16}
        pt={16}
        wrap="nowrap"
        style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}
      >
        <BuildingsIcon size={15} color="rgba(255,255,255,0.7)" />
        <Text fz="13px" fw={600} truncate>
          {view.unitName}
        </Text>
      </Group>
    </Box>
  );
}

/** Priority read as a 5-segment urgency meter (one per WorkPriority level). */
function PriorityCard({ view }: { view: CaseView }) {
  const meter = PRIORITY_METER[view.priority];
  return (
    <Box p={20} style={CARD_STYLE}>
      <Group gap={9} align="center" wrap="nowrap">
        <SectionLabel>Priority</SectionLabel>
        <Box style={{ flex: 1 }} />
        <StatusPill fg={meter.fg} bg={meter.bg} fz="11px">
          {meter.label}
        </StatusPill>
      </Group>
      <Group gap={5} mt={14} wrap="nowrap">
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            h={8}
            style={{
              flex: 1,
              borderRadius: 4,
              background: i < meter.level ? meter.bar : tokens.line,
            }}
          />
        ))}
      </Group>
      <Text fz="12px" fw={600} mt={12} c={tokens.muted2}>
        {meter.note}
      </Text>
    </Box>
  );
}

/** Completion percentage + a done / in-progress / pending breakdown. */
function ProgressCard({ view }: { view: CaseView }) {
  const { progress, breakdown } = view;
  const rows = [
    {
      label: "Done",
      value: breakdown.done,
      color: TASK_STATE_STYLE.done.color,
    },
    {
      label: "In progress",
      value: breakdown.inProgress,
      color: TASK_STATE_STYLE.in_progress.color,
    },
    {
      label: "Pending",
      value: breakdown.pending,
      color: TASK_STATE_STYLE.pending.color,
    },
  ];
  return (
    <Box p={20} style={CARD_STYLE}>
      <SectionLabel>Progress</SectionLabel>
      <Group gap={9} align="baseline" mt={12}>
        <MonoText
          fz="34px"
          fw={700}
          c={tokens.accentDark}
          style={{ letterSpacing: "-0.02em" }}
        >
          {progress.pct}%
        </MonoText>
        <Text fz="13px" fw={700} c={tokens.muted2}>
          {progress.done}/{progress.total} tasks
        </Text>
      </Group>
      <Progress
        value={progress.pct}
        color="accent"
        size="md"
        radius="xl"
        mt={14}
        aria-label={`Progress ${progress.pct}%`}
      />
      <Stack gap={8} mt={14}>
        {rows.map((row) => (
          <Group key={row.label} gap={9} wrap="nowrap">
            <Box
              w={8}
              h={8}
              style={{
                borderRadius: "50%",
                background: row.color,
                flexShrink: 0,
              }}
            />
            <Text fz="12px" c={tokens.muted2} style={{ flex: 1 }}>
              {row.label}
            </Text>
            <MonoText fz="12px" fw={700} c={tokens.ink}>
              {row.value}
            </MonoText>
          </Group>
        ))}
      </Stack>
    </Box>
  );
}

/** Condensed people list with a link into the People tab. */
function PeopleBrief({ view, onViewPeople }: InsightsRailProps) {
  const brief = view.people.slice(0, 3);
  return (
    <Box p={20} style={CARD_STYLE}>
      <Group gap={9} align="center" wrap="nowrap">
        <SectionLabel>People</SectionLabel>
        <Box style={{ flex: 1 }} />
        <MonoText fz="12px" fw={700} c={tokens.muted}>
          {view.people.length}
        </MonoText>
      </Group>
      <Stack gap={12} mt={14}>
        {brief.map((person) => (
          <Group key={person.id} gap={11} wrap="nowrap">
            <Avatar
              color={person.color}
              radius="xl"
              size={30}
              styles={{ placeholder: { fontSize: 10, fontWeight: 700 } }}
            >
              {person.initials}
            </Avatar>
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Text fz="13px" fw={600} c={tokens.ink} truncate>
                {person.name}
              </Text>
              <Text fz="11px" c={tokens.muted} truncate>
                {person.role}
              </Text>
            </Box>
          </Group>
        ))}
      </Stack>
      {view.people.length > brief.length ? (
        <Button
          fullWidth
          variant="default"
          size="sm"
          mt={16}
          onClick={onViewPeople}
        >
          View all people
        </Button>
      ) : null}
    </Box>
  );
}

/** Right-hand insights rail: owner, priority, progress, people brief. */
export function InsightsRail({ view, onViewPeople }: InsightsRailProps) {
  return (
    <Stack gap={12}>
      <OwnerCard view={view} />
      <PriorityCard view={view} />
      <ProgressCard view={view} />
      <PeopleBrief view={view} onViewPeople={onViewPeople} />
    </Stack>
  );
}
