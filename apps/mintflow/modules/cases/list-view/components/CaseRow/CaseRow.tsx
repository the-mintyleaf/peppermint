"use client";

import { ActionIcon, Avatar, Badge, Group, Menu, Text } from "@peppermint/ui";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";

import {
  actorInitials,
  actorLabel,
  avatarColorForId,
  formatGregorian,
  resolveTitle,
  unitLabel,
  WORK_PRIORITY_LABEL,
  WORK_STATUS_LABEL,
} from "@/lib/work";
import { StatusPill } from "@/components";
import { PRIORITY_STYLE, STATUS_STYLE } from "../../../cases.styles";
import { notConnected } from "../../../Cases.hooks";
import type { CaseRowProps } from "./CaseRow.types";
import classes from "../../ListView.module.css";

export function CaseRow({ workCase, onOpen, actorDir, unitDir }: CaseRowProps) {
  const status = STATUS_STYLE[workCase.status];
  const priority = PRIORITY_STYLE[workCase.priority];
  const title = resolveTitle(workCase);
  const ownerName = actorLabel(workCase.current_owner, actorDir);
  const unit = unitLabel(workCase.responsible_unit, unitDir);

  return (
    <div
      className={`${classes.caseGrid} ${classes.row}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(workCase)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(workCase);
        }
      }}
    >
      {/* Identity */}
      <div className={classes.identity}>
        <div className={classes.identityText}>
          <div className={classes.caseNumber}>{workCase.reference_number}</div>
          <div className={classes.nameText}>{title}</div>
        </div>
      </div>

      {/* Status */}
      <StatusPill fg={status.fg} bg={status.bg} dot>
        {WORK_STATUS_LABEL[workCase.status]}
      </StatusPill>

      {/* Priority */}
      <div>
        <Badge color={priority.color} variant="light" size="sm" radius="sm">
          {WORK_PRIORITY_LABEL[workCase.priority]}
        </Badge>
      </div>

      {/* Responsible unit */}
      <Group gap={5} wrap="nowrap" style={{ minWidth: 0 }}>
        <Text className={classes.metaText}>{unit}</Text>
      </Group>

      {/* Accountable owner */}
      <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
        <Avatar
          size={22}
          radius="xl"
          color={avatarColorForId(workCase.current_owner)}
        >
          {actorInitials(workCase.current_owner, actorDir)}
        </Avatar>
        <Text className={classes.metaText}>{ownerName}</Text>
      </Group>

      {/* Due date */}
      <span className={classes.mono}>
        {formatGregorian(workCase.due_at) || "—"}
      </span>

      {/* Actions */}
      <div className={classes.actionCell}>
        <Menu shadow="sm" width={170} position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={`${workCase.reference_number} actions`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <DotsThreeIcon size={18} weight="bold" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
            <Menu.Item onClick={() => onOpen(workCase)}>Open case</Menu.Item>
            <Menu.Item onClick={notConnected}>Assign</Menu.Item>
            <Menu.Item onClick={notConnected}>Start</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}
