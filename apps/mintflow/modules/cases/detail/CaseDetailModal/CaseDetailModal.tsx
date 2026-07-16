"use client";

import { useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Progress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  notifications,
} from "@peppermint/ui";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";

import {
  CaseIcon,
  CheckItem,
  MonoText,
  SectionLabel,
  StatusPill,
} from "@/components";
import { tokens } from "@/config/design";
import {
  CATEGORY_STYLE,
  PRIORITY_STYLE,
  STATUS_STYLE,
  caseProgress,
} from "../../module.api";
import { formatDate } from "../../Cases.hooks";
import type { TaskState, WorkCase } from "../../module.api";
import type { CaseDetailModalProps } from "./CaseDetailModal.types";

const TASK_STATE_PILL: Record<
  Exclude<TaskState, "done">,
  { label: string; fg: string; bg: string }
> = {
  in_progress: {
    label: "In progress",
    fg: tokens.accentDark,
    bg: tokens.accentSoft,
  },
  pending: { label: "Pending", fg: tokens.muted2, bg: "rgba(0,0,0,0.05)" },
};

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <SectionLabel>{label}</SectionLabel>
      <Text fz="sm" fw={500} mt={3}>
        {value}
      </Text>
    </Box>
  );
}

function Body({ workCase }: { workCase: WorkCase }) {
  const category = CATEGORY_STYLE[workCase.category];
  const status = STATUS_STYLE[workCase.status];
  const priority = PRIORITY_STYLE[workCase.priority];
  const { done, total, pct } = caseProgress(workCase);

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group gap="md" wrap="nowrap" align="flex-start">
        <CaseIcon
          kind={category.icon}
          color={category.color}
          tint={category.tint}
          size={52}
        />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap={8} align="center">
            <MonoText fz="11px" c={tokens.muted} fw={600}>
              {workCase.caseNumber}
            </MonoText>
            <Text fz="11px" fw={600} c={category.color}>
              {category.label}
            </Text>
          </Group>
          <Text fw={700} fz="20px" mt={2} style={{ lineHeight: 1.25 }}>
            {workCase.title}
          </Text>
          <Group gap={8} mt={10}>
            <StatusPill fg={status.fg} bg={status.bg} dot fz="11px">
              {status.label}
            </StatusPill>
            <Badge color={priority.color} variant="light" radius="sm">
              {priority.label} priority
            </Badge>
          </Group>
        </Box>
      </Group>

      <Text c={tokens.muted2} fz="sm" style={{ lineHeight: 1.5 }}>
        {workCase.summary}
      </Text>

      {/* Meta */}
      <SimpleGrid cols={{ base: 2, xs: 4 }} spacing="md">
        <MetaField label="Opened" value={formatDate(workCase.openedDate)} />
        <MetaField label="Due" value={formatDate(workCase.dueDate)} />
        <MetaField label="Location" value={workCase.location} />
        <MetaField label="Last activity" value={workCase.updated} />
      </SimpleGrid>

      <Divider color={tokens.line} />

      {/* Departments */}
      <Box>
        <SectionLabel>Departments involved</SectionLabel>
        <Group gap={7} mt={8}>
          {workCase.departments.map((dept) => (
            <StatusPill
              key={dept}
              fg={tokens.muted2}
              bg="rgba(0,0,0,0.05)"
              fz="11px"
            >
              {dept}
            </StatusPill>
          ))}
        </Group>
      </Box>

      {/* Officers */}
      <Box>
        <SectionLabel>
          Officers assigned · {workCase.officers.length}
        </SectionLabel>
        <Stack gap={10} mt={10}>
          {workCase.officers.map((o) => (
            <Group key={o.id} gap={10} wrap="nowrap">
              <Avatar size={30} radius="xl" color={o.color}>
                {o.initials}
              </Avatar>
              <Box>
                <Text fz="sm" fw={600} style={{ lineHeight: 1.2 }}>
                  {o.name}
                </Text>
                <Text fz="11px" c={tokens.muted}>
                  {o.role}
                </Text>
              </Box>
            </Group>
          ))}
        </Stack>
      </Box>

      <Divider color={tokens.line} />

      {/* Tasks */}
      <Box>
        <Group justify="space-between" align="center" mb={10}>
          <SectionLabel>
            Tasks · {done}/{total} done
          </SectionLabel>
          <MonoText fz="11px" c={tokens.muted} fw={600}>
            {pct}%
          </MonoText>
        </Group>
        <Progress
          value={pct}
          color={pct === 100 ? "green" : "accent"}
          size="sm"
          radius="xl"
          mb="md"
          aria-label={`${done} of ${total} tasks complete`}
        />
        <Stack gap={14}>
          {workCase.tasks.map((task) => (
            <CheckItem
              key={task.id}
              title={task.title}
              done={task.state === "done"}
              fz="14px"
              right={
                task.state === "done" ? undefined : (
                  <StatusPill
                    fg={TASK_STATE_PILL[task.state].fg}
                    bg={TASK_STATE_PILL[task.state].bg}
                  >
                    {TASK_STATE_PILL[task.state].label}
                  </StatusPill>
                )
              }
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export function CaseDetailModal({ workCase, onClose }: CaseDetailModalProps) {
  const router = useRouter();
  const notConnected = () =>
    notifications.show({ message: "Not connected yet", color: "gray" });

  const openProfile = () => {
    if (!workCase) return;
    onClose();
    router.push(`/cases/${workCase.id}`);
  };

  return (
    <Modal
      opened={workCase !== null}
      onClose={onClose}
      size="lg"
      radius="lg"
      padding="xl"
      withCloseButton
      title={
        <MonoText fz="10px" c={tokens.muted} fw={600} label>
          Case file
        </MonoText>
      }
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {workCase && (
        <>
          <Body workCase={workCase} />
          <Group justify="space-between" gap="sm" mt="xl">
            <Button
              variant="subtle"
              color="accent"
              leftSection={<ArrowUpRightIcon size={15} weight="bold" />}
              onClick={openProfile}
            >
              Open full profile
            </Button>
            <Group gap="sm">
              <Button variant="default" onClick={onClose}>
                Close
              </Button>
              <Button onClick={notConnected}>Update case</Button>
            </Group>
          </Group>
        </>
      )}
    </Modal>
  );
}
