"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge, Text, ActionIcon, Group, Stack, Tooltip } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import type { OrgFlowNodeType } from "./OrgNode.types";
import { useOrgBuilderStore } from "../../../../../organization.store";
import styles from "../../../OrganizationBuilder.module.css";

const ORG_TYPE_COLORS: Record<string, string> = {
  ministry: "#7c3aed",
  office: "#2563eb",
  department: "#0891b2",
  organization: "#059669",
  branch: "#d97706",
  district: "#dc2626",
};

const STATUS_COLORS: Record<string, string> = {
  active: "teal",
  inactive: "gray",
  archived: "red",
};

export function OrgNode({ data, selected, id }: NodeProps<OrgFlowNodeType>) {
  const [hovered, setHovered] = useState(false);
  const { openEditModal, openAddModal } = useOrgBuilderStore();
  const accent = ORG_TYPE_COLORS[data.orgType] ?? "#2563eb";

  return (
    <div
      className={`${styles.node} ${styles.orgNode} ${selected ? styles.nodeSelected : ""} ${hovered ? styles.nodeHovered : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ "--node-accent": accent } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <div className={styles.nodeHeader} style={{ background: accent + "15", borderBottom: `2px solid ${accent}40` }}>
        <Group gap="xs" wrap="nowrap">
          <div className={styles.nodeIcon} style={{ background: accent + "20", color: accent }}>
            <BuildingsIcon size={16} weight="fill" aria-label="Organization" />
          </div>
          <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
              {data.orgType}
            </Text>
            <Text size="sm" fw={700} lineClamp={1} style={{ color: accent }}>
              {data.name}
            </Text>
          </Stack>
          <Badge size="xs" color={STATUS_COLORS[data.status]} variant="light">
            {data.status}
          </Badge>
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
            <Text size="xs" c="dimmed">
              📍 {data.location}
            </Text>
          )}
          {data.headCount !== undefined && (
            <Text size="xs" c="dimmed">
              👥 {data.headCount} people
            </Text>
          )}
          {data.activeTasks !== undefined && (
            <Text size="xs" c="dimmed">
              ✓ {data.activeTasks} tasks
            </Text>
          )}
        </Group>
      </div>

      {hovered && (
        <div className={styles.nodeActions}>
          <Tooltip label="Add department" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="blue"
              onClick={(e) => { e.stopPropagation(); openAddModal("department"); }}
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
              onClick={(e) => { e.stopPropagation(); openEditModal(id); }}
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
              onClick={(e) => { e.stopPropagation(); }}
              aria-label="Delete organization"
            >
              <TrashIcon size={12} />
            </ActionIcon>
          </Tooltip>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
}
