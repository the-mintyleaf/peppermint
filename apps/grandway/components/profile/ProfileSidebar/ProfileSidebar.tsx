"use client";

import { Avatar, Card, Divider, Stack, Text, Title } from "@peppermint/ui";
import type { ProfileSidebarProps } from "./ProfileSidebar.types";

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/**
 * The sticky identity card that anchors a profile page: a centered avatar,
 * name, and status up top; the key facts as a property list; and the primary
 * and lifecycle actions docked at the foot, separated from the facts so a lever
 * never sits flush against a fact it changes.
 */
export function ProfileSidebar({
  name,
  subtitle,
  status,
  avatarLabel,
  fields,
  actions,
}: ProfileSidebarProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Stack gap="md">
        <Stack align="center" gap="sm">
          <Avatar size={72} radius="xl" color="blue">
            {initials(avatarLabel ?? name)}
          </Avatar>
          <Stack align="center" gap={6}>
            <Title
              order={2}
              size="h3"
              ta="center"
              style={{ overflowWrap: "anywhere" }}
            >
              {name}
            </Title>
            {subtitle ? (
              <Text size="sm" c="dimmed" ta="center">
                {subtitle}
              </Text>
            ) : null}
            {status}
          </Stack>
        </Stack>

        {fields ? (
          <>
            <Divider />
            <Stack gap="sm">{fields}</Stack>
          </>
        ) : null}

        {actions ? (
          <>
            <Divider />
            <Stack gap="xs">{actions}</Stack>
          </>
        ) : null}
      </Stack>
    </Card>
  );
}
