"use client";

import {
  Avatar,
  Box,
  Button,
  Group,
  Progress,
  SegmentedControl,
  Stack,
  Text,
} from "@zetsel/ui";
import { BarChart } from "@mantine/charts";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";
import { LightningIcon } from "@phosphor-icons/react/dist/csr/Lightning";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { bentoCardStyle, HOME_COLORS } from "./home.styles";

const CALENDAR_DAYS = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
];
const CALENDAR_DATES = [
  [null, null, null, null, null, null, 1],
  [2, 3, 4, 5, 6, 7, 8],
  [9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22],
  [23, 24, 25, 26, 27, 28, 29],
  [30, null, null, null, null, null, null],
];
const HIGHLIGHTED_DATES = new Set([13, 21, 29]);

const PRODUCTIVITY_DATA = [
  { day: "Mon", hours: 12 },
  { day: "Tue", hours: 14 },
  { day: "Wed", hours: 11 },
  { day: "Thu", hours: 16 },
];

const ARCHIVE_PROJECTS = [
  { name: "Zentra-Landing", color: HOME_COLORS.purple },
  { name: "Mavence landing", color: HOME_COLORS.orange, active: true },
  { name: "orbitlabs", color: HOME_COLORS.pink },
  { name: "PulseApp Styleguide", color: HOME_COLORS.yellow },
];

const SCHEDULE_ITEMS = [
  {
    time: "11.00",
    title: "Packaging Product design revision",
    color: HOME_COLORS.orange,
    avatars: ["AL", "BK", "CM"],
  },
  {
    time: "13.00",
    title: "Project Mavence web",
    color: HOME_COLORS.purple,
    tasks: ["Research", "Wireframe", "UI Design", "Review"],
    progress: 72,
    deadline: "June, 23",
  },
];

function CalendarCard() {
  return (
    <Box style={bentoCardStyle(HOME_COLORS.forest)}>
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: HOME_COLORS.cream,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LightningIcon size={16} color={HOME_COLORS.forest} weight="fill" />
          </Box>
          <div>
            <Text c={HOME_COLORS.cream} fw={600} size="sm">
              Calendar
            </Text>
            <Text c="rgba(244,245,240,0.6)" size="xs">
              Working days
            </Text>
          </div>
        </Group>
        <ArrowUpRightIcon size={16} color={HOME_COLORS.cream} />
      </Group>

      <Group gap={6} mb="lg">
        {["Yours", "Henky", "Albert", "Richard"].map((label, index) => (
          <Box
            key={label}
            px="sm"
            py={4}
            style={{
              borderRadius: 999,
              background: index === 0 ? HOME_COLORS.cream : "transparent",
              border: `1px solid ${index === 0 ? HOME_COLORS.cream : "rgba(244,245,240,0.25)"}`,
            }}
          >
            <Text
              size="10px"
              fw={600}
              c={index === 0 ? HOME_COLORS.forest : HOME_COLORS.cream}
            >
              {label}
            </Text>
          </Box>
        ))}
      </Group>

      <Group gap={4} mb="xs" px={4}>
        {CALENDAR_DAYS.map((day) => (
          <Text
            key={day.key}
            size="10px"
            c="rgba(244,245,240,0.5)"
            style={{ width: 28, textAlign: "center" }}
          >
            {day.label}
          </Text>
        ))}
      </Group>

      <Stack gap={6}>
        {CALENDAR_DATES.map((week, weekIndex) => (
          <Group key={weekIndex} gap={4} px={4}>
            {week.map((date, dayIndex) => {
              const highlighted = date !== null && HIGHLIGHTED_DATES.has(date);
              return (
                <Box
                  key={`${weekIndex}-${dayIndex}`}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: highlighted ? HOME_COLORS.pink : "transparent",
                    opacity: date ? 1 : 0,
                  }}
                >
                  {date && (
                    <Text size="10px" fw={600} c={HOME_COLORS.cream}>
                      {date}
                    </Text>
                  )}
                </Box>
              );
            })}
          </Group>
        ))}
      </Stack>

      <Group justify="center" gap="lg" mt="lg">
        <CaretLeftIcon size={14} color={HOME_COLORS.cream} />
        <Text size="xs" c={HOME_COLORS.cream}>
          June 2025
        </Text>
        <CaretRightIcon size={14} color={HOME_COLORS.cream} />
      </Group>
    </Box>
  );
}

