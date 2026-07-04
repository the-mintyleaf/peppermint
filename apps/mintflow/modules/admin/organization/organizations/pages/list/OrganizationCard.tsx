"use client";

import { Card, Group, Stack, Text, ThemeIcon } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";

import { OrganizationStatusBadge } from "../../../_shared/components/OrganizationStatusBadge";
import type { OrganizationCardProps } from "./OrganizationCard.types";

export function OrganizationCard({
  organization,
  onSelect,
}: OrganizationCardProps) {
  return (
    <Card
      withBorder
      padding="md"
      radius="md"
      onClick={() => onSelect(organization)}
      style={{ cursor: "pointer" }}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light">
            <BuildingsIcon size={18} weight="fill" aria-hidden />
          </ThemeIcon>
          <OrganizationStatusBadge status={organization.status} />
        </Group>
        <Stack gap={2}>
          <Text fw={600} size="sm" lineClamp={1}>
            {organization.name}
          </Text>
          <Text size="xs" c="dimmed">
            {organization.code} · {organization.organization_type}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}
