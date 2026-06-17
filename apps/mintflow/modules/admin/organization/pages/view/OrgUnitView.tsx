"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Center,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { ArrowsInLineVerticalIcon } from "@phosphor-icons/react/dist/csr/ArrowsInLineVertical";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { fetchOrgUnit } from "../../module.api";
import type { OrganizationUnit, OrgUnitType, OrgUnitStatus, ConfidentialityLevel, TaskVisibility } from "../../module.api";

const UNIT_TYPE_LABELS: Record<OrgUnitType, string> = {
  ministry: "Ministry",
  department: "Department",
  division: "Division",
  section: "Section",
  district_office: "District Office",
  area_office: "Area Office",
  security_agency: "Security Agency",
  other: "Other",
};

const STATUS_COLORS: Record<OrgUnitStatus, string> = {
  active: "green",
  inactive: "orange",
  archived: "gray",
};

const CONFIDENTIALITY_COLORS: Record<ConfidentialityLevel, string> = {
  public: "green",
  restricted: "yellow",
  confidential: "orange",
  top_secret: "red",
};

const VISIBILITY_LABELS: Record<TaskVisibility, string> = {
  all_members: "All Members",
  direct_members: "Direct Members",
  head_only: "Head Only",
};

interface InfoRowProps {
  label: string;
  value: string | null | undefined;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} lh={1}>
        {label}
      </Text>
      <Text size="sm">{value || "—"}</Text>
    </Stack>
  );
}

interface OverviewTabProps {
  unit: OrganizationUnit;
}

