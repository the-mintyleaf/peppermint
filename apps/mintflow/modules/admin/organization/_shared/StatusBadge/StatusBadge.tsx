"use client";

import { Badge } from "@peppermint/ui";
import {
  ASSIGNMENT_STATUS_COLORS,
  ASSIGNMENT_STATUS_LABELS,
  DELEGATION_STATUS_COLORS,
  DELEGATION_STATUS_LABELS,
  MEMBERSHIP_STATUS_COLORS,
  MEMBERSHIP_STATUS_LABELS,
  ORG_EVENT_TYPE_LABELS,
  ORGANIZATION_STATUS_COLORS,
  ORGANIZATION_STATUS_LABELS,
  POSITION_STATUS_COLORS,
  POSITION_STATUS_LABELS,
  UNIT_STATUS_COLORS,
  UNIT_STATUS_LABELS,
} from "../../organization.constants";
import type { StatusBadgeProps } from "./StatusBadge.types";

const ALL_LABELS: Record<string, string> = {
  ...ORGANIZATION_STATUS_LABELS,
  ...UNIT_STATUS_LABELS,
  ...POSITION_STATUS_LABELS,
  ...MEMBERSHIP_STATUS_LABELS,
  ...ASSIGNMENT_STATUS_LABELS,
  ...DELEGATION_STATUS_LABELS,
  ...ORG_EVENT_TYPE_LABELS,
};

const ALL_COLORS: Record<string, string> = {
  ...ORGANIZATION_STATUS_COLORS,
  ...UNIT_STATUS_COLORS,
  ...POSITION_STATUS_COLORS,
  ...MEMBERSHIP_STATUS_COLORS,
  ...ASSIGNMENT_STATUS_COLORS,
  ...DELEGATION_STATUS_COLORS,
};

export function StatusBadge({ status, label, size = "sm" }: StatusBadgeProps) {
  const displayLabel = label ?? ALL_LABELS[status] ?? status;
  const color = ALL_COLORS[status] ?? "gray";

  return (
    <Badge color={color} size={size} variant="light">
      {displayLabel}
    </Badge>
  );
}
