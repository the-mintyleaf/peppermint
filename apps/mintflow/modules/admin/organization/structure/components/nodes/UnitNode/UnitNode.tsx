"use client";

import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  ActionIcon,
  Badge,
  Group,
  Loader,
  Stack,
  Text,
  Tooltip,
} from "@peppermint/ui";
import { ArrowsOutCardinalIcon } from "@phosphor-icons/react/dist/csr/ArrowsOutCardinal";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { CrosshairIcon } from "@phosphor-icons/react/dist/csr/Crosshair";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";

import { BilingualName } from "../../../../_shared/components/BilingualName";
import type { UnitStatus } from "../../../../_shared/organization.types";
import { useStructureStore } from "../../../Structure.store";
import styles from "../../../Structure.module.css";
import type { UnitNodeData } from "../../../Structure.types";
import type { UnitNodeProps } from "./UnitNode.types";

const UNIT_STATUS_COLORS: Record<UnitStatus, string> = {
  draft: "gray",
  active: "green",
  inactive: "yellow",
  merged: "blue",
  split: "blue",
  renamed: "blue",
  archived: "dark",
};

export function UnitNode({ data, selected, id }: UnitNodeProps) {
  const [hovered, setHovered] = useState(false);
  const unitData = data as UnitNodeData;
  const {
    expandedUnitIds,
    expandUnit,
    collapseUnit,
    selectUnit,
    setFocusedBranch,
    openAddUnitModal,
    openEditUnitModal,
    openMoveModal,
    openDeactivateModal,
  } = useStructureStore();
  const isExpanded = expandedUnitIds.includes(id);

  return (
    <div
      className={`${styles.node} ${styles.unitNode} ${selected ? styles.nodeSelected : ""} ${hovered ? styles.nodeHovered : ""} ${unitData._dimmed ? styles.nodeDimmed : ""} ${unitData._pathHighlighted ? styles.nodePathHighlight : ""} ${unitData._searchMatch ? styles.nodeSearchMatch : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => selectUnit(id)}
    >
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <div className={styles.nodeHeader}>
        <Group gap="xs" wrap="nowrap">
          <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
            <Text
              size="xs"
              fw={500}
              c="dimmed"
              tt="uppercase"
              style={{ letterSpacing: "0.05em", fontSize: 10 }}
            >
              {unitData.unitType}
            </Text>
            <BilingualName
              np={unitData.name_np}
              en={unitData.name_en}
              size="sm"
              fw={700}
            />
          </Stack>
          <Badge
            size="xs"
            color={UNIT_STATUS_COLORS[unitData.status]}
            variant="dot"
          >
            {unitData.status}
          </Badge>
        </Group>
      </div>
      <div className={styles.nodeBody}>
        <Text size="xs" c="dimmed">
          {unitData.code}
        </Text>
      </div>

      {unitData.positions && (
        <div className={styles.memberSection}>
          {unitData.positions.length === 0 ? (
            <Text size="xs" c="dimmed">
              No members
            </Text>
          ) : (
            <Stack gap={6}>
              {unitData.positions.map((position) => (
                <div key={position.id}>
                  <BilingualName
                    np={position.title_np}
                    en={position.title_en}
                    size="xs"
                    fw={600}
                    inline
                  />
                  {position.holders.length === 0 ? (
                    <Text size="xs" c="dimmed" mt={2}>
                      Vacant
                    </Text>
                  ) : (
                    <Group gap={4} mt={3}>
                      {position.holders.map((holder) => (
                        <Badge
                          key={holder.assignment_id}
                          size="xs"
                          variant="light"
                          color={holder.is_primary ? "violet" : "gray"}
                        >
                          {holder.display_name}
                        </Badge>
                      ))}
                    </Group>
                  )}
                </div>
              ))}
            </Stack>
          )}
        </div>
      )}

      {unitData.hasChildren && (
        <div className={styles.nodeExpandStrip}>
          <Text
            size="xs"
            c={unitData._childrenError ? "red" : "dimmed"}
            style={{ flex: 1 }}
          >
            {unitData._childrenLoading
              ? "Loading…"
              : unitData._childrenError
                ? "Failed to load — retry"
                : isExpanded
                  ? "Expanded"
                  : "Show sub-units"}
          </Text>
          {unitData._childrenLoading ? (
            <Loader size={12} color="violet" />
          ) : (
            <ActionIcon
              size="xs"
              variant="subtle"
              color={isExpanded ? "gray" : "violet"}
              onClick={(e) => {
                e.stopPropagation();
                if (isExpanded) collapseUnit(id);
                else expandUnit(id);
              }}
              aria-label={isExpanded ? "Collapse children" : "Expand children"}
            >
              {isExpanded ? (
                <CaretUpIcon size={12} />
              ) : (
                <CaretDownIcon size={12} />
              )}
            </ActionIcon>
          )}
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
                selectUnit(id);
              }}
              aria-label="Open details"
            >
              <ArrowSquareOutIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add child unit" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="violet"
              onClick={(e) => {
                e.stopPropagation();
                openAddUnitModal(id, unitData.name_np);
              }}
              aria-label="Add child unit"
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
                openEditUnitModal(id);
              }}
              aria-label="Edit unit"
            >
              <PencilSimpleIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Move" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="cyan"
              onClick={(e) => {
                e.stopPropagation();
                openMoveModal(id, unitData.name_np);
              }}
              aria-label="Move unit"
            >
              <ArrowsOutCardinalIcon size={12} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Deactivate" position="top" withArrow>
            <ActionIcon
              size="xs"
              variant="light"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                openDeactivateModal(id, unitData.name_np);
              }}
              aria-label="Deactivate unit"
            >
              <ProhibitIcon size={12} />
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
