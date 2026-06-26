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
  Avatar,
} from "@peppermint/ui";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { UserSwitchIcon } from "@phosphor-icons/react/dist/csr/UserSwitch";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import type { PersonFlowNodeType } from "./PersonNode.types";
import { useOrgTreeStore } from "../../../OrganizationTree.store";
import styles from "../../../OrganizationTree.module.css";
import type {
  NodeHealthIssue,
  DescendantStats,
} from "../../../OrganizationTree.types";
import { STATUS_COLORS, getInitials } from "../../../OrganizationTree.utils";

const ROLE_COLORS: Record<string, string> = {
  head: "violet",
  manager: "blue",
  coordinator: "teal",
  officer: "cyan",
  member: "gray",
  advisor: "orange",
  minister: "violet",
  secretary: "blue",
  joint_secretary: "indigo",
  under_secretary: "cyan",
  section_officer: "teal",
  assistant: "gray",
};

export function PersonNode({
  data,
  selected,
  id,
}: NodeProps<PersonFlowNodeType>) {
  const [hovered, setHovered] = useState(false);
  const { openEditModal, openAddModal, selectNode, expandNode, collapseNode } =
    useOrgTreeStore();

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

  const directReports = counts?.personCount ?? 0;
  const totalBelow = descendantStats?.totalPeople ?? 0;

  return (
    <div
      className={`${styles.node} ${styles.personNode} ${selected ? styles.nodeSelected : ""} ${hovered ? styles.nodeHovered : ""} ${isPathHighlight ? styles.nodePathHighlight : ""} ${isDimmed ? styles.nodeDimmed : ""} ${isSearchMatch ? styles.nodeSearchMatch : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <div className={styles.nodeBody} style={{ padding: "12px 14px" }}>
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <Avatar
            src={data.avatarUrl}
            color={data.status === "inactive" ? "gray" : "teal"}
            radius="xl"
            size="md"
            alt={data.fullName}
          >
            {getInitials(data.fullName)}
          </Avatar>
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Group gap={6} wrap="nowrap" justify="space-between">
              <Text
                size="sm"
                fw={700}
                lineClamp={1}
                c={data.status === "inactive" ? "dimmed" : undefined}
              >
                {data.fullName}
              </Text>
              <Group gap={4} wrap="nowrap">
                {healthIssues.length > 0 && (
                  <div
                    className={styles.healthDot}
                    aria-label="Has structure issues"
                  >
                    <WarningIcon
                      size={10}
                      color="var(--mantine-color-orange-7)"
                    />
                  </div>
                )}
                <Badge
                  size="xs"
                  color={STATUS_COLORS[data.status]}
                  variant="dot"
                />
              </Group>
            </Group>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {data.designation}
            </Text>
            {data.department && (
              <Text size="xs" c="dimmed" lineClamp={1} style={{ fontSize: 11 }}>
                {data.department}
              </Text>
            )}
            {data.role && (
              <Badge
                size="xs"
                color={ROLE_COLORS[data.role] ?? "gray"}
                variant="light"
                mt={2}
              >
                {data.role.replace(/_/g, " ")}
              </Badge>
            )}
            {/* Direct reports metadata */}
            {directReports > 0 && (
              <Text size="xs" c="dimmed" style={{ fontSize: 11 }} mt={2}>
                {directReports} direct report{directReports !== 1 ? "s" : ""}
                {totalBelow > directReports
                  ? ` · ${totalBelow} total below`
                  : ""}
              </Text>
            )}
          </Stack>
        </Group>
      </div>

      {/* Expand strip for person chains */}
      {hasChildren && (
        <div className={styles.nodeExpandStrip}>
          <Group gap={4} style={{ flex: 1 }} wrap="nowrap">
            {directReports > 0 && (
              <Text size="xs" c="dimmed">
                {directReports} report{directReports !== 1 ? "s" : ""}
              </Text>
            )}
            {(descendantStats?.totalPeople ?? 0) > 0 &&
              directReports !== descendantStats?.totalPeople && (
                <Text size="xs" c="dimmed">
                  · {descendantStats!.totalPeople} below
                </Text>
              )}
          </Group>
          <ActionIcon
            size="xs"
            variant="subtle"
            color={isExpanded ? "gray" : "teal"}
            onClick={(e) => {
              e.stopPropagation();
              isExpanded ? collapseNode(id) : expandNode(id);
            }}
            aria-label={isExpanded ? "Collapse reports" : "Expand reports"}
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
          <Tooltip label="View profile" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="teal"
              onClick={(e) => {
                e.stopPropagation();
                selectNode(id);
              }}
              aria-label="View profile"
            >
              <ArrowSquareOutIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delegate" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="violet"
              onClick={(e) => {
                e.stopPropagation();
                openAddModal("delegation", undefined, data.fullName, id);
              }}
              aria-label="Delegate person"
            >
              <UserSwitchIcon size={12} />
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
              aria-label="Edit person"
            >
              <PencilSimpleIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Remove" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="red"
              onClick={(e) => e.stopPropagation()}
              aria-label="Remove person"
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
