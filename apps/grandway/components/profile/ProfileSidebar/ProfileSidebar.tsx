"use client";

import { Avatar, Divider, Skeleton, Stack, Text, Title } from "@peppermint/ui";
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
 * The identity block that anchors a profile page: a centered avatar, name, and
 * status up top; the key facts as a property list; and the primary and lifecycle
 * actions docked at the foot, separated from the facts so a lever never sits
 * flush against a fact it changes. No card/border — it's a flush pane, separated
 * from the content column by `ProfileLayout`'s full-height divider.
 */
export function ProfileSidebar({
  name,
  subtitle,
  status,
  avatarLabel,
  avatarSrc,
  avatarLoading = false,
  fields,
  actions,
}: ProfileSidebarProps) {
  return (
    <Stack gap="md" p="md">
      <Stack align="center" gap="sm">
        {avatarLoading ? (
          <Skeleton height={72} width={72} circle />
        ) : (
          <Avatar
            src={avatarSrc}
            alt={avatarSrc ? `Photograph of ${name}` : undefined}
            size={72}
            radius="xl"
            color="blue"
          >
            {initials(avatarLabel ?? name)}
          </Avatar>
        )}
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
  );
}
