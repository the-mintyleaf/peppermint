"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Text,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { VideoCameraIcon } from "@phosphor-icons/react/dist/csr/VideoCamera";
import { ANALYTICS_COLORS } from "../../taskAnalytics.styles";
import type {
  AddTaskPlaceholderProps,
  ScheduleTaskCardProps,
} from "./ScheduleTaskCard.types";

const HOUR_HEIGHT = 80;
const SCHEDULE_START = 10;

function hourToTop(hour: number): number {
  return (hour - SCHEDULE_START) * HOUR_HEIGHT;
}

function hourToHeight(startHour: number, endHour: number): number {
  return (endHour - startHour) * HOUR_HEIGHT;
}

export function ScheduleTaskCard({ task, onClick }: ScheduleTaskCardProps) {
  const top = hourToTop(task.startHour);
  const height = hourToHeight(task.startHour, task.endHour);

  return (
    <Box
      onClick={() => onClick?.(task)}
      style={{
        position: "absolute",
        top,
        left: 4,
        right: 4,
        height: Math.max(height - 4, 60),
        background: task.color,
        borderRadius: 16,
        padding: 12,
        cursor: "grab",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        overflow: "hidden",
        zIndex: 2,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
      }}
    >
      <Stack gap={6} h="100%" justify="space-between">
        <div>
          <Badge
            size="xs"
            variant="white"
            mb={4}
            styles={{ root: { textTransform: "none", fontWeight: 600 } }}
          >
            {task.category}
          </Badge>
          <Text fw={700} size="sm" c="white" lineClamp={2}>
            {task.title}
          </Text>
          {task.checklist && (
            <Stack gap={2} mt={6}>
              {task.checklist.map((item) => (
                <Text key={item} size="10px" c="rgba(255,255,255,0.85)">
                  • {item}
                </Text>
              ))}
            </Stack>
          )}
        </div>
        <Group justify="space-between" align="flex-end">
          {task.progress !== undefined ? (
            <Progress
              value={task.progress}
              size="xs"
              w="60%"
              color="white"
              styles={{ root: { background: "rgba(255,255,255,0.3)" } }}
            />
          ) : task.actionLabel ? (
            <Button
              size="compact-xs"
              variant="white"
              radius="xl"
              leftSection={<VideoCameraIcon size={12} aria-label="Video" />}
              styles={{ root: { color: task.color, fontWeight: 600 } }}
              onClick={(e) => e.stopPropagation()}
            >
              {task.actionLabel}
            </Button>
          ) : (
            <Box />
          )}
          {task.assignees.length > 0 && (
            <Avatar.Group spacing="xs">
              {task.assignees.map((a) => (
                <Avatar key={a.initials} size="sm" radius="xl" color={a.color}>
                  {a.initials}
                </Avatar>
              ))}
            </Avatar.Group>
          )}
        </Group>
      </Stack>
    </Box>
  );
}

export function AddTaskPlaceholder({
  dayIndex: _dayIndex,
  startHour,
  endHour,
}: AddTaskPlaceholderProps) {
  const top = hourToTop(startHour);
  const height = hourToHeight(startHour, endHour);

  return (
    <Box
      style={{
        position: "absolute",
        top,
        left: 4,
        right: 4,
        height: Math.max(height - 4, 80),
        border: `2px dashed ${ANALYTICS_COLORS.accentGreen}`,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(76,175,80,0.06)",
        cursor: "pointer",
        zIndex: 1,
      }}
    >
      <Stack align="center" gap={4}>
        <PlusIcon
          size={24}
          color={ANALYTICS_COLORS.accentGreen}
          aria-label="Add task"
        />
        <Text size="xs" c={ANALYTICS_COLORS.accentGreen} fw={600}>
          Add new task
        </Text>
      </Stack>
    </Box>
  );
}
