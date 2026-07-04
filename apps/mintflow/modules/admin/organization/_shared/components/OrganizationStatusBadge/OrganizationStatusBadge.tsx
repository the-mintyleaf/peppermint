"use client";

import { Badge } from "@peppermint/ui";

import type { OrganizationStatus } from "../../organization.types";
import type { OrganizationStatusBadgeProps } from "./OrganizationStatusBadge.types";

const STATUS_COLORS: Record<OrganizationStatus, string> = {
  draft: "gray",
  active: "green",
  inactive: "yellow",
  suspended: "orange",
  archived: "dark",
};

export function OrganizationStatusBadge({
  status,
  size = "xs",
}: OrganizationStatusBadgeProps) {
  return (
    <Badge size={size} color={STATUS_COLORS[status]}>
      {status}
    </Badge>
  );
}
