"use client";

import { Badge, Divider, SimpleGrid, Stack, Text } from "@peppermint/ui";
import {
  CONFIDENTIALITY_COLORS,
  getConfidentialityLabel,
  getOwnershipScopeLabel,
  getUnitTypeLabel,
  UNIT_TYPE_COLORS,
} from "../../organization-unit.constants";
import type { OrganizationUnit } from "../../organization-unit.api";

function Field({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === "") return null;
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs">{value}</Text>
    </Stack>
  );
}

export function OverviewTab({ unit }: { unit: OrganizationUnit }) {
  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <GroupBadges unit={unit} />
        <Text fw={600}>{unit.name}</Text>
        {unit.nameNepali && (
          <Text size="xs" c="dimmed">
            {unit.nameNepali}
          </Text>
        )}
        {unit.description && (
          <Text size="xs" c="dimmed">
            {unit.description}
          </Text>
        )}
      </Stack>

      <Divider label="Identity" labelPosition="left" />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <Field label="Code" value={unit.code} />
        <Field label="Unit Type" value={getUnitTypeLabel(unit.unitType)} />
        <Field label="Status" value={unit.status} />
        <Field label="Hierarchy Level" value={unit.level} />
        <Field label="Created" value={new Date(unit.createdAt).toLocaleString()} />
        <Field label="Updated" value={new Date(unit.updatedAt).toLocaleString()} />
      </SimpleGrid>

      <Divider label="Location & Contact" labelPosition="left" />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <Field label="Province" value={unit.province} />
        <Field label="District" value={unit.district} />
        <Field label="Municipality" value={unit.municipality} />
        <Field label="Ward" value={unit.ward} />
        <Field label="Address" value={unit.address} />
        <Field label="Phone" value={unit.phone} />
        <Field label="Email" value={unit.email} />
        <Field label="Website" value={unit.website} />
      </SimpleGrid>

      <Divider label="Office Head" labelPosition="left" />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <Field label="Name" value={unit.headName} />
        <Field label="Title" value={unit.headTitle} />
        <Field label="Phone" value={unit.headPhone} />
        <Field label="Email" value={unit.headEmail} />
      </SimpleGrid>

      <Divider label="Kanban Defaults" labelPosition="left" />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <Field
          label="Task Visibility"
          value={getOwnershipScopeLabel(unit.taskVisibility)}
        />
        <Field label="Linked Boards" value={unit.boardIds.length} />
        <Field
          label="Confidentiality"
          value={getConfidentialityLabel(unit.confidentialityLevel)}
        />
      </SimpleGrid>
    </Stack>
  );
}

function GroupBadges({ unit }: { unit: OrganizationUnit }) {
  return (
    <Stack gap="xs">
      <Badge size="xs" color={UNIT_TYPE_COLORS[unit.unitType]} w="fit-content">
        {getUnitTypeLabel(unit.unitType)}
      </Badge>
      <Badge
        size="xs"
        color={CONFIDENTIALITY_COLORS[unit.confidentialityLevel]}
        w="fit-content"
      >
        {getConfidentialityLabel(unit.confidentialityLevel)}
      </Badge>
    </Stack>
  );
}
