"use client";

import { Badge } from "@peppermint/ui";

import type { MembershipStatus } from "../../organization.types";
import type { MembershipStatusBadgeProps } from "./MembershipStatusBadge.types";

const STATUS_COLORS: Record<MembershipStatus, string> = {
  invited: "gray",
  active: "green",
  inactive: "yellow",
  suspended: "orange",
  transferred: "blue",
  ended: "red",
  archived: "dark",
};

export function MembershipStatusBadge({
  status,
  size = "xs",
}: MembershipStatusBadgeProps) {
  return (
    <Badge size={size} color={STATUS_COLORS[status]}>
      {status}
    </Badge>
  );
}
