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
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { BuildingOfficeIcon } from "@phosphor-icons/react/dist/csr/BuildingOffice";
import { ArrowBendUpLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowBendUpLeft";
import {
  KpiCard,
  StatRow,
  MiniBarChart,
  RingChart,
  ActivityHeatmap,
  ProgressBar,
  makeSeededRng,
} from "../InspectorPanel/charts";
import type { PersonDrawerProps } from "./PersonDrawer.types";
import type { NodeHealthIssue } from "../../OrganizationTree.types";
import { STATUS_COLORS, getInitials } from "../../OrganizationTree.utils";

const HEALTH_LABELS: Record<NodeHealthIssue, string> = {
  missing_head: "Not assigned as head of any department",
  empty_dept: "No direct reports",
  no_parent: "No reporting manager assigned",
  too_many_reports: "Too many direct reports (>10)",
  inactive_head: "Account is inactive but still assigned as head",
};

const ROLE_COLORS: Record<string, string> = {
  head: "violet",
  manager: "blue",
  coordinator: "teal",
  officer: "cyan",
  member: "gray",
  advisor: "orange",
  minister: "grape",
  secretary: "indigo",
  joint_secretary: "blue",
  under_secretary: "cyan",
  section_officer: "teal",
  assistant: "green",
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

type PersonDrawerContentProps = Omit<PersonDrawerProps, "opened" | "onClose">;

export function PersonDrawerContent({
  nodeId,
  data,
  onEdit,
  onDelete,
  healthIssues = [],
  directReports = 0,
  totalBelow = 0,
}: PersonDrawerContentProps) {
  const rng = makeSeededRng(nodeId);

  const tasksDone =
    data.activeTasks !== undefined
      ? Math.floor(data.activeTasks * 3.4)
      : Math.floor(rng() * 120 + 20);
  const tasksActive = data.activeTasks ?? Math.floor(rng() * 25 + 5);
  const performanceScore = Math.floor(rng() * 30 + 65);
  const attendancePct = Math.floor(rng() * 15 + 82);
  const deliveryPct = Math.floor(rng() * 25 + 68);
  const tasksDelta = Math.floor(rng() * 20 + 5);
  const tasksPending = Math.max(0, Math.floor(rng() * 10));

  const tasksSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 70 + 10),
  );
  const activeSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 30 + 5),
  );
  const reportsSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 20 + 2),
  );
  const perfSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 40 + 50),
  );
  const attendSparkData = Array.from({ length: 8 }, () =>
    Math.floor(rng() * 20 + 75),
  );

  const now = new Date();
  const barData = Array.from({ length: 6 }, (_, i) => {
    const monthIdx = (now.getMonth() - 5 + i + 12) % 12;
    return { label: MONTHS[monthIdx], value: Math.floor(rng() * 60 + 10) };
  });

  const heatmapData = Array.from({ length: 26 * 7 }, () => {
    const r = rng();
    if (data.status === "inactive") return r < 0.7 ? 0 : 1;
    return r < 0.35 ? 0 : r < 0.55 ? 1 : r < 0.72 ? 2 : r < 0.88 ? 3 : 4;
  });

  const totalTasks = tasksDone + tasksActive + tasksPending;

  return (
    <Stack gap={0}>
      {/* ── Info section — no cards ───────────────────────────────────────── */}
      <div style={{ padding: "18px 20px 20px" }}>
        <Group gap={12} align="flex-start">
          <Avatar
            src={data.avatarUrl}
            color={data.status === "inactive" ? "gray" : "teal"}
            radius="xl"
            size={52}
            alt={data.fullName}
          >
            {getInitials(data.fullName)}
          </Avatar>
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={700} size="md" lineClamp={1}>
              {data.fullName}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {data.designation}
            </Text>
            <Group gap={5} mt={2}>
              <Badge
                size="xs"
                color={STATUS_COLORS[data.status]}
                variant="light"
              >
                {data.status}
              </Badge>
              {data.role && (
                <Badge
                  size="xs"
                  color={ROLE_COLORS[data.role] ?? "gray"}
                  variant="light"
                >
                  {data.role.replace(/_/g, " ")}
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>

        {(data.department ||
          data.reportingManager ||
          data.email ||
          data.phone) && (
          <Stack gap={7} mt={14}>
            {data.department && (
              <Group gap={7}>
                <BuildingOfficeIcon
                  size={13}
                  color="var(--mantine-color-dimmed)"
                  aria-label="Department"
                />
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {data.department}
                </Text>
              </Group>
            )}
            {data.reportingManager && (
              <Group gap={7}>
                <ArrowBendUpLeftIcon
                  size={13}
                  color="var(--mantine-color-dimmed)"
                  aria-label="Reports to"
                />
                <Text size="xs" c="dimmed">
                  Reports to{" "}
                  <Text span fw={600} c="dark" size="xs">
                    {data.reportingManager}
                  </Text>
                </Text>
              </Group>
            )}
            {data.email && (
              <Group gap={7}>
                <EnvelopeIcon
                  size={13}
                  color="var(--mantine-color-dimmed)"
                  aria-label="Email"
                />
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {data.email}
                </Text>
              </Group>
            )}
            {data.phone && (
              <Group gap={7}>
                <PhoneIcon
                  size={13}
                  color="var(--mantine-color-dimmed)"
                  aria-label="Phone"
                />
                <Text size="xs" c="dimmed">
                  {data.phone}
                </Text>
              </Group>
            )}
          </Stack>
        )}
      </div>

      <Divider />

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <Stack gap={14} style={{ padding: "20px 16px" }}>
        {/* Tasks done + Active */}
        <SimpleGrid cols={2} spacing={12}>
          <KpiCard title="TASKS DONE">
            <StatRow
              title="Completed"
              value={tasksDone.toLocaleString()}
              delta={`+${tasksDelta}%`}
              deltaPositive
              description="This period"
              sparkData={tasksSparkData}
              sparkColor="#bbf7d0"
              sparkActiveColor="#059669"
            />
          </KpiCard>
          <KpiCard title="ACTIVE">
            <StatRow
              title="In progress"
              value={tasksActive.toLocaleString()}
              description="Assigned now"
              sparkData={activeSparkData}
              sparkColor="#fef3c7"
              sparkActiveColor="#f59e0b"
            />
          </KpiCard>
        </SimpleGrid>

        {/* Direct reports + Total below */}
        {(directReports > 0 || totalBelow > 0) && (
          <SimpleGrid cols={2} spacing={12}>
            <KpiCard title="DIRECT">
              <StatRow
                title="Reports to me"
                value={directReports.toLocaleString()}
                description="Immediate team"
                sparkData={reportsSparkData}
                sparkColor="#ddd6fe"
                sparkActiveColor="#7c3aed"
              />
            </KpiCard>
            <KpiCard title="TOTAL BELOW">
              <StatRow
                title="Full chain"
                value={totalBelow.toLocaleString()}
                description="All subordinates"
                sparkData={reportsSparkData.map((v) =>
                  Math.round((v * totalBelow) / Math.max(directReports, 1)),
                )}
                sparkColor="#bfdbfe"
                sparkActiveColor="#3b82f6"
              />
            </KpiCard>
          </SimpleGrid>
        )}

        {/* Performance + Attendance */}
        <SimpleGrid cols={2} spacing={12}>
          <KpiCard title="PERFORMANCE">
            <StatRow
              title="Overall score"
              value={`${performanceScore}%`}
              valueColor={
                performanceScore > 85
                  ? "teal"
                  : performanceScore > 70
                    ? "blue"
                    : "orange"
              }
              delta={performanceScore > 80 ? "Top" : "On track"}
              deltaPositive={performanceScore > 65}
              description="Combined rating"
              sparkData={perfSparkData}
              sparkColor="#ddd6fe"
              sparkActiveColor="#7c3aed"
            />
          </KpiCard>
          <KpiCard title="ATTENDANCE">
            <StatRow
              title="Rate"
              value={`${attendancePct}%`}
              valueColor={attendancePct > 90 ? "teal" : "orange"}
              delta={attendancePct > 90 ? "Excellent" : "Good"}
              deltaPositive={attendancePct > 85}
              description="This quarter"
              sparkData={attendSparkData}
              sparkColor="#ccfbf1"
              sparkActiveColor="#14b8a6"
            />
          </KpiCard>
        </SimpleGrid>

        {/* Monthly contributions */}
        <KpiCard title="MONTHLY CONTRIBUTIONS">
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
              color="#bbf7d0"
              activeColor="#059669"
            />
          </div>
        </KpiCard>

        {/* Task breakdown */}
        <KpiCard title="TASK BREAKDOWN">
          <Group gap={14} align="center" wrap="nowrap">
            <RingChart
              segments={[
                { value: tasksDone, color: "#059669", label: "Done" },
                { value: tasksActive, color: "#f59e0b", label: "Active" },
                { value: tasksPending, color: "#e5e7eb", label: "Pending" },
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
                  value: tasksDone,
                  color: "#059669",
                  textColor: "teal" as const,
                },
                {
                  label: "Active",
                  value: tasksActive,
                  color: "#f59e0b",
                  textColor: "orange" as const,
                },
                {
                  label: "Pending",
                  value: tasksPending,
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

        {/* Delivery metrics */}
        <KpiCard title="DELIVERY METRICS">
          <Stack gap={12}>
            <ProgressBar
              label="Overall score"
              value={performanceScore}
              color="#7c3aed"
            />
            <ProgressBar
              label="Attendance"
              value={attendancePct}
              color="#059669"
            />
            <ProgressBar
              label="Delivery rate"
              value={deliveryPct}
              color="#0891b2"
            />
          </Stack>
        </KpiCard>

        {/* Work overview */}
        <KpiCard title="WORK OVERVIEW">
          <Group justify="space-between" mb={10}>
            <Text size="xs" c="dimmed" style={{ fontSize: 10 }}>
              Activity · last 6 months
            </Text>
            <Text size="xs" fw={600} c="teal" style={{ fontSize: 10 }}>
              {tasksDone} activities
            </Text>
          </Group>
          <ActivityHeatmap data={heatmapData} color="teal" />
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
                Health
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

export function PersonDrawer({ opened, onClose, ...rest }: PersonDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={
        <Group gap="sm">
          <Avatar
            src={rest.data.avatarUrl}
            color="teal"
            radius="xl"
            size="md"
            alt={rest.data.fullName}
          >
            {getInitials(rest.data.fullName)}
          </Avatar>
          <Stack gap={0}>
            <Text fw={700} size="sm">
              {rest.data.fullName}
            </Text>
            <Text size="xs" c="dimmed">
              {rest.data.designation}
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
        <PersonDrawerContent {...rest} />
      </ScrollArea>
    </Drawer>
  );
}
