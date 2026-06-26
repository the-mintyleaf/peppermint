"use client";

import {
  Avatar,
  Badge,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@peppermint/ui";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import {
  KpiCard,
  StatRow,
  StackedBar,
  MiniBarChart,
  RingChart,
  ProgressBar,
  ActivityHeatmap,
  makeSeededRng,
} from "../InspectorPanel/charts";
import type { DepartmentDrawerProps } from "./DepartmentDrawer.types";
import type { NodeHealthIssue } from "../../OrganizationTree.types";
import { STATUS_COLORS } from "../../OrganizationTree.utils";

const HEALTH_LABELS: Record<NodeHealthIssue, string> = {
  missing_head: "No department head assigned",
  empty_dept: "No people assigned to this department",
  no_parent: "Orphan — no parent unit found",
  too_many_reports: "Too many direct reports (>10)",
  inactive_head: "Department head account is inactive",
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

type DepartmentDrawerContentProps = Omit<
  DepartmentDrawerProps,
  "opened" | "onClose"
>;

export function DepartmentDrawerContent({
  nodeId,
  data,
  onEdit,
  onDelete,
  onAddPerson,
  onAddChild,
  healthIssues = [],
  totalPeople,
  totalDepts,
  hiddenLevels,
}: DepartmentDrawerContentProps) {
  const rng = makeSeededRng(nodeId);

  const activeTasks = data.activeTasks ?? Math.floor(rng() * 30 + 5);
  const pendingTasks = data.pendingTasks ?? Math.floor(rng() * 20 + 3);
  const completedTasks = data.completedTasks ?? Math.floor(rng() * 120 + 20);
  const peopleCount = data.peopleCount ?? totalPeople ?? 0;
  const tasksDelta = Math.floor(rng() * 25 + 5);
  const peopleDelta = Math.floor(rng() * 5 + 1);
  const capacityPct = Math.floor(rng() * 35 + 55);
  const deliveryPct = Math.floor(rng() * 30 + 60);

  const peopleSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 40 + 5),
  );
  const tasksSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 80 + 10),
  );
  const activeSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 30 + 3),
  );

  const now = new Date();
  const barData = Array.from({ length: 6 }, (_, i) => {
    const monthIdx = (now.getMonth() - 5 + i + 12) % 12;
    return { label: MONTHS[monthIdx], value: Math.floor(rng() * 70 + 15) };
  });

  const heatmapData = Array.from({ length: 26 * 7 }, () => {
    const r = rng();
    return r < 0.38 ? 0 : r < 0.58 ? 1 : r < 0.74 ? 2 : r < 0.9 ? 3 : 4;
  });

  const totalTasks = activeTasks + pendingTasks + completedTasks;

  return (
    <Stack gap={0}>
      {/* ── Info section — no cards ───────────────────────────────────────── */}
      <div style={{ padding: "18px 20px 20px" }}>
        <Group gap={6} mb={10}>
          <Badge size="sm" color={STATUS_COLORS[data.status]} variant="light">
            {data.status}
          </Badge>
          <Badge size="sm" color="violet" variant="dot">
            {data.deptType}
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
          {data.head && (
            <Group gap={7}>
              <UserIcon
                size={13}
                color="var(--mantine-color-dimmed)"
                aria-label="Head"
              />
              <Text size="xs" c="dimmed">
                Head:{" "}
                <Text span fw={600} c="dark" size="xs">
                  {data.head}
                </Text>
              </Text>
            </Group>
          )}
          {data.parentName && (
            <Group gap={7}>
              <TreeStructureIcon
                size={13}
                color="var(--mantine-color-dimmed)"
                aria-label="Parent"
              />
              <Text size="xs" c="dimmed">
                Under:{" "}
                <Text span fw={600} c="dark" size="xs">
                  {data.parentName}
                </Text>
              </Text>
            </Group>
          )}
          {data.childDeptNames && data.childDeptNames.length > 0 && (
            <Group gap={7} align="flex-start" wrap="nowrap">
              <FolderIcon
                size={13}
                color="var(--mantine-color-dimmed)"
                aria-label="Sub-units"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <Group gap={4} wrap="wrap">
                {data.childDeptNames.map((name) => (
                  <Badge key={name} variant="outline" size="xs" color="violet">
                    {name}
                  </Badge>
                ))}
              </Group>
            </Group>
          )}
        </Stack>
      </div>

      <Divider />

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <Stack gap={14} style={{ padding: "20px 16px" }}>
        {/* People + Tasks done */}
        <SimpleGrid cols={2} spacing={12}>
          <KpiCard title="PEOPLE">
            <StatRow
              title="Staff assigned"
              value={peopleCount.toLocaleString()}
              delta={`+${peopleDelta}`}
              deltaPositive
              description="Active members"
              sparkData={peopleSparkData}
              sparkColor="#ddd6fe"
              sparkActiveColor="#7c3aed"
            />
          </KpiCard>
          <KpiCard title="TASKS DONE">
            <StatRow
              title="Completed"
              value={completedTasks.toLocaleString()}
              delta={`+${tasksDelta}%`}
              deltaPositive
              description="This period"
              sparkData={tasksSparkData}
              sparkColor="#bbf7d0"
              sparkActiveColor="#059669"
            />
          </KpiCard>
        </SimpleGrid>

        {/* Active + Pending */}
        <SimpleGrid cols={2} spacing={12}>
          <KpiCard title="ACTIVE">
            <StatRow
              title="In progress"
              value={activeTasks.toLocaleString()}
              description="Ongoing tasks"
              sparkData={activeSparkData}
              sparkColor="#fef3c7"
              sparkActiveColor="#f59e0b"
            />
          </KpiCard>
          <KpiCard title="PENDING">
            <StatRow
              title="Queued"
              value={pendingTasks.toLocaleString()}
              description="Awaiting start"
              sparkData={activeSparkData.map((v) => Math.round(v * 0.6))}
              sparkColor="#fee2e2"
              sparkActiveColor="#ef4444"
            />
          </KpiCard>
        </SimpleGrid>

        {/* Monthly activity */}
        <KpiCard title="MONTHLY ACTIVITY">
          <StatRow
            title="This month"
            value={(barData[barData.length - 1]?.value ?? 0).toLocaleString()}
            delta={`+${tasksDelta}%`}
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

        {/* Task breakdown */}
        <KpiCard title="TASK BREAKDOWN">
          <Group gap={14} align="center" wrap="nowrap">
            <RingChart
              segments={[
                { value: completedTasks, color: "#059669", label: "Done" },
                { value: activeTasks, color: "#f59e0b", label: "Active" },
                { value: pendingTasks, color: "#e5e7eb", label: "Pending" },
              ]}
              size={84}
              thickness={9}
              centerLabel={`${totalTasks}`}
              centerSub="total"
            />
            <Stack gap={8} style={{ flex: 1 }}>
              {[
                {
                  label: "Completed",
                  value: completedTasks,
                  color: "#059669",
                  textColor: "teal" as const,
                },
                {
                  label: "Active",
                  value: activeTasks,
                  color: "#f59e0b",
                  textColor: "orange" as const,
                },
                {
                  label: "Pending",
                  value: pendingTasks,
                  color: "#e5e7eb",
                  textColor: "dimmed" as const,
                },
              ].map((item) => (
                <Group key={item.label} gap={6} justify="space-between">
                  <Group gap={6}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <Text size="xs" c="dimmed">
                      {item.label}
                    </Text>
                  </Group>
                  <Text size="xs" fw={700} c={item.textColor}>
                    {item.value}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Group>
        </KpiCard>

        {/* Structure */}
        {(totalPeople !== undefined || totalDepts !== undefined) && (
          <KpiCard title="STRUCTURE">
            <StackedBar
              segments={[
                ...(totalPeople !== undefined
                  ? [
                      {
                        label: "People",
                        value: totalPeople,
                        color: "#7c3aed",
                        delta: `+${peopleDelta}`,
                        deltaPositive: true,
                      },
                    ]
                  : []),
                ...(totalDepts !== undefined
                  ? [{ label: "Units", value: totalDepts, color: "#06b6d4" }]
                  : []),
                ...((hiddenLevels ?? 0) > 0
                  ? [
                      {
                        label: "Hidden",
                        value: hiddenLevels ?? 0,
                        color: "#e5e7eb",
                      },
                    ]
                  : []),
              ]}
            />
          </KpiCard>
        )}

        {/* Performance */}
        <KpiCard title="PERFORMANCE">
          <Stack gap={12}>
            <ProgressBar
              label="Task completion"
              value={completedTasks}
              max={totalTasks || 1}
              color="#7c3aed"
            />
            <ProgressBar
              label="Staff capacity"
              value={capacityPct}
              color="#06b6d4"
            />
            <ProgressBar
              label="Delivery rate"
              value={deliveryPct}
              color="#059669"
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
              {completedTasks} total
            </Text>
          </Group>
          <ActivityHeatmap data={heatmapData} color="violet" />
        </KpiCard>

        {/* Members */}
        {data.assignedPeople && data.assignedPeople.length > 0 && (
          <KpiCard title="MEMBERS">
            <Stack gap={10}>
              {data.assignedPeople.map((p) => (
                <Group key={p.id} gap={10}>
                  <Avatar size="sm" color="violet" radius="xl">
                    {p.name[0]}
                  </Avatar>
                  <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                    <Text size="xs" fw={600} lineClamp={1}>
                      {p.name}
                    </Text>
                    {p.designation && (
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {p.designation}
                      </Text>
                    )}
                  </Stack>
                </Group>
              ))}
            </Stack>
          </KpiCard>
        )}

        {/* Recent activity */}
        {data.recentActivity && data.recentActivity.length > 0 && (
          <KpiCard title="RECENT ACTIVITY">
            <Stack gap={10}>
              {data.recentActivity.slice(0, 4).map((item) => (
                <Group key={item.id} gap={10} align="flex-start" wrap="nowrap">
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--mantine-color-violet-5)",
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                    <Text size="xs" lineClamp={1}>
                      {item.action}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {item.timestamp}
                    </Text>
                  </Stack>
                </Group>
              ))}
            </Stack>
          </KpiCard>
        )}

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

export function DepartmentDrawer({
  opened,
  onClose,
  ...rest
}: DepartmentDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" color="violet" variant="light">
            <FolderIcon size={18} weight="fill" aria-label="Department" />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={700} size="sm">
              {rest.data.name}
            </Text>
            <Text size="xs" c="dimmed" tt="capitalize">
              {rest.data.deptType}
            </Text>
          </Stack>
        </Group>
      }
      styles={{
        body: { padding: 0 },
        header: {
          padding: "16px 20px 12px",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        },
      }}
    >
      <ScrollArea h="calc(100vh - 80px)" p="md">
        <DepartmentDrawerContent {...rest} />
      </ScrollArea>
    </Drawer>
  );
}
