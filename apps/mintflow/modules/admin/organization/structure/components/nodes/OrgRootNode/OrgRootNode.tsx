"use client";

import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { CrosshairIcon } from "@phosphor-icons/react/dist/csr/Crosshair";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { BilingualName } from "../../../../_shared/components/BilingualName";
import { useStructureStore } from "../../../Structure.store";
import styles from "../../../Structure.module.css";
import type { OrgRootNodeProps } from "./OrgRootNode.types";
import type { OrgRootNodeData } from "../../../Structure.types";

export function OrgRootNode({ data, selected, id }: OrgRootNodeProps) {
  const [hovered, setHovered] = useState(false);
  const rootData = data as OrgRootNodeData;
  const {
    expandedUnitIds,
    expandUnit,
    collapseUnit,
    setFocusedBranch,
    openAddUnitModal,
  } = useStructureStore();
  const isExpanded = expandedUnitIds.includes(id);

  return (
    <div
      className={`${styles.node} ${styles.orgNode} ${selected ? styles.nodeSelected : ""} ${hovered ? styles.nodeHovered : ""} ${rootData._dimmed ? styles.nodeDimmed : ""} ${rootData._pathHighlighted ? styles.nodePathHighlight : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.nodeHeader}>
        <Group gap="xs" wrap="nowrap">
          <div className={styles.nodeIcon}>
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
              {rootData.organizationType}
            </Text>
            <BilingualName
              np={rootData.name_np}
              en={rootData.name_en}
              size="sm"
              fw={700}
            />
          </Stack>
          <Badge size="xs">{rootData.status}</Badge>
        </Group>
      </div>

      <div className={styles.nodeExpandStrip}>
        <Text size="xs" c="dimmed" style={{ flex: 1 }}>
          {rootData.descendantCount !== undefined
            ? `${rootData.descendantCount.toLocaleString()} units`
            : "Root of the unit tree"}
        </Text>
        <ActionIcon
          size="xs"
          variant="subtle"
          onClick={(e) => {
            e.stopPropagation();
            if (isExpanded) collapseUnit(id);
            else expandUnit(id);
          }}
          aria-label={isExpanded ? "Collapse tree" : "Expand tree"}
        >
          {isExpanded ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
        </ActionIcon>
      </div>

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
          <Tooltip label="Create root unit" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                openAddUnitModal(undefined, undefined);
              }}
              aria-label="Create root unit"
            >
              <PlusIcon size={12} />
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
