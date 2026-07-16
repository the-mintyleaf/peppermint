"use client";

import {
  Badge,
  Box,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from "@peppermint/ui";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";

import { MonoText, SectionLabel, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import {
  CATEGORY_STYLE,
  PRIORITY_STYLE,
  STATUS_STYLE,
  caseProgress,
} from "../../profile.api";
import { dueRelative, formatDate } from "../../CaseProfile.utils";
import type { WorkDetailProps } from "./WorkDetail.types";

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  valueColor?: string;
  dark?: boolean;
  children?: React.ReactNode;
}

function MetricTile({
  label,
  value,
  sub,
  subColor,
  valueColor,
  dark,
  children,
}: MetricTileProps) {
  return (
    <Box
      p="14px 16px"
      style={{
        background: dark ? tokens.tile : tokens.paper2,
        borderRadius: 14,
      }}
    >
      <SectionLabel c={dark ? "rgba(255,255,255,0.55)" : tokens.muted}>
        {label}
      </SectionLabel>
      <MonoText
        fz="24px"
        fw={700}
        mt={8}
        c={valueColor ?? (dark ? tokens.paper : tokens.ink)}
        style={{ lineHeight: 1.1 }}
      >
        {value}
      </MonoText>
      {sub ? (
        <Text
          fz="11px"
          fw={600}
          mt={2}
          c={subColor ?? (dark ? "rgba(255,255,255,0.55)" : tokens.muted)}
        >
          {sub}
        </Text>
      ) : null}
      {children}
    </Box>
  );
}

/**
 * Case detail card: status / priority / category badges, title + case number,
 * summary, and the four-metric strip (progress, tasks, due, opened).
 */
export function WorkDetail({ workCase }: WorkDetailProps) {
  const status = STATUS_STYLE[workCase.status];
  const priority = PRIORITY_STYLE[workCase.priority];
  const category = CATEGORY_STYLE[workCase.category];
  const progress = caseProgress(workCase);
  const due = dueRelative(workCase.dueDate);
  const dueColor = due.includes("overdue") ? tokens.accentDark : tokens.muted2;

  return (
    <Stack gap={0}>
      <Group gap={9} align="center" wrap="wrap">
        <StatusPill fg={status.fg} bg={status.bg} fz="11px" dot={status.fg}>
          {status.label}
        </StatusPill>
        <Badge color={priority.color} variant="light" radius="sm" size="md">
          {priority.label}
        </Badge>
        <StatusPill fg={category.color} bg={category.tint} fz="11px">
          {category.label}
        </StatusPill>
        <Box style={{ flex: 1 }} />
        <DotsThreeIcon
          size={20}
          color={tokens.muted}
          aria-label="Case actions"
        />
      </Group>

      <Text
        fz="26px"
        fw={700}
        mt={16}
        c={tokens.ink}
        style={{ letterSpacing: "-0.02em", lineHeight: 1.15 }}
      >
        {workCase.title}
      </Text>
      <Group gap={10} mt={6} wrap="wrap">
        <MonoText fz="12px" fw={600} c={tokens.muted}>
          {workCase.caseNumber}
        </MonoText>
        <Text fz="12px" c={tokens.muted}>
          {workCase.location}
        </Text>
      </Group>
      <Text
        fz="14px"
        mt={12}
        c={tokens.muted2}
        maw={660}
        style={{ lineHeight: 1.6 }}
      >
        {workCase.summary}
      </Text>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing={10} mt={22}>
        <MetricTile
          dark
          label="Progress"
          value={`${progress.pct}%`}
          sub={`${progress.done} of ${progress.total} tasks`}
        >
          <Progress
            value={progress.pct}
            color="accent"
            size="sm"
            radius="xl"
            mt={10}
            aria-label={`Progress ${progress.pct}%`}
          />
        </MetricTile>
        <MetricTile
          label="Open tasks"
          value={`${progress.total - progress.done}`}
          sub={`${progress.total} total`}
        />
        <MetricTile
          label="Due"
          value={formatDate(workCase.dueDate)}
          sub={due}
          subColor={dueColor}
        />
        <MetricTile
          label="Opened"
          value={formatDate(workCase.openedDate)}
          sub={`Updated ${workCase.updated}`}
        />
      </SimpleGrid>
    </Stack>
  );
}
