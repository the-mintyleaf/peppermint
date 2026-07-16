"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Group,
  Menu,
  Progress,
  Text,
} from "@peppermint/ui";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";

import { CaseIcon, MonoText, StatusPill } from "@/components";
import {
  CATEGORY_STYLE,
  PRIORITY_STYLE,
  STATUS_STYLE,
  caseProgress,
} from "../../../module.api";
import { formatDate } from "../../../Cases.hooks";
import type { CaseRowProps } from "./CaseRow.types";
import classes from "../../ListView.module.css";

export function CaseRow({ workCase, onOpen }: CaseRowProps) {
  const category = CATEGORY_STYLE[workCase.category];
  const status = STATUS_STYLE[workCase.status];
  const priority = PRIORITY_STYLE[workCase.priority];
  const { done, total, pct } = caseProgress(workCase);
  const extraDepartments = workCase.departments.length - 1;

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
        <CaseIcon
          kind={category.icon}
          color={category.color}
          tint={category.tint}
          size={32}
          radius={9}
          iconSize={16}
        />
        <div className={classes.identityText}>
          <div className={classes.caseNumber}>{workCase.caseNumber}</div>
          <div className={classes.nameText}>{workCase.title}</div>
        </div>
      </div>

      {/* Status */}
      <StatusPill fg={status.fg} bg={status.bg} dot>
        {status.label}
      </StatusPill>

      {/* Priority */}
      <div>
        <Badge color={priority.color} variant="light" size="sm" radius="sm">
          {priority.label}
        </Badge>
      </div>

      {/* Progress */}
      <div>
        <MonoText fz="10px" c="var(--mantine-color-gray-6)" mb={4}>
          {done}/{total}
        </MonoText>
        <Progress
          value={pct}
          color={pct === 100 ? "green" : "accent"}
          size="xs"
          radius="xl"
          aria-label={`${done} of ${total} tasks complete`}
        />
      </div>

      {/* Departments */}
      <Group gap={5} wrap="nowrap" style={{ minWidth: 0 }}>
        <Text className={classes.metaText}>{workCase.departments[0]}</Text>
        {extraDepartments > 0 && (
          <StatusPill fg="var(--mantine-color-gray-6)" bg="rgba(0,0,0,0.05)">
            +{extraDepartments}
          </StatusPill>
        )}
      </Group>

      {/* Officers */}
      <Avatar.Group spacing="sm">
        {workCase.officers.slice(0, 3).map((o) => (
          <Avatar key={o.id} size={22} radius="xl" color={o.color}>
            {o.initials}
          </Avatar>
        ))}
        {workCase.officers.length > 3 && (
          <Avatar size={22} radius="xl" color="gray">
            +{workCase.officers.length - 3}
          </Avatar>
        )}
      </Avatar.Group>

      {/* Due date */}
      <span className={classes.mono}>{formatDate(workCase.dueDate)}</span>

      {/* Actions */}
      <div className={classes.actionCell}>
        <Menu shadow="sm" width={170} position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={`${workCase.caseNumber} actions`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <DotsThreeIcon size={18} weight="bold" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
            <Menu.Item onClick={() => onOpen(workCase)}>Open case</Menu.Item>
            <Menu.Item>Assign officer</Menu.Item>
            <Menu.Item>Change status</Menu.Item>
            <Menu.Item color="red">Close case</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}
