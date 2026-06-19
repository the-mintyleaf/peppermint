"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge, Text, ActionIcon, Group, Stack, Tooltip, Divider } from "@peppermint/ui";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import type { DepartmentFlowNodeType } from "./DepartmentNode.types";
import { useOrgBuilderStore } from "../../../../../organization.store";
import styles from "../../../OrganizationBuilder.module.css";

const DEPT_TYPE_COLORS: Record<string, string> = {
  department: "#2563eb",
  division: "#7c3aed",
  section: "#0891b2",
  unit: "#059669",
  team: "#d97706",
  branch: "#dc2626",
  committee: "#9333ea",
};

const STATUS_COLORS: Record<string, string> = {
  active: "teal",
  inactive: "gray",
  archived: "red",
};

export function DepartmentNode({ data, selected, id }: NodeProps<DepartmentFlowNodeType>) {
  const [hovered, setHovered] = useState(false);
  const { openEditModal, openAddModal, selectNode } = useOrgBuilderStore();
  const accent = data.color ?? DEPT_TYPE_COLORS[data.deptType] ?? "#2563eb";

  return (
    <div
      className={`${styles.node} ${styles.deptNode} ${selected ? styles.nodeSelected : ""} ${hovered ? styles.nodeHovered : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ "--node-accent": accent } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <Handle type="target" position={Position.Left} id="left-target" className={styles.handle} />

      <div className={styles.nodeHeader}>
        <Group gap="xs" wrap="nowrap">
          <div className={styles.nodeIcon} style={{ background: accent + "18", color: accent }}>
            <FolderIcon size={16} weight="fill" aria-label="Department" />
          </div>
          <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em", fontSize: 10 }}>
              {data.deptType}
            </Text>
            <Text size="sm" fw={700} lineClamp={1}>
              {data.name}
            </Text>
          </Stack>
          <Badge size="xs" color={STATUS_COLORS[data.status]} variant="dot">
            {data.status}
          </Badge>
        </Group>
      </div>

      <div className={styles.nodeBody}>
        {data.head && (
          <Group gap="xs" mb={6}>
            <Text size="xs" c="dimmed">Head:</Text>
            <Text size="xs" fw={500}>{data.head}</Text>
          </Group>
        )}
        {data.parentName && (
          <Group gap="xs" mb={6}>
            <Text size="xs" c="dimmed">Under:</Text>
            <Text size="xs" fw={500} lineClamp={1}>{data.parentName}</Text>
          </Group>
        )}

        <Divider my={6} />

        <Group gap="md" justify="space-between">
          <Stack gap={2} align="center">
            <Text size="xs" fw={700} c={accent}>{data.peopleCount ?? 0}</Text>
            <Text size="xs" c="dimmed">People</Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text size="xs" fw={700} c="orange">{data.activeTasks ?? 0}</Text>
            <Text size="xs" c="dimmed">Active</Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text size="xs" fw={700} c="teal">{data.completedTasks ?? 0}</Text>
            <Text size="xs" c="dimmed">Done</Text>
          </Stack>
        </Group>
      </div>

      {hovered && (
        <div className={styles.nodeActions}>
          <Tooltip label="Open details" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="blue"
              onClick={(e) => { e.stopPropagation(); selectNode(id); }}
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
              onClick={(e) => { e.stopPropagation(); openAddModal("department"); }}
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
              onClick={(e) => { e.stopPropagation(); openAddModal("person"); }}
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
              onClick={(e) => { e.stopPropagation(); openEditModal(id); }}
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
              onClick={(e) => { e.stopPropagation(); }}
              aria-label="Delete department"
            >
              <TrashIcon size={12} />
            </ActionIcon>
          </Tooltip>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className={styles.handle} />
      <Handle type="source" position={Position.Right} id="right-source" className={styles.handle} />
    </div>
  );
}
