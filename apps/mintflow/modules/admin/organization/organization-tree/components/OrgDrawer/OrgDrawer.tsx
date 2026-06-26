"use client";

import {
  Badge,
  Divider,
  Drawer,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import {
  KpiCard,
  StatRow,
  StackedBar,
  MiniBarChart,
  RingChart,
  ActivityHeatmap,
  ProgressBar,
  makeSeededRng,
} from "../InspectorPanel/charts";
import type { OrgDrawerProps } from "./OrgDrawer.types";
import type { NodeHealthIssue } from "../../OrganizationTree.types";

const HEALTH_LABELS: Record<NodeHealthIssue, string> = {
  missing_head: "No department head assigned",
  empty_dept: "No people in this organization",
  no_parent: "Orphan node — no parent organization",
  too_many_reports: "Too many direct reports",
  inactive_head: "Head person is inactive",
};

const STATUS_COLORS: Record<string, string> = {
  active: "teal",
  inactive: "gray",
  archived: "red",
};
const ORG_TYPE_COLORS: Record<string, string> = {
  ministry: "violet",
  office: "blue",
  department: "cyan",
  organization: "teal",
  branch: "orange",
  district: "red",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type OrgDrawerContentProps = Omit<OrgDrawerProps, "opened" | "onClose">;

export function OrgDrawerContent({
  nodeId,
  data,
  onEdit,
  onDelete,
  onAddDivision,
  totalPeople = 0,
  totalDepts = 0,
  hiddenLevels,
  headPersonName,
  healthIssues = [],
}: OrgDrawerContentProps) {
  const rng = makeSeededRng(nodeId);

  const tasksDone = Math.floor(rng() * 180 + 40);
  const tasksActive = Math.floor(rng() * 60 + 10);
  const healthScore = Math.max(
    20,
    100 - healthIssues.length * 18 - Math.floor(rng() * 15),
  );
  const peopleDelta = Math.floor(rng() * 15 + 3);
  const unitsDelta = Math.floor(rng() * 6 + 1);
  const tasksUp = Math.floor(rng() * 30 + 5);
  const staffCapacity = Math.floor(rng() * 40 + 55);
  const budgetUtil = Math.floor(rng() * 35 + 40);

  const peopleSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 60 + 20),
  );
  const unitsSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 30 + 5),
  );
  const tasksSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 80 + 20),
  );
  const healthSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 40 + 50),
  );

  const now = new Date();
  const barData = Array.from({ length: 6 }, (_, i) => {
    const monthIdx = (now.getMonth() - 5 + i + 12) % 12;
    return { label: MONTHS[monthIdx], value: Math.floor(rng() * 80 + 20) };
  });

  const heatmapData = Array.from({ length: 26 * 7 }, () => {
    const r = rng();
    return r < 0.4 ? 0 : r < 0.6 ? 1 : r < 0.75 ? 2 : r < 0.9 ? 3 : 4;
  });

  return (
    <Stack gap={0}>
      {/* ── Info section — no cards ───────────────────────────────────────── */}
      <div style={{ padding: "18px 20px 20px" }}>
        <Group gap={6} mb={10}>
          <Badge
            size="sm"
            color={ORG_TYPE_COLORS[data.orgType] ?? "blue"}
            variant="light"
          >
            {data.orgType}
          </Badge>
          <Badge size="sm" color={STATUS_COLORS[data.status]} variant="dot">
            {data.status}
          </Badge>
        </Group>

        {data.description && (
          <Text
            size="sm"
            c="dimmed"
            lineClamp={3}
            style={{ lineHeight: 1.6, marginBottom: 12 }}
          >
            {data.description}
          </Text>
        )}

        <Stack gap={7}>
          {data.location && (
            <Group gap={7}>
              <MapPinIcon
                size={13}
                color="var(--mantine-color-dimmed)"
                aria-label="Location"
              />
              <Text size="xs" c="dimmed">
                {data.location}
              </Text>
            </Group>
          )}
          {headPersonName && (
            <Group gap={7}>
              <UserIcon
                size={13}
                color="var(--mantine-color-dimmed)"
                aria-label="Head"
              />
              <Text size="xs" c="dimmed">
                Head:{" "}
                <Text span fw={600} c="dark" size="xs">
                  {headPersonName}
                </Text>
              </Text>
            </Group>
          )}
        </Stack>
      </div>

      <Divider />

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <Stack gap={14} style={{ padding: "20px 16px" }}>
        {/* Staff + Units */}
        <SimpleGrid cols={2} spacing={12}>
          <KpiCard title="STAFF">
            <StatRow
              title="Total people"
              value={totalPeople.toLocaleString()}
              delta={`+${peopleDelta}`}
              deltaPositive
              description="Across all units"
              sparkData={peopleSparkData}
              sparkColor="#ddd6fe"
              sparkActiveColor="#7c3aed"
            />
          </KpiCard>
          <KpiCard title="UNITS">
            <StatRow
              title="Departments"
              value={totalDepts.toLocaleString()}
              delta={`+${unitsDelta}`}
              deltaPositive
              description="Active divisions"
              sparkData={unitsSparkData}
              sparkColor="#bfdbfe"
              sparkActiveColor="#3b82f6"
            />
          </KpiCard>
        </SimpleGrid>

        {/* Tasks done + Health */}
        <SimpleGrid cols={2} spacing={12}>
          <KpiCard title="TASKS DONE">
            <StatRow
              title="Completed"
              value={tasksDone.toLocaleString()}
              delta={`+${tasksUp}%`}
              deltaPositive
              description="This period"
              sparkData={tasksSparkData}
              sparkColor="#bbf7d0"
              sparkActiveColor="#059669"
            />
          </KpiCard>
          <KpiCard title="HEALTH">
            <StatRow
              title="Score"
              value={`${healthScore}%`}
              valueColor={
                healthScore > 70 ? "teal" : healthScore > 40 ? "orange" : "red"
              }
              delta={
                healthScore > 70 ? "Good" : healthScore > 40 ? "Fair" : "Poor"
              }
              deltaPositive={healthScore > 70}
              description="Structure quality"
              sparkData={healthSparkData}
              sparkColor="#fef3c7"
              sparkActiveColor={healthScore > 70 ? "#059669" : "#f59e0b"}
            />
          </KpiCard>
        </SimpleGrid>

        {/* Monthly tasks */}
        <KpiCard title="MONTHLY TASKS PROCESSED">
          <StatRow
            title="This month"
            value={(barData[barData.length - 1]?.value ?? 0).toLocaleString()}
            delta={`+${tasksUp}%`}
            deltaPositive
            description="vs last month"
          />
          <div style={{ marginTop: 16 }}>
            <MiniBarChart
              data={barData.map((b) => b.value)}
              labels={barData.map((b) => b.label)}
              height={96}
              color="#ddd6fe"
              activeColor="#7c3aed"
            />
          </div>
        </KpiCard>

        {/* Structure breakdown */}
        <KpiCard title="STRUCTURE BREAKDOWN">
          <Group gap={12} align="center" wrap="nowrap" mb={14}>
            <RingChart
              segments={[
                { value: totalPeople, color: "#7c3aed", label: "People" },
                { value: totalDepts, color: "#06b6d4", label: "Units" },
              ]}
              size={84}
              thickness={9}
              centerLabel={`${totalPeople + totalDepts}`}
              centerSub="total"
            />
            <Stack gap={8} style={{ flex: 1 }}>
              <Group gap={6} justify="space-between">
                <Group gap={6}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: "#7c3aed",
                      flexShrink: 0,
                    }}
                  />
                  <Text size="xs" c="dimmed">
                    People
                  </Text>
                </Group>
                <Text size="xs" fw={700} c="violet">
                  {totalPeople.toLocaleString()}
                </Text>
              </Group>
              <Group gap={6} justify="space-between">
                <Group gap={6}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: "#06b6d4",
                      flexShrink: 0,
                    }}
                  />
                  <Text size="xs" c="dimmed">
                    Units
                  </Text>
                </Group>
                <Text size="xs" fw={700} c="cyan">
                  {totalDepts.toLocaleString()}
                </Text>
              </Group>
              {(hiddenLevels ?? 0) > 0 && (
                <Group gap={6} justify="space-between">
                  <Group gap={6}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: "var(--mantine-color-gray-4)",
                        flexShrink: 0,
                      }}
                    />
                    <Text size="xs" c="dimmed">
                      Hidden
                    </Text>
                  </Group>
                  <Text size="xs" fw={700} c="dimmed">
                    {hiddenLevels}
                  </Text>
                </Group>
              )}
            </Stack>
          </Group>
          <StackedBar
            segments={[
              {
                label: "People",
                value: totalPeople,
                color: "#7c3aed",
                delta: `+${peopleDelta}`,
                deltaPositive: true,
              },
              {
                label: "Units",
                value: totalDepts,
                color: "#06b6d4",
                delta: `+${unitsDelta}`,
                deltaPositive: true,
              },
            ]}
          />
        </KpiCard>

        {/* Performance */}
        <KpiCard title="PERFORMANCE METRICS">
          <Stack gap={12}>
            <ProgressBar
              label="Task completion"
              value={tasksDone}
              max={tasksDone + tasksActive}
              color="#7c3aed"
            />
            <ProgressBar
              label="Staff capacity"
              value={staffCapacity}
              color="#06b6d4"
            />
            <ProgressBar
              label="Budget utilization"
              value={budgetUtil}
              color="#f59e0b"
            />
          </Stack>
        </KpiCard>

        {/* Work overview */}
        <KpiCard title="WORK OVERVIEW">
          <Group justify="space-between" mb={10}>
            <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
              Activity · last 6 months
            </Text>
            <Text size="xs" fw={600} c="violet" style={{ fontSize: 10 }}>
              {tasksDone} total
            </Text>
          </Group>
          <ActivityHeatmap data={heatmapData} color="violet" />
        </KpiCard>

        {/* Health issues */}
        {healthIssues.length > 0 && (
          <KpiCard
            style={{
              background: "var(--mantine-color-orange-0)",
              borderColor: "var(--mantine-color-orange-2)",
            }}
          >
            <Group gap={6} mb={10}>
              <WarningIcon
                size={13}
                color="var(--mantine-color-orange-6)"
                aria-label="Warning"
              />
              <Text
                size="xs"
                fw={700}
                tt="uppercase"
                c="orange"
                style={{ letterSpacing: "0.06em", fontSize: 10 }}
              >
                Structure Health
              </Text>
            </Group>
            <Stack gap={6}>
              {healthIssues.map((issue) => (
                <Group key={issue} gap={7} align="flex-start" wrap="nowrap">
                  <Text
                    c="orange"
                    style={{ fontSize: 11, lineHeight: 1.5, flexShrink: 0 }}
                  >
                    •
                  </Text>
                  <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
                    {HEALTH_LABELS[issue as NodeHealthIssue] ?? issue}
                  </Text>
                </Group>
              ))}
            </Stack>
          </KpiCard>
        )}
      </Stack>
    </Stack>
  );
}

export function OrgDrawer({ opened, onClose, ...rest }: OrgDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size="sm" variant="light" color="violet">
            <BuildingsIcon size={14} aria-label="Organization" />
          </ThemeIcon>
          <Text fw={600} size="sm">
            Organization
          </Text>
        </Group>
      }
      position="right"
      size="sm"
      padding="md"
    >
      <OrgDrawerContent {...rest} />
    </Drawer>
  );
}
