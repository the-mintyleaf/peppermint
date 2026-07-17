"use client";

import type { ReactNode } from "react";
import { Group, Menu, UnstyledButton } from "@peppermint/ui";
import { StatusBadge } from "@peppermint/admin";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { PauseCircleIcon } from "@phosphor-icons/react/dist/csr/PauseCircle";
import { PlayCircleIcon } from "@phosphor-icons/react/dist/csr/PlayCircle";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import type { AccountStatus } from "@/modules/admin/authenticate/_shared/authenticate.types";
import { useUserLifecycleActions } from "../useUserLifecycleActions";
import type { UserStatusCellProps } from "./UserStatusCell.types";

const STATUS_COLORS: Partial<Record<AccountStatus, string>> = {
  active: "teal",
  suspended: "orange",
  deactivated: "gray",
};

const STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  deactivated: "Deactivated",
};

interface Transition {
  label: string;
  icon: ReactNode;
  color?: string;
  onClick: () => void;
}

/**
 * The account-status cell. Renders the status badge and — when the current admin
 * can move the account to another state — a caret that opens the valid
 * transitions, reusing the same guarded mutations as the row-action menu. Falls
 * back to a plain, non-interactive badge when no transition is allowed.
 */
export function UserStatusCell({
  user,
  currentUserId,
  isSuperadmin,
}: UserStatusCellProps) {
  const lifecycle = useUserLifecycleActions(user, {
    currentUserId,
    isSuperadmin,
  });
  const { status, isSelf, canLifecycle, canSuspend } = lifecycle;

  const badge = (
    <StatusBadge<AccountStatus>
      value={status}
      colorMap={STATUS_COLORS}
      labelMap={STATUS_LABELS}
    />
  );

  const transitions: Transition[] = [];
  if (status === "active") {
    if (canSuspend && !isSelf)
      transitions.push({
        label: "Suspend",
        icon: <PauseCircleIcon size={16} aria-hidden />,
        color: "orange",
        onClick: lifecycle.openSuspend,
      });
    if (canLifecycle && !isSelf)
      transitions.push({
        label: "Deactivate",
        icon: <ProhibitIcon size={16} aria-hidden />,
        color: "red",
        onClick: lifecycle.openDeactivate,
      });
  } else if (status === "suspended") {
    if (canSuspend)
      transitions.push({
        label: "Unsuspend",
        icon: <PlayCircleIcon size={16} aria-hidden />,
        onClick: lifecycle.unsuspend,
      });
    if (canLifecycle && !isSelf)
      transitions.push({
        label: "Deactivate",
        icon: <ProhibitIcon size={16} aria-hidden />,
        color: "red",
        onClick: lifecycle.openDeactivate,
      });
  } else if (status === "deactivated") {
    if (canLifecycle)
      transitions.push({
        label: "Reactivate",
        icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
        onClick: lifecycle.reactivate,
      });
  }

  if (transitions.length === 0) return badge;

  return (
    <Menu position="bottom-start" withinPortal>
      <Menu.Target>
        <UnstyledButton aria-label={`Change status for ${user.username}`}>
          <Group gap={4} wrap="nowrap">
            {badge}
            <CaretDownIcon size={12} aria-hidden />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Change status</Menu.Label>
        {transitions.map((t) => (
          <Menu.Item
            key={t.label}
            leftSection={t.icon}
            color={t.color}
            onClick={t.onClick}
          >
            {t.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
