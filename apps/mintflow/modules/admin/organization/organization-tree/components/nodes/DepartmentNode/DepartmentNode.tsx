"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Badge,
  Text,
  ActionIcon,
  Group,
  Stack,
  Tooltip,
  Divider,
} from "@peppermint/ui";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { CrosshairIcon } from "@phosphor-icons/react/dist/csr/Crosshair";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import type { DepartmentFlowNodeType } from "./DepartmentNode.types";
import { useOrgTreeStore } from "../../../OrganizationTree.store";
import styles from "../../../OrganizationTree.module.css";
import type {
  NodeHealthIssue,
  DescendantStats,
} from "../../../OrganizationTree.types";
import { STATUS_COLORS } from "../../../OrganizationTree.utils";

const DEPT_TYPE_COLORS: Record<string, string> = {
  department: "#2563eb",
  division: "#7c3aed",
  section: "#0891b2",
  unit: "#059669",
  team: "#d97706",
  branch: "#dc2626",
  committee: "#9333ea",
};

export function DepartmentNode({
  data,
  selected,
  id,
}: NodeProps<DepartmentFlowNodeType>) {
  const [hovered, setHovered] = useState(false);
  const {
    openEditModal,
    openAddModal,
    selectNode,
    expandNode,
    collapseNode,
    setFocusedBranch,
    setActiveDepartment,
  } = useOrgTreeStore();
  const accent = data.color ?? DEPT_TYPE_COLORS[data.deptType] ?? "#2563eb";

  const isExpanded = data._expanded as boolean | undefined;
  const counts = data._directChildCounts as
    | { deptCount: number; personCount: number }
    | undefined;
  const descendantStats = data._descendantStats as DescendantStats | undefined;
  const healthIssues =
    (data._healthIssues as NodeHealthIssue[] | undefined) ?? [];
  const isPathHighlight = data._pathHighlighted as boolean | undefined;
  const isDimmed = data._dimmed as boolean | undefined;
  const isSearchMatch = data._searchMatch as boolean | undefined;

  const hasChildren =
    (counts?.deptCount ?? 0) > 0 || (counts?.personCount ?? 0) > 0;
  const deptCount = counts?.deptCount ?? 0;
  const personCount = counts?.personCount ?? 0;
  const totalPeople = descendantStats?.totalPeople ?? 0;
  const hiddenLevels = descendantStats?.hiddenLevels ?? 0;

  return (
    <div
      className={`${styles.node} ${styles.deptNode} ${selected ? styles.nodeSelected : ""} ${hovered ? styles.nodeHovered : ""} ${isPathHighlight ? styles.nodePathHighlight : ""} ${isDimmed ? styles.nodeDimmed : ""} ${isSearchMatch ? styles.nodeSearchMatch : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ "--node-accent": accent } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <div className={styles.nodeHeader}>
        <Group gap="xs" wrap="nowrap">
          <div
            className={styles.nodeIcon}
            style={{ background: accent + "18", color: accent }}
          >
            <FolderIcon size={16} weight="fill" aria-label="Department" />
          </div>
          <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
            <Text
              size="xs"
              fw={500}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: "0.05em", fontSize: 10 }}
            >
              {data.deptType}
            </Text>
            <Text size="sm" fw={700} lineClamp={1}>
              {data.name}
            </Text>
          </Stack>
          <Group gap={4} wrap="nowrap">
            {healthIssues.length > 0 && (
              <div
                className={styles.healthDot}
                aria-label="Has structure issues"
              >
                <WarningIcon size={10} color="var(--mantine-color-orange-7)" />
              </div>
            )}
            <Badge size="xs" color={STATUS_COLORS[data.status]} variant="dot">
              {data.status}
            </Badge>
          </Group>
        </Group>
      </div>

      <div className={styles.nodeBody}>
        {data.head && (
          <Group gap="xs" mb={4}>
            <Text size="xs" c="dimmed">
              Head:
            </Text>
            <Text size="xs" fw={500} lineClamp={1}>
              {data.head}
            </Text>
          </Group>
        )}
        {data.parentName && (
          <Group gap="xs" mb={4}>
            <Text size="xs" c="dimmed">
              Under:
            </Text>
            <Text size="xs" fw={500} lineClamp={1}>
              {data.parentName}
            </Text>
          </Group>
        )}
        <Divider my={6} />
        <Group gap="md" justify="space-between">
          <Stack gap={2} align="center">
            <Text size="xs" fw={700} c={accent}>
              {data.peopleCount ?? 0}
            </Text>
            <Text size="xs" c="dimmed">
              Direct
            </Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text size="xs" fw={700} c="orange">
              {data.activeTasks ?? 0}
            </Text>
            <Text size="xs" c="dimmed">
              Active
            </Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text size="xs" fw={700} c="teal">
              {data.completedTasks ?? 0}
            </Text>
            <Text size="xs" c="dimmed">
              Done
            </Text>
          </Stack>
        </Group>
      </div>

      {hasChildren && (
        <div className={styles.nodeExpandStrip}>
          <Group gap={4} style={{ flex: 1 }} wrap="nowrap">
            {deptCount > 0 && (
              <Text size="xs" c="dimmed">
                {deptCount} sub-unit{deptCount !== 1 ? "s" : ""}
              </Text>
            )}
            {personCount > 0 && (
              <Text size="xs" c="dimmed">
                {deptCount > 0 ? "· " : ""}
                {personCount} staff
              </Text>
            )}
            {!isExpanded && totalPeople > (data.peopleCount ?? 0) && (
              <Text size="xs" c="dimmed">
                · {totalPeople} total
              </Text>
            )}
            {!isExpanded && hiddenLevels > 0 && (
              <Text size="xs" c="dimmed">
                · {hiddenLevels} level{hiddenLevels !== 1 ? "s" : ""} deep
              </Text>
            )}
          </Group>
          <ActionIcon
            size="xs"
            variant="subtle"
            color={isExpanded ? "gray" : "violet"}
            onClick={(e) => {
              e.stopPropagation();
              isExpanded ? collapseNode(id) : expandNode(id);
            }}
            aria-label={isExpanded ? "Collapse children" : "Expand children"}
          >
            {isExpanded ? (
              <CaretUpIcon size={12} />
            ) : (
              <CaretDownIcon size={12} />
            )}
          </ActionIcon>
        </div>
      )}

      {hovered && (
        <div className={styles.nodeActions}>
          <Tooltip label="Focus this branch" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="indigo"
              onClick={(e) => {
                e.stopPropagation();
                setFocusedBranch(id);
              }}
              aria-label="Focus this branch"
            >
              <CrosshairIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Open details" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                selectNode(id);
              }}
              aria-label="Open details"
            >
              <ArrowSquareOutIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add child department" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="violet"
              onClick={(e) => {
                e.stopPropagation();
                openAddModal("department", id, data.name);
              }}
              aria-label="Add child department"
            >
              <PlusIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add person" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="teal"
              onClick={(e) => {
                e.stopPropagation();
                setActiveDepartment(id);
                openAddModal("person", id, data.name);
              }}
              aria-label="Add person"
            >
              <UserPlusIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="gray"
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(id);
              }}
              aria-label="Edit department"
            >
              <PencilSimpleIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="red"
              onClick={(e) => e.stopPropagation()}
              aria-label="Delete department"
            >
              <TrashIcon size={12} />
            </ActionIcon>
          </Tooltip>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
      />
    </div>
  );
}
