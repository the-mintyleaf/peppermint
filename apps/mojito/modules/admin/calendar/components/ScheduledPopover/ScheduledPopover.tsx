"use client";

import { Popover, Stack, Text, Button, Group } from "@peppermint/ui";
import { useRouter } from "next/navigation";
import type { CalendarEntry } from "../../Calendar.types";

interface ScheduledPopoverProps {
  entry: CalendarEntry;
  children: React.ReactNode;
}

export function ScheduledPopover({ entry, children }: ScheduledPopoverProps) {
  const router = useRouter();
  const time = new Date(entry.scheduledAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Popover width={240} position="bottom" withArrow shadow="sm">
      <Popover.Target>{children}</Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs" p="xs">
          <Text size="sm" fw={500}>
            {entry.automationName}
          </Text>
          <Text size="xs" c="dimmed">
            Scheduled at {time}
          </Text>
          <Group gap="xs">
            <Text size="xs" c="dimmed" tt="capitalize">
              {entry.platform}
            </Text>
          </Group>
          <Button
            size="xs"
            variant="subtle"
            onClick={() =>
              router.push(`/admin/automation/workflows/${entry.automationId}`)
            }
          >
            Open Automation
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
