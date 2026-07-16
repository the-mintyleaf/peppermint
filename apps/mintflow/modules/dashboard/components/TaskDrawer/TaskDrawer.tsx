"use client";

import type { ReactNode } from "react";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  Group,
  Menu,
  Paper,
  Progress,
  Stack,
  Text,
  Timeline,
} from "@peppermint/ui";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";

import { SectionLabel, StatusPill } from "@/components";
import { tokens } from "@/config/design";
import {
  AMBER,
  AMBER_SOFT,
  FLOW_COLUMN_META,
  LAVENDER,
  LAVENDER_SOFT,
  PRIORITY_STYLE,
} from "../../module.api";
import type { FlowColumn } from "../../module.api";
import type { TaskDrawerProps } from "./TaskDrawer.types";

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap={7}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </Stack>
  );
}

const MOVE_TARGETS: FlowColumn[] = ["up_next", "in_progress", "done"];

export function TaskDrawer({
  task,
  opened,
  onClose,
  onComplete,
  onMove,
  onArchive,
}: TaskDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={452}
      padding={0}
      radius={0}
      withCloseButton={false}
      title={null}
    >
      {task ? (
        <Stack gap={0} h="100%">
          {/* Header — primary fields (spec §15) */}
          <Box p={20} style={{ borderBottom: `1px solid ${tokens.line}` }}>
            <Group justify="space-between" align="center" mb={12}>
              <Group gap={7} wrap="nowrap" style={{ minWidth: 0 }}>
                <Box
                  w={10}
                  h={10}
                  style={{
                    borderRadius: 3,
                    background: task.file.swatch,
                    flex: "0 0 auto",
                  }}
                />
                <Text fz="12px" fw={600} c="rgba(0,0,0,0.55)" truncate>
                  {task.file.name}
                </Text>
              </Group>
              <Button
                variant="subtle"
                color="gray"
                size="compact-xs"
                onClick={onClose}
              >
                Close
              </Button>
            </Group>

            <Text
              fz="18px"
              fw={700}
              c={tokens.ink}
              style={{ lineHeight: 1.25 }}
            >
              {task.title}
            </Text>

            <Group gap={8} mt={12} wrap="wrap">
              <StatusPill
                fg="rgba(0,0,0,0.6)"
                bg="rgba(0,0,0,0.06)"
                dot={tokens.accent}
              >
                {FLOW_COLUMN_META[task.column].label}
              </StatusPill>
              <StatusPill
                fg={PRIORITY_STYLE[task.priority].fg}
                bg={PRIORITY_STYLE[task.priority].bg}
                dot
              >
                {PRIORITY_STYLE[task.priority].label}
              </StatusPill>
              <StatusPill
                fg={task.overdue ? AMBER : "rgba(0,0,0,0.55)"}
                bg={task.overdue ? AMBER_SOFT : "rgba(0,0,0,0.05)"}
              >
                {task.overdue ? `${task.dueRelative} · Late` : task.dueRelative}
              </StatusPill>
              {task.avatar ? (
                <Avatar size={24} radius="xl" color={task.avatar.color}>
                  {task.avatar.initials}
                </Avatar>
              ) : null}
            </Group>
          </Box>

          {/* Body — secondary fields */}
          <Box p={20} style={{ flex: 1, overflowY: "auto" }}>
            <Stack gap={20}>
              {task.description ? (
                <Section label="Description">
                  <Text
                    fz="13px"
                    fw={500}
                    c="rgba(0,0,0,0.7)"
                    style={{ lineHeight: 1.5 }}
                  >
                    {task.description}
                  </Text>
                </Section>
              ) : null}

              {task.onHold ? (
                <Paper
                  p={12}
                  radius={12}
                  style={{
                    background: LAVENDER_SOFT,
                    border: `1px solid ${LAVENDER_SOFT}`,
                  }}
                >
                  <Group gap={8} wrap="nowrap" align="flex-start">
                    <PauseCircleIcon size={16} weight="fill" color={LAVENDER} />
                    <Box>
                      <Text fz="12px" fw={700} c={LAVENDER}>
                        On hold · {task.onHold.duration}
                      </Text>
                      <Text fz="12px" fw={500} c="rgba(0,0,0,0.6)">
                        {task.onHold.reason}
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              ) : null}

              {task.subtasks ? (
                <Section label="Subtasks">
                  <Progress
                    value={Math.round(
                      (task.subtasks.done / task.subtasks.total) * 100,
                    )}
                    size="sm"
                    radius="xl"
                    color="green"
                  />
                  <Text fz="11px" fw={600} c="rgba(0,0,0,0.5)">
                    {task.subtasks.done} of {task.subtasks.total} done
                  </Text>
                </Section>
              ) : null}

              {task.dependencies?.length ? (
                <Section label="Dependencies">
                  <Stack gap={5}>
                    {task.dependencies.map((d) => (
                      <Text key={d} fz="12.5px" fw={500} c="rgba(0,0,0,0.65)">
                        • {d}
                      </Text>
                    ))}
                  </Stack>
                </Section>
              ) : null}

              {task.attachments?.length ? (
                <Section label="Attachments">
                  <Stack gap={6}>
                    {task.attachments.map((a) => (
                      <Group key={a.name} gap={8} wrap="nowrap">
                        <PaperclipIcon size={14} color="rgba(0,0,0,0.45)" />
                        <Text fz="12.5px" fw={500} c="rgba(0,0,0,0.7)" truncate>
                          {a.name}
                        </Text>
                        <StatusPill fg="rgba(0,0,0,0.5)" bg="rgba(0,0,0,0.05)">
                          {a.ext}
                        </StatusPill>
                      </Group>
                    ))}
                  </Stack>
                </Section>
              ) : null}

              <Section label="Comments">
                <Text fz="12.5px" fw={500} c="rgba(0,0,0,0.5)">
                  {task.comments ?? 0} comments
                </Text>
              </Section>

              {task.activity?.length ? (
                <Section label="Activity">
                  <Timeline bulletSize={10} lineWidth={2} color="gray">
                    {task.activity.map((ev) => (
                      <Timeline.Item key={ev.id}>
                        <Text fz="12.5px" fw={500} c="rgba(0,0,0,0.7)">
                          {ev.text}
                        </Text>
                        <Text fz="10.5px" fw={500} c="rgba(0,0,0,0.4)">
                          {ev.when}
                        </Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Section>
              ) : null}
            </Stack>
          </Box>

          {/* Footer — actions (destructive archive spatially separated, spec §14) */}
          <Box p={16} style={{ borderTop: `1px solid ${tokens.line}` }}>
            <Group justify="space-between" wrap="nowrap">
              <Group gap={8} wrap="nowrap">
                <Button
                  color="green"
                  radius="xl"
                  leftSection={<CheckCircleIcon size={15} weight="bold" />}
                  onClick={() => onComplete(task.id)}
                >
                  Complete
                </Button>
                <Menu position="top-start" width={168} shadow="md">
                  <Menu.Target>
                    <Button
                      variant="light"
                      color="gray"
                      radius="xl"
                      leftSection={
                        <ArrowsLeftRightIcon size={15} weight="bold" />
                      }
                    >
                      Move
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {MOVE_TARGETS.filter((c) => c !== task.column).map((c) => (
                      <Menu.Item key={c} onClick={() => onMove(task.id, c)}>
                        To {FLOW_COLUMN_META[c].label}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </Group>

              <Button
                variant="subtle"
                color="red"
                radius="xl"
                leftSection={<ArchiveIcon size={15} weight="bold" />}
                onClick={() => onArchive(task)}
              >
                Archive
              </Button>
            </Group>
          </Box>
        </Stack>
      ) : null}
    </Drawer>
  );
}
