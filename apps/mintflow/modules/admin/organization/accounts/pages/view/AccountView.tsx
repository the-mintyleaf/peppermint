"use client";

import { Stack, Group, Text, Badge, Divider, SimpleGrid, Paper as Card } from "@peppermint/ui";
import { PermissionsMatrix } from "../../../_shared/PermissionsMatrix";
import type { Account, AccountStatus } from "../../accounts.types";
import type { PermissionSet } from "../../../_shared/PermissionsMatrix";

const STATUS_COLORS: Record<AccountStatus, string> = {
  active: "green",
  inactive: "gray",
  suspended: "red",
};

interface AccountViewProps {
  account: Account;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Group gap="xs" wrap="nowrap">
      <Text size="xs" c="dimmed" w={120} style={{ flexShrink: 0 }}>{label}</Text>
      <Text size="xs">{value || "—"}</Text>
    </Group>
  );
}

export function AccountView({ account }: AccountViewProps) {
  const permCount = account.personalizedPermissions.reduce(
    (sum, p) => sum + p.actions.length,
    0,
  );

  return (
    <Stack gap="lg" p="xl">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="xl" fw={700}>{account.fullName}</Text>
          {account.roleName && (
            <Badge size="sm" variant="light" color="blue">{account.roleName}</Badge>
          )}
        </Stack>
        <Badge
          size="md"
          color={STATUS_COLORS[account.status] ?? "gray"}
        >
          {account.status}
        </Badge>
      </Group>

      <Divider />

      <SimpleGrid cols={2} spacing="lg">
        <Card withBorder p="md" radius="md">
          <Stack gap="sm">
            <Text size="sm" fw={600}>Personal Information</Text>
            <InfoRow label="Full Name" value={account.fullName} />
            <InfoRow label="Birthday" value={account.birthday} />
            <InfoRow label="Address" value={account.address} />
          </Stack>
        </Card>

        <Card withBorder p="md" radius="md">
          <Stack gap="sm">
            <Text size="sm" fw={600}>Account Details</Text>
            <InfoRow label="Assigned Role" value={account.roleName ?? "None"} />
            <InfoRow
              label="Custom Permissions"
              value={permCount > 0 ? `${permCount} permission action${permCount === 1 ? "" : "s"}` : "None"}
            />
            <InfoRow label="Created" value={new Date(account.createdAt).toLocaleDateString()} />
            <InfoRow label="Last Updated" value={new Date(account.updatedAt).toLocaleDateString()} />
          </Stack>
        </Card>
      </SimpleGrid>

      {permCount > 0 && (
        <>
          <Divider />
          <Stack gap="sm">
            <Text size="sm" fw={600}>Personalized Permission Overrides</Text>
            <Text size="xs" c="dimmed">
              These permissions are applied on top of the role-assigned permissions.
            </Text>
            <PermissionsMatrix
              value={account.personalizedPermissions as PermissionSet[]}
              onChange={() => {}}
              disabled
            />
          </Stack>
        </>
      )}
    </Stack>
  );
}
