"use client";

import {
  Avatar,
  Box,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@peppermint/ui";
import type { PersonPositionChipProps } from "./PersonPositionChip.types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function PersonPositionChip({
  personName,
  positionTitle,
  unitName,
  employeeCode,
  avatarUrl,
  size = "md",
  onClick,
}: PersonPositionChipProps) {
  const avatarSize = size === "sm" ? "sm" : "md";
  const nameSize = size === "sm" ? "xs" : "sm";
  const metaSize = "xs";

  const content = (
    <Group gap="xs" wrap="nowrap">
      <Avatar src={avatarUrl ?? null} size={avatarSize} radius="xl">
        {getInitials(personName)}
      </Avatar>
      <Stack gap={0}>
        <Text size={nameSize} fw={500} lh={1.3}>
          {personName}
          {employeeCode && (
            <Text component="span" size={metaSize} c="dimmed" ml={4}>
              ({employeeCode})
            </Text>
          )}
        </Text>
        <Text size={metaSize} c="dimmed" lh={1.2}>
          {positionTitle}
          {unitName && ` · ${unitName}`}
        </Text>
      </Stack>
    </Group>
  );

  if (onClick) {
    return (
      <UnstyledButton onClick={onClick} style={{ display: "inline-flex" }}>
        {content}
      </UnstyledButton>
    );
  }

  return <Box style={{ display: "inline-flex" }}>{content}</Box>;
}
