"use client";

import { useState } from "react";
import {
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Select,
  NumberInput,
  TextInput,
  ActionIcon,
  Divider,
} from "@peppermint/ui";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { PauseIcon } from "@phosphor-icons/react/dist/csr/Pause";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { PencilIcon } from "@phosphor-icons/react/dist/csr/Pencil";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  runAutomation,
  pauseAutomation,
  updateSchedule,
  type Automation,
  type AutomationSchedule,
  type ScheduleType,
} from "../../../../module.api";

const STATUS_COLORS: Record<string, string> = {
  running: "blue",
  scheduled: "teal",
  paused: "yellow",
  error: "red",
  idle: "gray",
};

function humanCron(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length < 5) return cron;
  const [min, hr, dom, mon, dow] = parts;
  if (dow === "1" && dom === "*") return `Every Monday at ${hr}:${min.padStart(2, "0")} UTC`;
  if (dow === "*" && dom === "1") return `Monthly on the 1st at ${hr}:${min.padStart(2, "0")} UTC`;
  if (dow === "*" && dom === "*") return `Daily at ${hr}:${min.padStart(2, "0")} UTC`;
  return cron;
}

interface AutomationControlsProps {
  automation: Automation;
}

export function AutomationControls({ automation }: AutomationControlsProps) {
  const queryClient = useQueryClient();
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(automation.schedule?.type ?? "manual");
  const [cronExpr, setCronExpr] = useState(automation.schedule?.cron ?? "0 9 * * 1");
  const [intervalVal, setIntervalVal] = useState(automation.schedule?.interval ?? 60);
  const [intervalUnit, setIntervalUnit] = useState<"minutes" | "hours">(automation.schedule?.intervalUnit ?? "minutes");

  const { mutate: triggerRun, isPending: isRunning } = useMutation({
    mutationFn: () => runAutomation(automation.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["automation", automation.id] }),
  });

  const { mutate: togglePause, isPending: isPausing } = useMutation({
    mutationFn: () => pauseAutomation(automation.id, automation.status !== "paused"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["automation", automation.id] }),
  });

  const { mutate: saveSchedule, isPending: isSaving } = useMutation({
    mutationFn: () => {
      const schedule: AutomationSchedule = { type: scheduleType };
      if (scheduleType === "cron") { schedule.cron = cronExpr; schedule.timezone = "UTC"; }
      if (scheduleType === "interval") { schedule.interval = intervalVal; schedule.intervalUnit = intervalUnit; }
      return updateSchedule(automation.id, schedule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation", automation.id] });
      setEditingSchedule(false);
    },
  });

  const isPaused = automation.status === "paused";
  const isActivelyRunning = automation.status === "running";

  return (
    <Stack gap="md">
      <Group gap="xs" align="center">
        <Badge color={STATUS_COLORS[automation.status] ?? "gray"} size="sm">
          {automation.status}
        </Badge>
        {automation.lastRunAt && (
          <Text size="xs" c="dimmed">
            Last run: {new Date(automation.lastRunAt).toLocaleString()}
          </Text>
        )}
      </Group>

      <Group gap="xs">
        <Button
          size="xs"
          leftSection={<PlayIcon size={13} />}
          onClick={() => triggerRun()}
          loading={isRunning}
          disabled={isActivelyRunning}
          variant="light"
          color="blue"
        >
          Run Now
        </Button>
        <Button
          size="xs"
          leftSection={isPaused ? <ArrowCounterClockwiseIcon size={13} /> : <PauseIcon size={13} />}
          onClick={() => togglePause()}
          loading={isPausing}
          disabled={isActivelyRunning}
          variant="subtle"
        >
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </Group>

      <Divider />

      <Stack gap="xs">
        <Group gap="xs" justify="space-between">
          <Text size="sm" fw={500}>
            Schedule
          </Text>
          {!editingSchedule && (
            <ActionIcon
              size="xs"
              variant="subtle"
              onClick={() => setEditingSchedule(true)}
              aria-label="Edit schedule"
            >
              <PencilIcon size={12} />
            </ActionIcon>
          )}
        </Group>

        {!editingSchedule && automation.schedule && (
          <Text size="xs" c="dimmed">
            {automation.schedule.type === "cron" && automation.schedule.cron
              ? humanCron(automation.schedule.cron)
              : automation.schedule.type === "interval"
              ? `Every ${automation.schedule.interval} ${automation.schedule.intervalUnit}`
              : "Manual only"}
          </Text>
        )}

        {editingSchedule && (
          <Stack gap="xs">
            <Select
              label="Type"
              value={scheduleType}
              onChange={(v) => setScheduleType((v as ScheduleType) ?? "manual")}
              data={[
                { value: "cron", label: "Cron" },
                { value: "interval", label: "Interval" },
                { value: "manual", label: "Manual" },
              ]}
              size="xs"
            />
            {scheduleType === "cron" && (
              <Stack gap={4}>
                <TextInput
                  label="Cron expression"
                  value={cronExpr}
                  onChange={(e) => setCronExpr(e.target.value)}
                  size="xs"
                  placeholder="0 9 * * 1"
                  ff="monospace"
                />
                <Text size="xs" c="dimmed">
                  {humanCron(cronExpr)}
                </Text>
              </Stack>
            )}
            {scheduleType === "interval" && (
              <Group gap="xs">
                <NumberInput
                  label="Every"
                  value={intervalVal}
                  onChange={(v) => setIntervalVal(Number(v))}
                  min={1}
                  size="xs"
                  w={80}
                />
                <Select
                  label="Unit"
                  value={intervalUnit}
                  onChange={(v) => setIntervalUnit((v as "minutes" | "hours") ?? "minutes")}
                  data={["minutes", "hours"]}
                  size="xs"
                  w={100}
                />
              </Group>
            )}
            <Group gap="xs">
              <Button
                size="xs"
                leftSection={<CheckIcon size={12} />}
                onClick={() => saveSchedule()}
                loading={isSaving}
              >
                Save
              </Button>
              <Button
                size="xs"
                variant="subtle"
                leftSection={<XIcon size={12} />}
                onClick={() => setEditingSchedule(false)}
              >
                Cancel
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
