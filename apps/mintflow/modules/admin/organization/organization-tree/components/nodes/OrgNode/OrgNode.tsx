"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge, Text, ActionIcon, Group, Stack, Tooltip } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { CrosshairIcon } from "@phosphor-icons/react/dist/csr/Crosshair";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import type { OrgFlowNodeType } from "./OrgNode.types";
import { useOrgTreeStore } from "../../../OrganizationTree.store";
import styles from "../../../OrganizationTree.module.css";
import type {
  NodeHealthIssue,
  DescendantStats,
} from "../../../OrganizationTree.types";
import { STATUS_COLORS } from "../../../OrganizationTree.utils";

const ORG_TYPE_COLORS: Record<string, string> = {
  ministry: "#7c3aed",
  office: "#2563eb",
  department: "#0891b2",
  organization: "#059669",
  branch: "#d97706",
  district: "#dc2626",
};

export function OrgNode({ data, selected, id }: NodeProps<OrgFlowNodeType>) {
  const [hovered, setHovered] = useState(false);
  const {
    openEditModal,
    openAddModal,
    expandNode,
    collapseNode,
    setFocusedBranch,
  } = useOrgTreeStore();
  const accent = ORG_TYPE_COLORS[data.orgType] ?? "#2563eb";

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
  const totalDepts = descendantStats?.totalDepts ?? 0;
  const hiddenLevels = descendantStats?.hiddenLevels ?? 0;

  return (
    <div
      className={`${styles.node} ${styles.orgNode} ${selected ? styles.nodeSelected : ""} ${hovered ? styles.nodeHovered : ""} ${isPathHighlight ? styles.nodePathHighlight : ""} ${isDimmed ? styles.nodeDimmed : ""} ${isSearchMatch ? styles.nodeSearchMatch : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ "--node-accent": accent } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <div
        className={styles.nodeHeader}
        style={{
          background: accent + "15",
          borderBottom: `2px solid ${accent}40`,
        }}
      >
        <Group gap="xs" wrap="nowrap">
          <div
            className={styles.nodeIcon}
            style={{ background: accent + "20", color: accent }}
          >
            <BuildingsIcon size={16} weight="fill" aria-label="Organization" />
          </div>
          <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              {data.orgType}
            </Text>
            <Text size="sm" fw={700} lineClamp={1} style={{ color: accent }}>
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
            <Badge size="xs" color={STATUS_COLORS[data.status]} variant="light">
              {data.status}
            </Badge>
          </Group>
        </Group>
      </div>

      <div className={styles.nodeBody}>
        {data.description && (
          <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
            {data.description}
          </Text>
        )}
        <Group gap="xs" wrap="wrap">
          {data.location && (
            <Group gap={4} wrap="nowrap">
              <MapPinIcon
                size={11}
                color="var(--mantine-color-dimmed)"
                aria-label="Location"
              />
              <Text size="xs" c="dimmed">
                {data.location}
              </Text>
            </Group>
          )}
          {totalPeople > 0 && (
            <Group gap={4} wrap="nowrap">
              <UsersIcon
                size={11}
                color="var(--mantine-color-dimmed)"
                aria-label="People"
              />
              <Text size="xs" c="dimmed">
                {totalPeople} people
              </Text>
            </Group>
          )}
        </Group>
      </div>

      {hasChildren && (
        <div className={styles.nodeExpandStrip}>
          <Group gap={4} style={{ flex: 1 }} wrap="nowrap">
            {deptCount > 0 && (
              <Text size="xs" c="dimmed">
                {deptCount} unit{deptCount !== 1 ? "s" : ""}
              </Text>
            )}
            {personCount > 0 && (
              <Text size="xs" c="dimmed">
                {personCount > 0 && deptCount > 0 ? "· " : ""}
                {personCount} staff
              </Text>
            )}
            {!isExpanded && totalDepts > deptCount && (
              <Text size="xs" c="dimmed">
                · {totalDepts} total
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
            color={isExpanded ? "gray" : "blue"}
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
          <Tooltip label="Add department" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                openAddModal("department", id, data.name);
              }}
              aria-label="Add department"
            >
              <PlusIcon size={12} />
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
              aria-label="Edit organization"
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
              aria-label="Delete organization"
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
