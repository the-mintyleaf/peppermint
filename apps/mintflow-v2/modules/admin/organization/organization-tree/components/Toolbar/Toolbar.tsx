"use client";

import { ActionIcon, Badge, Button, Menu, Text, Tooltip } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { MagicWandIcon } from "@phosphor-icons/react/dist/csr/MagicWand";
import { MagnifyingGlassPlusIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlassPlus";
import { MagnifyingGlassMinusIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlassMinus";
import { FrameCornersIcon } from "@phosphor-icons/react/dist/csr/FrameCorners";
import { ArrowsInIcon } from "@phosphor-icons/react/dist/csr/ArrowsIn";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { GraphIcon } from "@phosphor-icons/react/dist/csr/Graph";
import { GridFourIcon } from "@phosphor-icons/react/dist/csr/GridFour";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/csr/ArrowUp";
import { useOrgTreeStore } from "../../OrganizationTree.store";
import styles from "../../OrganizationTree.module.css";
import type { ToolbarProps } from "./Toolbar.types";

export function Toolbar({
  onZoomIn, onZoomOut, onFitView, onUndo, onRedo, onAutoArrange,
  canUndo, canRedo,
  activeDepartmentId, activeDepartmentName, onClearActiveDepartment,
  viewMode, onToggleViewMode, onCollapseAll,
  focusedBranchId, onClearFocusBranch, onBackToParent, onFitVisible,
}: ToolbarProps) {
  const { openAddModal } = useOrgTreeStore();

  return (
    <div className={styles.toolbar}>

      <Menu shadow="md" width={190} position="top-start">
        <Menu.Target>
          <Button size="xs" variant="filled" color="blue" leftSection={<PlusIcon size={14} weight="bold" aria-label="Add" />}>
            Add
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Add to structure</Menu.Label>
          <Menu.Item leftSection={<BuildingsIcon size={14} aria-label="Organization" />} onClick={() => openAddModal("org")}>
            Organization
          </Menu.Item>
          <Menu.Item leftSection={<FolderIcon size={14} aria-label="Department" />} onClick={() => openAddModal("department")}>
            Department
          </Menu.Item>
          <Menu.Item leftSection={<UserIcon size={14} aria-label="Person" />} onClick={() => openAddModal("person")}>
            Person
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {activeDepartmentId && (
        <>
          <div className={styles.toolbarDivider} />
          <div className={styles.personAddMode}>
            <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>Adding to:</Text>
            <Badge size="sm" color="violet" variant="light" style={{ maxWidth: 140 }}>
              {activeDepartmentName ?? "Department"}
            </Badge>
            <Button size="xs" variant="filled" color="teal" leftSection={<UserPlusIcon size={13} aria-label="Add person" />} onClick={() => openAddModal("person")}>
              Add Person
            </Button>
            <Tooltip label="Exit" withArrow>
              <ActionIcon size="xs" variant="subtle" color="gray" onClick={onClearActiveDepartment} aria-label="Exit person-add mode">
                <XIcon size={13} />
              </ActionIcon>
            </Tooltip>
          </div>
        </>
      )}

      {focusedBranchId && (
        <>
          <div className={styles.toolbarDivider} />
          <div className={styles.focusBranchMode}>
            <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>Focused branch</Text>
            <Tooltip label="Go to parent" withArrow>
              <ActionIcon size="xs" variant="subtle" color="indigo" onClick={onBackToParent} aria-label="Go to parent branch">
                <ArrowUpIcon size={12} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Clear focus" withArrow>
              <ActionIcon size="xs" variant="subtle" color="gray" onClick={onClearFocusBranch} aria-label="Clear focus">
                <XIcon size={12} />
              </ActionIcon>
            </Tooltip>
          </div>
        </>
      )}

      <div className={styles.toolbarDivider} />

      <Tooltip label="Undo" withArrow>
        <ActionIcon size="sm" variant="subtle" color="gray" disabled={!canUndo} onClick={onUndo} aria-label="Undo">
          <ArrowCounterClockwiseIcon size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Redo" withArrow>
        <ActionIcon size="sm" variant="subtle" color="gray" disabled={!canRedo} onClick={onRedo} aria-label="Redo">
          <ArrowClockwiseIcon size={16} />
        </ActionIcon>
      </Tooltip>

      {viewMode === "explorer" && (
        <Tooltip label="Collapse all" withArrow>
          <ActionIcon size="sm" variant="subtle" color="gray" onClick={onCollapseAll} aria-label="Collapse all">
            <ArrowsInIcon size={16} />
          </ActionIcon>
        </Tooltip>
      )}

      <div className={styles.toolbarDivider} />

      <Tooltip label={viewMode === "explorer" ? "Show full map" : "Explorer mode"} withArrow>
        <ActionIcon size="sm" variant={viewMode === "fullmap" ? "filled" : "subtle"} color="blue" onClick={onToggleViewMode} aria-label="Toggle view mode">
          <GraphIcon size={16} />
        </ActionIcon>
      </Tooltip>

      <Menu shadow="md" width={160} position="top">
        <Menu.Target>
          <Tooltip label="Layout options" withArrow>
            <ActionIcon size="sm" variant="subtle" color="orange" aria-label="Layout options">
              <MagicWandIcon size={16} />
            </ActionIcon>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Layout</Menu.Label>
          <Menu.Item onClick={() => onAutoArrange("compact")}>Compact layout</Menu.Item>
          <Menu.Item onClick={() => onAutoArrange("expanded")}>Expanded layout</Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <div className={styles.toolbarDivider} />

      <Tooltip label="Zoom in" withArrow>
        <ActionIcon size="sm" variant="subtle" color="gray" onClick={onZoomIn} aria-label="Zoom in">
          <MagnifyingGlassPlusIcon size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Zoom out" withArrow>
        <ActionIcon size="sm" variant="subtle" color="gray" onClick={onZoomOut} aria-label="Zoom out">
          <MagnifyingGlassMinusIcon size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Fit visible" withArrow>
        <ActionIcon size="sm" variant="subtle" color="gray" onClick={onFitVisible} aria-label="Fit visible nodes">
          <FrameCornersIcon size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Fit all" withArrow>
        <ActionIcon size="sm" variant="subtle" color="gray" onClick={onFitView} aria-label="Fit all to view">
          <GridFourIcon size={16} />
        </ActionIcon>
      </Tooltip>

    </div>
  );
}