function ScheduleCard() {
  return (
    <Box style={bentoCardStyle(HOME_COLORS.cream)}>
      <Text fw={700} size="lg" c={HOME_COLORS.forest} mb="lg">
        Today&apos;s Schedule
      </Text>

      <Stack gap="xl">
        {SCHEDULE_ITEMS.map((item) => (
          <Group key={item.title} align="flex-start" gap="md" wrap="nowrap">
            <Text size="xs" c="dimmed" w={40} pt={4}>
              {item.time}
            </Text>
            <Box
              flex={1}
              p="md"
              style={{
                borderRadius: 20,
                background: item.color,
                color: "white",
                minHeight: item.tasks ? 180 : 120,
              }}
            >
              <Box
                mb="sm"
                style={{
                  height: 28,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.2)",
                }}
              />
              <Text fw={700} size="sm" mb="sm">
                {item.title}
              </Text>

              {item.avatars && (
                <Group gap={-8} mt="md">
                  {item.avatars.map((name) => (
                    <Avatar key={name} size="sm" radius="xl" name={name} />
                  ))}
                </Group>
              )}

              {item.tasks && (
                <Stack gap={6} mt="sm">
                  {item.tasks.map((task) => (
                    <Group key={task} gap="xs">
                      <Text size="xs">✓</Text>
                      <Text size="xs">{task}</Text>
                    </Group>
                  ))}
                  <Progress value={item.progress} color="white" size="sm" mt="sm" />
                  <Text size="10px" mt={4}>
                    Deadline {item.deadline}
                  </Text>
                </Stack>
              )}
            </Box>
          </Group>
        ))}
      </Stack>
    </Box>
  );
}

function ArchiveCard() {
  return (
    <Box style={bentoCardStyle(HOME_COLORS.cream)}>
      <Group justify="space-between" mb="md">
        <Text fw={700} c={HOME_COLORS.forest}>
          Archive Project
        </Text>
        <DotsThreeIcon size={18} color={HOME_COLORS.forest} />
      </Group>

      <Stack gap="xs">
        {ARCHIVE_PROJECTS.map((project) => (
          <Group
            key={project.name}
            justify="space-between"
            px="sm"
            py="sm"
            style={{
              borderRadius: 14,
              background: project.active ? HOME_COLORS.muted : "transparent",
            }}
          >
            <Group gap="sm">
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: project.color,
                }}
              />
              <Text size="sm" fw={project.active ? 600 : 400}>
                {project.name}
              </Text>
            </Group>
            {project.active && (
              <DownloadSimpleIcon size={16} color={HOME_COLORS.forest} />
            )}
          </Group>
        ))}
      </Stack>
    </Box>
  );
}

function ProductivityCard() {
  return (
    <Box style={bentoCardStyle(HOME_COLORS.forest)}>
      <Text c={HOME_COLORS.cream} fw={700} size="lg">
        Weekly Productivity Overview
      </Text>
      <Text c="rgba(244,245,240,0.6)" size="xs" mb="lg">
        Selected Period: 45 Tasks
      </Text>

      <BarChart
        h={180}
        data={PRODUCTIVITY_DATA}
        dataKey="day"
        series={[{ name: "hours", color: HOME_COLORS.yellow }]}
        tickLine="none"
        gridAxis="none"
        withXAxis
        withYAxis
        barProps={{ radius: 8 }}
        styles={{
          axis: { stroke: "rgba(244,245,240,0.2)" },
        }}
      />

      <Group gap="md" mt="md">
        <Group gap={6}>
          <Box
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: HOME_COLORS.yellow,
            }}
          />
          <Text size="xs" c={HOME_COLORS.cream}>
            Assigned Task
          </Text>
        </Group>
        <Group gap={6}>
          <Box
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: HOME_COLORS.cream,
            }}
          />
          <Text size="xs" c={HOME_COLORS.cream}>
            Completed Task
          </Text>
        </Group>
      </Group>
    </Box>
  );
}

function ActionBar() {
  return (
    <Box style={bentoCardStyle(HOME_COLORS.cream)}>
      <Group justify="space-between" wrap="wrap" gap="md">
        <SegmentedControl
          defaultValue="card"
          data={[
            { label: "Card", value: "card" },
            { label: "Block", value: "block" },
            { label: "Table", value: "table" },
          ]}
          styles={{
            root: { background: HOME_COLORS.muted },
            label: { fontWeight: 600, fontSize: 12 },
          }}
        />

        <Group gap="sm">
          <Avatar.Group spacing="sm">
            <Avatar size="sm" radius="xl" name="Alex Kim" />
            <Avatar size="sm" radius="xl" name="Bella Ray" />
            <Avatar size="sm" radius="xl" name="Chris Lee" />
          </Avatar.Group>
          <Button
            color="yellow.6"
            leftSection={<PlusIcon size={14} weight="bold" />}
            styles={{ root: { color: HOME_COLORS.forest, fontWeight: 700 } }}
          >
            Create new plan
          </Button>
        </Group>
      </Group>
    </Box>
  );
}

export function ModuleHome() {
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.4fr)",
        gridTemplateRows: "auto auto auto auto",
        gridTemplateAreas: `
          "calendar schedule"
          "archive schedule"
          "productivity productivity"
          "action action"
        `,
        gap: 8,
        minHeight: "100%",
        alignContent: "start",
      }}
    >
      <Box style={{ gridArea: "calendar", minHeight: 360 }}>
        <CalendarCard />
      </Box>
      <Box style={{ gridArea: "schedule", minHeight: 420 }}>
        <ScheduleCard />
      </Box>
      <Box style={{ gridArea: "archive", minHeight: 260 }}>
        <ArchiveCard />
      </Box>
      <Box style={{ gridArea: "productivity", minHeight: 300 }}>
        <ProductivityCard />
      </Box>
      <Box style={{ gridArea: "action" }}>
        <ActionBar />
      </Box>
    </Box>
  );
}
