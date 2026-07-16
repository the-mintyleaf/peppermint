"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Divider,
  Group,
  Menu,
  Paper,
  Progress,
  Text,
} from "@peppermint/ui";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";

import { CaseIcon, MonoText, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import {
  CATEGORY_STYLE,
  PRIORITY_STYLE,
  STATUS_STYLE,
  caseProgress,
} from "../../../module.api";
import { formatDate } from "../../../Cases.hooks";
import type { CaseCardProps } from "./CaseCard.types";

export function CaseCard({ workCase, onOpen }: CaseCardProps) {
  const category = CATEGORY_STYLE[workCase.category];
  const status = STATUS_STYLE[workCase.status];
  const priority = PRIORITY_STYLE[workCase.priority];
  const { done, total, pct } = caseProgress(workCase);
  const extraDepartments = workCase.departments.length - 2;

  return (
    <Paper
      withBorder
      radius={tokens.radius.card}
      p="md"
      bg={tokens.paper}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(workCase)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(workCase);
        }
      }}
      style={{ cursor: "pointer", height: "100%" }}
    >
      {/* Header: category glyph + identity, priority + actions */}
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap={10} wrap="nowrap" align="center" style={{ minWidth: 0 }}>
          <CaseIcon
            kind={category.icon}
            color={category.color}
            tint={category.tint}
            size={40}
          />
          <Box style={{ minWidth: 0 }}>
            <MonoText fz="10px" c={tokens.muted} fw={600}>
              {workCase.caseNumber}
            </MonoText>
            <Text fz="11px" fw={600} c={category.color}>
              {category.label}
            </Text>
          </Box>
        </Group>

        <Group gap={4} wrap="nowrap" align="center">
          <Badge color={priority.color} variant="light" size="sm" radius="sm">
            {priority.label}
          </Badge>
          <Menu shadow="sm" width={170} position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={`${workCase.caseNumber} actions`}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <DotsThreeIcon size={18} weight="bold" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
              <Menu.Item onClick={() => onOpen(workCase)}>Open case</Menu.Item>
              <Menu.Item>Assign officer</Menu.Item>
              <Menu.Item>Change status</Menu.Item>
              <Menu.Item color="red">Close case</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* Title + summary */}
      <Text
        fw={700}
        fz="15px"
        mt="sm"
        lineClamp={2}
        style={{ lineHeight: 1.3 }}
      >
        {workCase.title}
      </Text>
      <Text c={tokens.muted2} fz="xs" mt={4} lineClamp={2}>
        {workCase.summary}
      </Text>

      {/* Task progress */}
      <Box mt="md">
        <Group justify="space-between" mb={5}>
          <MonoText fz="10px" c={tokens.muted} fw={600}>
            {done}/{total} TASKS
          </MonoText>
          <MonoText fz="10px" c={tokens.muted} fw={600}>
            {pct}%
          </MonoText>
        </Group>
        <Progress
          value={pct}
          color={pct === 100 ? "green" : "accent"}
          size="sm"
          radius="xl"
          aria-label={`${done} of ${total} tasks complete`}
        />
      </Box>

      {/* Departments */}
      <Group gap={6} mt="sm" wrap="nowrap" style={{ overflow: "hidden" }}>
        <BuildingsIcon
          size={13}
          color={tokens.muted}
          aria-label="Departments"
          style={{ flexShrink: 0 }}
        />
        {workCase.departments.slice(0, 2).map((dept) => (
          <StatusPill key={dept} fg={tokens.muted2} bg="rgba(0,0,0,0.05)">
            {dept}
          </StatusPill>
        ))}
        {extraDepartments > 0 && (
          <StatusPill fg={tokens.muted2} bg="rgba(0,0,0,0.05)">
            +{extraDepartments}
          </StatusPill>
        )}
      </Group>

      <Divider my="md" color={tokens.line} />

      {/* Footer: officers + status */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <Avatar.Group spacing="sm">
          {workCase.officers.slice(0, 3).map((o) => (
            <Avatar key={o.id} size={24} radius="xl" color={o.color}>
              {o.initials}
            </Avatar>
          ))}
          {workCase.officers.length > 3 && (
            <Avatar size={24} radius="xl" color="gray">
              +{workCase.officers.length - 3}
            </Avatar>
          )}
        </Avatar.Group>
        <StatusPill fg={status.fg} bg={status.bg} dot>
          {status.label}
        </StatusPill>
      </Group>

      <Group gap={5} mt={10} wrap="nowrap" align="center">
        <CalendarBlankIcon
          size={12}
          color={tokens.muted}
          style={{ flexShrink: 0 }}
        />
        <MonoText fz="10px" c={tokens.muted}>
          Due {formatDate(workCase.dueDate)}
        </MonoText>
        <Box style={{ flex: 1 }} />
        <MonoText fz="10px" c={tokens.muted}>
          {workCase.updated}
        </MonoText>
      </Group>
    </Paper>
  );
}
