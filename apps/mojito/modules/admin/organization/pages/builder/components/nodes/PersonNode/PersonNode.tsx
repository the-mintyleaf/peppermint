"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge, Text, ActionIcon, Group, Stack, Tooltip, Avatar } from "@peppermint/ui";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import type { PersonFlowNodeType } from "./PersonNode.types";
import { useOrgBuilderStore } from "../../../../../organization.store";
import styles from "../../../OrganizationBuilder.module.css";

const ROLE_COLORS: Record<string, string> = {
  head: "violet",
  manager: "blue",
  coordinator: "teal",
  officer: "cyan",
  member: "gray",
  advisor: "orange",
};

const STATUS_COLORS: Record<string, string> = {
  active: "teal",
  inactive: "gray",
  archived: "red",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function PersonNode({ data, selected, id }: NodeProps<PersonFlowNodeType>) {
  const [hovered, setHovered] = useState(false);
  const { openEditModal, selectNode } = useOrgBuilderStore();

  return (
    <div
      className={`${styles.node} ${styles.personNode} ${selected ? styles.nodeSelected : ""} ${hovered ? styles.nodeHovered : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <Handle type="target" position={Position.Left} id="left-target" className={styles.handle} />

      <div className={styles.nodeBody} style={{ padding: "12px 14px" }}>
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <Avatar
            src={data.avatarUrl}
            color="teal"
            radius="xl"
            size="md"
            alt={data.fullName}
          >
            {getInitials(data.fullName)}
          </Avatar>

          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Group gap={6} wrap="nowrap" justify="space-between">
              <Text size="sm" fw={700} lineClamp={1}>
                {data.fullName}
              </Text>
              <Badge size="xs" color={STATUS_COLORS[data.status]} variant="dot" />
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
              <Badge size="xs" color={ROLE_COLORS[data.role] ?? "gray"} variant="light" mt={2}>
                {data.role}
              </Badge>
            )}
          </Stack>
        </Group>

        {data.activeTasks !== undefined && data.activeTasks > 0 && (
          <Group gap="xs" mt={8}>
            <Text size="xs" c="dimmed">
              ✓ {data.activeTasks} active task{data.activeTasks !== 1 ? "s" : ""}
            </Text>
          </Group>
        )}
      </div>

      {hovered && (
        <div className={styles.nodeActions}>
          <Tooltip label="View profile" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="teal"
              onClick={(e) => { e.stopPropagation(); selectNode(id); }}
              aria-label="View profile"
            >
              <ArrowSquareOutIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="gray"
              onClick={(e) => { e.stopPropagation(); openEditModal(id); }}
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
              onClick={(e) => { e.stopPropagation(); }}
              aria-label="Remove person"
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
