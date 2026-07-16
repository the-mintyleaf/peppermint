"use client";

import {
  Avatar,
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Switch,
  Text,
} from "@peppermint/ui";

import { MonoText, SectionLabel, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import {
  PRIORITY_METER,
  TASK_STATE_STYLE,
  caseProgress,
  taskBreakdown,
} from "../../profile.api";
import type { WorkCase } from "../../profile.api";
import type { InsightsRailProps } from "./InsightsRail.types";

const CARD_STYLE = {
  background: tokens.paper,
  border: `1px solid ${tokens.line}`,
  borderRadius: tokens.radius.card,
  boxShadow: tokens.shadow.card,
} as const;

/** Dark card: the lead officer this case reports through + notify toggle. */
function LeadCard({ workCase }: { workCase: WorkCase }) {
  const lead = workCase.officers[0];
  if (!lead) return null;
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
      <SectionLabel c={tokens.accent}>Case lead</SectionLabel>
      <Group gap={12} mt={14} wrap="nowrap">
        <Avatar
          color={lead.color}
          radius="md"
          size={44}
          styles={{ placeholder: { fontSize: 15, fontWeight: 700 } }}
        >
          {lead.initials}
        </Avatar>
        <Box style={{ minWidth: 0 }}>
          <Text fz="16px" fw={700} truncate>
            {lead.name}
          </Text>
          <Text fz="12px" c="rgba(255,255,255,0.7)" truncate>
            {lead.role}
          </Text>
        </Box>
      </Group>

      <Group gap={6} mt={16} wrap="wrap">
        {workCase.departments.map((dept) => (
          <MonoText
            key={dept}
            fz="10px"
            fw={700}
            px={8}
            py={4}
            c="rgba(255,255,255,0.82)"
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: 7,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {dept}
          </MonoText>
        ))}
      </Group>

      <Group
        gap={10}
        mt={16}
        pt={16}
        wrap="nowrap"
        style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}
      >
        <Switch
          defaultChecked
          color="accent"
          size="sm"
          aria-label="Notify the lead on status change"
          styles={{ track: { cursor: "pointer" } }}
        />
        <Box style={{ minWidth: 0 }}>
          <Text fz="13px" fw={700}>
            Notify on status change
          </Text>
          <Text fz="11px" c="rgba(255,255,255,0.68)">
            Lead alerted when this case moves stage
          </Text>
        </Box>
      </Group>
    </Box>
  );
}

/** Priority read as a 4-segment urgency meter. */
function PriorityCard({ workCase }: { workCase: WorkCase }) {
  const meter = PRIORITY_METER[workCase.priority];
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
        {[0, 1, 2, 3].map((i) => (
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
function ProgressCard({ workCase }: { workCase: WorkCase }) {
  const progress = caseProgress(workCase);
  const breakdown = taskBreakdown(workCase);
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

/** Condensed officer list with a link into the People tab. */
function OfficersBrief({ workCase, onViewPeople }: InsightsRailProps) {
  const brief = workCase.officers.slice(0, 3);
  return (
    <Box p={20} style={CARD_STYLE}>
      <Group gap={9} align="center" wrap="nowrap">
        <SectionLabel>Officers assigned</SectionLabel>
        <Box style={{ flex: 1 }} />
        <MonoText fz="12px" fw={700} c={tokens.muted}>
          {workCase.officers.length}
        </MonoText>
      </Group>
      <Stack gap={12} mt={14}>
        {brief.map((officer) => (
          <Group key={officer.id} gap={11} wrap="nowrap">
            <Avatar
              color={officer.color}
              radius="xl"
              size={30}
              styles={{ placeholder: { fontSize: 10, fontWeight: 700 } }}
            >
              {officer.initials}
            </Avatar>
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Text fz="13px" fw={600} c={tokens.ink} truncate>
                {officer.name}
              </Text>
              <Text fz="11px" c={tokens.muted} truncate>
                {officer.role}
              </Text>
            </Box>
          </Group>
        ))}
      </Stack>
      {workCase.officers.length > brief.length ? (
        <Button
          fullWidth
          variant="default"
          size="sm"
          mt={16}
          onClick={onViewPeople}
        >
          View all officers
        </Button>
      ) : null}
    </Box>
  );
}

/** Right-hand insights rail: lead, priority, progress, officers brief. */
export function InsightsRail({ workCase, onViewPeople }: InsightsRailProps) {
  return (
    <Stack gap={12}>
      <LeadCard workCase={workCase} />
      <PriorityCard workCase={workCase} />
      <ProgressCard workCase={workCase} />
      <OfficersBrief workCase={workCase} onViewPeople={onViewPeople} />
    </Stack>
  );
}
