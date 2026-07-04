"use client";

import Link from "next/link";
import {
  Anchor,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { CircleIcon } from "@phosphor-icons/react/dist/csr/Circle";

import type { SetupProgressCardProps } from "./SetupProgressCard.types";

interface ProgressRowProps {
  done: boolean;
  label: string;
  actionLabel: string;
  href: string;
}

function ProgressRow({ done, label, actionLabel, href }: ProgressRowProps) {
  return (
    <Group justify="space-between">
      <Group gap="xs">
        {done ? (
          <CheckCircleIcon
            size={16}
            weight="fill"
            color="var(--mantine-color-green-6)"
          />
        ) : (
          <CircleIcon size={16} color="var(--mantine-color-gray-5)" />
        )}
        <Text size="sm">{label}</Text>
      </Group>
      {!done && (
        <Anchor component={Link} href={href} size="xs">
          {actionLabel}
        </Anchor>
      )}
    </Group>
  );
}

export function SetupProgressCard({
  organizationId,
  hasRootUnit,
  membersInvited,
  isLoading,
}: SetupProgressCardProps) {
  if (isLoading) {
    return <Skeleton height={120} radius="md" />;
  }

  return (
    <Card withBorder padding="md" radius="md">
      <Title order={5} mb="sm">
        Setup Progress
      </Title>
      <Stack gap="xs">
        <ProgressRow
          done={hasRootUnit}
          label="Root unit created"
          actionLabel="Open Structure Builder"
          href={`/admin/organization/${organizationId}/structure`}
        />
        <ProgressRow
          done={membersInvited > 0}
          label={
            membersInvited > 0
              ? `${membersInvited} member${membersInvited === 1 ? "" : "s"} invited`
              : "Members invited"
          }
          actionLabel="Invite members"
          href={`/admin/organization/${organizationId}/members`}
        />
      </Stack>
    </Card>
  );
}
