"use client";

import { Box, Group, Text, UnstyledButton } from "@peppermint/ui";

import { tokens } from "@/config/design";

import type { PropertyRowProps } from "./PropertyRow.types";

/**
 * A single property line in the Create Task sheet: a fixed 104px label column
 * (icon + label) followed by a flexible value area. Rows are separated by a top
 * hairline. Pass `onClick` to make the whole row a toggle (Status / Priority).
 */
export function PropertyRow({
  icon,
  label,
  children,
  onClick,
  expanded,
}: PropertyRowProps) {
  const content = (
    <Group gap={0} wrap="nowrap" align="center" w="100%">
      <Group
        gap={9}
        wrap="nowrap"
        align="center"
        style={{ flex: "0 0 104px", width: 104 }}
      >
        <Box style={{ display: "flex", color: tokens.muted }}>{icon}</Box>
        <Text fz={13} fw={500} c={tokens.muted}>
          {label}
        </Text>
      </Group>
      <Box style={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Group>
  );

  return (
    <Box style={{ borderTop: `1px solid ${tokens.line}`, padding: "14px 0" }}>
      {onClick ? (
        <UnstyledButton
          onClick={onClick}
          aria-haspopup="listbox"
          aria-expanded={expanded ?? undefined}
          style={{ width: "100%", display: "block" }}
        >
          {content}
        </UnstyledButton>
      ) : (
        content
      )}
    </Box>
  );
}
