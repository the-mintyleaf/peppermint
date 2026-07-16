"use client";

import { Card, Group, Stack, Text, ThemeIcon } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";

import { BilingualName } from "../../../_shared/components/BilingualName";
import { OrganizationRowActionsMenu } from "./components/OrganizationRowActionsMenu";
import { OrganizationStatusSegmentedControl } from "./components/OrganizationStatusSegmentedControl";
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
          <Group gap="xs" wrap="nowrap">
            <OrganizationStatusSegmentedControl organization={organization} />
            <OrganizationRowActionsMenu
              organization={organization}
              onSelect={onSelect}
            />
          </Group>
        </Group>
        <Stack gap={2}>
          <BilingualName
            np={organization.name_np}
            en={organization.name_en}
            size="sm"
            fw={600}
          />
          <Text size="xs" c="dimmed">
            {organization.code} · {organization.organization_type}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}
