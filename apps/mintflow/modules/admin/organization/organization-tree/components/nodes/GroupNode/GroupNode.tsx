"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Badge, Text, ActionIcon, Group, Stack, Tooltip } from "@peppermint/ui";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { ArrowsOutIcon } from "@phosphor-icons/react/dist/csr/ArrowsOut";
import type { GroupFlowNodeType } from "./GroupNode.types";
import { useOrgTreeStore } from "../../../OrganizationTree.store";
import styles from "../../../OrganizationTree.module.css";

export function GroupNode({ data, selected, id }: NodeProps<GroupFlowNodeType>) {
  const [hovered, setHovered] = useState(false);
  const { expandGroup, selectNode } = useOrgTreeStore();
  const isPathHighlight = data._pathHighlighted as boolean | undefined;
  const isDimmed = data._dimmed as boolean | undefined;

  const accent = data.groupCategory === "person" ? "#059669" : "#7c3aed";

  return (
    <div
      className={`${styles.node} ${styles.groupNode} ${selected ? styles.nodeSelected : ""} ${hovered ? styles.nodeHovered : ""} ${isPathHighlight ? styles.nodePathHighlight : ""} ${isDimmed ? styles.nodeDimmed : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ "--node-accent": accent } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <div className={styles.nodeHeader} style={{ background: accent + "12", borderBottom: `2px dashed ${accent}40` }}>
        <Group gap="xs" wrap="nowrap">
          <div className={styles.nodeIcon} style={{ background: accent + "18", color: accent }}>
            <StackIcon size={16} weight="fill" aria-label="Group" />
          </div>
          <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em", fontSize: 10 }}>
              {data.groupCategory === "person" ? "group · people" : "group · offices"}
            </Text>
            <Text size="sm" fw={700} lineClamp={1} style={{ color: accent }}>
              {data.name}
            </Text>
          </Stack>
          <Badge size="sm" color={data.groupCategory === "person" ? "teal" : "violet"} variant="light">
            {data.memberCount}
          </Badge>
        </Group>
      </div>

      <div className={styles.nodeBody} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Text size="xs" c="dimmed">
          {data.memberCount} {data.groupCategory === "person" ? "people" : "offices"} grouped here
        </Text>
        <Group gap="xs">
          <Tooltip label="View members as list" position="top" withArrow>
            <ActionIcon
              size="sm"
              variant="light"
              color={data.groupCategory === "person" ? "teal" : "violet"}
              onClick={(e) => {
                e.stopPropagation();
                selectNode(id);
              }}
              aria-label="View list"
            >
              <ListIcon size={13} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Expand group on canvas" position="top" withArrow>
            <ActionIcon
              size="sm"
              variant="filled"
              color={data.groupCategory === "person" ? "teal" : "violet"}
              onClick={(e) => {
                e.stopPropagation();
                const storeNodes = useOrgTreeStore.getState();
                // Trigger group expansion — get all nodes from the hook's context
                // expandGroup is called with current nodes via the store
                storeNodes.expandGroup(id, []);
                // Also expand this node to reveal members
                storeNodes.expandNode(id);
              }}
              aria-label="Expand group"
            >
              <ArrowsOutIcon size={13} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </div>

      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
}
