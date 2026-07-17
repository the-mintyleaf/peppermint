"use client";

import {
  Avatar,
  Box,
  Divider,
  Group,
  Paper,
  RingProgress,
  Stack,
  Text,
} from "@peppermint/ui";
import { FlagIcon } from "@phosphor-icons/react/dist/csr/Flag";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";

import { MonoText, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import {
  PRIORITY_STYLE,
  STATUS_STYLE,
  caseProgress,
} from "../../../module.api";
import { formatDate } from "../../../Cases.hooks";
import type { CaseCardProps } from "./CaseCard.types";

export function CaseCard({ workCase, onOpen }: CaseCardProps) {
  const status = STATUS_STYLE[workCase.status];
  const priority = PRIORITY_STYLE[workCase.priority];
  const { done, total, pct } = caseProgress(workCase);
  const [lead, ...rest] = workCase.officers;
  const extraDepartments = workCase.departments.length - 2;

  return (
    <Paper
      radius={tokens.radius.card}
      p="lg"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(workCase)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(workCase);
        }
      }}
      style={{
        cursor: "pointer",
        height: "100%",
        // flat status tint over an opaque paper base
        background: `linear-gradient(${status.cardTint}, ${status.cardTint}), ${tokens.paper}`,
        border: `1px solid ${tokens.line}`,
      }}
    >
      {/* Row 1: priority · due date */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <StatusPill fg={priority.fg} bg={priority.bg} fz="11px" px={10} py={5}>
          <FlagIcon size={12} weight="fill" color={priority.fg} />
          {priority.label}
        </StatusPill>
        <Group gap={5} wrap="nowrap" align="center">
          <CalendarBlankIcon size={13} color={tokens.muted} />
          <MonoText fz="11px" c={tokens.muted}>
            {formatDate(workCase.dueDate)}
          </MonoText>
        </Group>
      </Group>

      {/* Identity */}
      <Text
        fw={700}
        fz="15px"
        mt="md"
        lineClamp={2}
        style={{ lineHeight: 1.3 }}
      >
        {workCase.title}
      </Text>
      <Text
        c={tokens.muted2}
        fz="xs"
        mt={6}
        lineClamp={2}
        style={{ lineHeight: 1.5 }}
      >
        {workCase.summary}
      </Text>

      {/* Departments */}
      <Group gap={8} mt="md" wrap="nowrap" style={{ overflow: "hidden" }}>
        {workCase.departments.slice(0, 2).map((dept) => (
          <StatusPill
            key={dept}
            border={tokens.lineStrong}
            bg="transparent"
            fg={tokens.muted2}
            fz="11px"
          >
            <BuildingsIcon size={11} color={tokens.muted} />
            {dept}
          </StatusPill>
        ))}
        {extraDepartments > 0 && (
          <StatusPill
            border={tokens.lineStrong}
            bg="transparent"
            fg={tokens.muted2}
          >
            +{extraDepartments}
          </StatusPill>
        )}
      </Group>

      <Divider variant="dashed" color={tokens.line} my="md" />

      {/* Footer: lead officer + status · progress */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
          <Avatar size={32} radius="xl" color={lead.color}>
            {lead.initials}
          </Avatar>
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Text fw={600} fz="sm" lineClamp={1}>
              {lead.name}
              {rest.length > 0 && (
                <Text span c={tokens.muted} fz="xs" fw={500}>
                  {" "}
                  +{rest.length}
                </Text>
              )}
            </Text>
            <StatusPill fg={status.fg} bg={status.bg} dot fz="10px">
              {status.label}
            </StatusPill>
          </Stack>
        </Group>

        <RingProgress
          size={46}
          thickness={4}
          roundCaps
          sections={[{ value: pct, color: pct === 100 ? "green" : "accent" }]}
          label={
            <Box ta="center">
              <MonoText fz="10px" fw={700} c={tokens.ink}>
                {pct}%
              </MonoText>
            </Box>
          }
          aria-label={`${done} of ${total} tasks complete`}
        />
      </Group>
    </Paper>
  );
}
