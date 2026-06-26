"use client";

import { Text } from "@peppermint/ui";
import { formatRelative } from "@peppermint/utils";

interface DataTableShellEditedLabelProps {
  date?: string | Date;
}

export function DataTableShellEditedLabel({
  date,
}: DataTableShellEditedLabelProps) {
  if (!date) return null;

  return (
    <Text
      size="xs"
      c="dimmed"
      visibleFrom="sm"
      style={{ whiteSpace: "nowrap" }}
    >
      Edited {formatRelative(date)}
    </Text>
  );
}