function OverviewTab({ unit }: OverviewTabProps) {
  return (
    <Stack gap="xl" p="md">
      <Group gap="sm" align="center">
        <Title order={4}>{unit.name}</Title>
        <Badge size="sm" color={STATUS_COLORS[unit.status as OrgUnitStatus] ?? "gray"}>
          {unit.status}
        </Badge>
        <Badge size="sm" variant="light">
          {UNIT_TYPE_LABELS[unit.unitType as OrgUnitType] ?? unit.unitType}
        </Badge>
        <Badge size="sm" color={CONFIDENTIALITY_COLORS[unit.confidentialityLevel as ConfidentialityLevel] ?? "gray"} variant="outline">
          {unit.confidentialityLevel}
        </Badge>
      </Group>

      {unit.description && <Text size="sm" c="dimmed">{unit.description}</Text>}

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">Identity</Text>
            <InfoRow label="Nepali Name" value={unit.nameNepali} />
            <InfoRow label="Code" value={unit.code} />
            <InfoRow label="Level" value={String(unit.level)} />
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">Location</Text>
            <InfoRow label="Province" value={unit.province} />
            <InfoRow label="District" value={unit.district} />
            <InfoRow label="Municipality" value={unit.municipality} />
            <InfoRow label="Address" value={unit.address} />
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">Contact</Text>
            <InfoRow label="Phone" value={unit.phone} />
            <InfoRow label="Email" value={unit.email} />
            <InfoRow label="Fax" value={unit.fax} />
            <InfoRow label="Website" value={unit.website} />
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed">Office Head</Text>
            <InfoRow label="Name" value={unit.headName} />
            <InfoRow label="Title" value={unit.headTitle} />
            <InfoRow label="Phone" value={unit.headPhone} />
            <InfoRow label="Email" value={unit.headEmail} />
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}

function UsersTab() {
  return (
    <Stack p="md" gap="md">
      <Text size="sm" c="dimmed">
        User assignments will be managed via the Users module. Once users are assigned to this office unit,
        they will appear here.
      </Text>
    </Stack>
  );
}

interface BoardsTabProps {
  unit: OrganizationUnit;
}

function BoardsTab({ unit }: BoardsTabProps) {
  return (
    <Stack p="md" gap="md">
      <Stack gap="xs">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">Task Visibility</Text>
        <Badge size="sm" variant="light">
          {VISIBILITY_LABELS[unit.taskVisibility as TaskVisibility] ?? unit.taskVisibility}
        </Badge>
      </Stack>
      {unit.boardIds.length === 0 ? (
        <Text size="sm" c="dimmed">
          No boards are linked to this office unit yet. Boards created by members of this unit will
          appear here once board management is configured.
        </Text>
      ) : (
        <Stack gap="xs">
          {unit.boardIds.map((id) => (
            <Text key={id} size="sm">{id}</Text>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

interface EscalationTabProps {
  unit: OrganizationUnit;
}

function EscalationTab({ unit }: EscalationTabProps) {
  return (
    <Stack p="md" gap="md">
      {unit.escalationRules.length === 0 ? (
        <Text size="sm" c="dimmed">
          No escalation rules are configured for this unit. Edit the unit to add escalation rules.
        </Text>
      ) : (
        unit.escalationRules.map((rule) => (
          <Paper key={rule.id} withBorder p="md" radius="md">
            <SimpleGrid cols={3}>
              <InfoRow label="Trigger After" value={`${rule.triggerAfterDays} days`} />
              <InfoRow label="Escalate To" value={rule.escalateToId} />
              <InfoRow label="Notify Head" value={rule.notifyHead ? "Yes" : "No"} />
            </SimpleGrid>
          </Paper>
        ))
      )}
    </Stack>
  );
}

function AuditLogTab() {
  return (
    <Stack p="md" gap="md">
      <Text size="sm" c="dimmed">
        Audit log will be available once audit logging is configured in the system. All create,
        update, and delete operations on this unit will be recorded here.
      </Text>
    </Stack>
  );
}

interface OrgUnitViewProps {
  orgUnitId: string;
}

export function OrgUnitView({ orgUnitId }: OrgUnitViewProps) {
  const { data: unit, isLoading } = useQuery({
    queryKey: ["org-units.detail", orgUnitId],
    queryFn: () => fetchOrgUnit(orgUnitId),
    enabled: !!orgUnitId,
  });

  if (isLoading || !unit) {
    return (
      <Center h="100%">
        <Loader />
      </Center>
    );
  }

  return (
    <Tabs defaultValue="overview" h="100%" styles={{ root: { display: "flex", flexDirection: "column" } }}>
      <Tabs.List px="md" pt="md">
        <Tabs.Tab value="overview" leftSection={<BuildingsIcon size={14} aria-label="Overview" />}>
          Overview
        </Tabs.Tab>
        <Tabs.Tab value="users" leftSection={<UsersIcon size={14} aria-label="Users" />}>
          Users
        </Tabs.Tab>
        <Tabs.Tab value="boards" leftSection={<KanbanIcon size={14} aria-label="Boards" />}>
          Boards
        </Tabs.Tab>
        <Tabs.Tab value="escalation" leftSection={<ArrowsInLineVerticalIcon size={14} aria-label="Escalation" />}>
          Escalation
        </Tabs.Tab>
        <Tabs.Tab value="audit" leftSection={<ClockIcon size={14} aria-label="Audit Log" />}>
          Audit Log
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview" style={{ flex: 1, overflow: "auto" }}>
        <OverviewTab unit={unit} />
      </Tabs.Panel>
      <Tabs.Panel value="users" style={{ flex: 1, overflow: "auto" }}>
        <UsersTab />
      </Tabs.Panel>
      <Tabs.Panel value="boards" style={{ flex: 1, overflow: "auto" }}>
        <BoardsTab unit={unit} />
      </Tabs.Panel>
      <Tabs.Panel value="escalation" style={{ flex: 1, overflow: "auto" }}>
        <EscalationTab unit={unit} />
      </Tabs.Panel>
      <Tabs.Panel value="audit" style={{ flex: 1, overflow: "auto" }}>
        <AuditLogTab />
      </Tabs.Panel>
    </Tabs>
  );
}
