"use client";

import {
  Group,
  ActionIcon,
  Button,
  TextInput,
  Tooltip,
  Badge,
  Text,
  Menu,
  Divider,
} from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { MagicWandIcon } from "@phosphor-icons/react/dist/csr/MagicWand";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { MagnifyingGlassPlusIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlassPlus";
import { MagnifyingGlassMinusIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlassMinus";
import { FrameCornersIcon } from "@phosphor-icons/react/dist/csr/FrameCorners";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { useOrgBuilderStore } from "../../../../organization.store";
import styles from "../../OrganizationBuilder.module.css";
import type { ToolbarProps } from "./Toolbar.types";

export function Toolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  onAutoArrange,
  onSave,
  onTogglePeople,
  canUndo,
  canRedo,
  saved,
  showPeople,
  searchQuery,
  onSearchChange,
  nodeCount,
}: ToolbarProps) {
  const { openAddModal } = useOrgBuilderStore();

  return (
    <div className={styles.toolbar}>
      {/* Add actions */}
      <Button
        size="xs"
        variant="light"
        color="blue"
        leftSection={<BuildingsIcon size={14} aria-label="Organization" />}
        onClick={() => openAddModal("org")}
      >
        Organization
      </Button>
      <Button
        size="xs"
        variant="light"
        color="violet"
        leftSection={<FolderIcon size={14} aria-label="Department" />}
        onClick={() => openAddModal("department")}
      >
        Department
      </Button>
      <Button
        size="xs"
        variant="light"
        color="teal"
        leftSection={<UserIcon size={14} aria-label="Person" />}
        onClick={() => openAddModal("person")}
      >
        Person
      </Button>

      <div className={styles.toolbarDivider} />

      {/* History */}
      <Tooltip label="Undo" withArrow>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          disabled={!canUndo}
          onClick={onUndo}
          aria-label="Undo"
        >
          <ArrowCounterClockwiseIcon size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Redo" withArrow>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          disabled={!canRedo}
          onClick={onRedo}
          aria-label="Redo"
        >
          <ArrowClockwiseIcon size={16} />
        </ActionIcon>
      </Tooltip>

      <div className={styles.toolbarDivider} />

      {/* Search */}
      <TextInput
        className={styles.toolbarSearch}
        size="xs"
        placeholder="Search nodes…"
        leftSection={<MagnifyingGlassIcon size={14} aria-label="Search" />}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className={styles.toolbarDivider} />

      {/* View options */}
      <Tooltip label={showPeople ? "Hide people" : "Show people"} withArrow>
        <ActionIcon
          size="sm"
          variant={showPeople ? "light" : "subtle"}
          color={showPeople ? "teal" : "gray"}
          onClick={onTogglePeople}
          aria-label={showPeople ? "Hide people nodes" : "Show people nodes"}
        >
          {showPeople ? <EyeIcon size={16} /> : <EyeSlashIcon size={16} />}
        </ActionIcon>
      </Tooltip>

      {/* Auto arrange */}
      <Tooltip label="Auto arrange" withArrow>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="orange"
          onClick={onAutoArrange}
          aria-label="Auto arrange nodes"
        >
          <MagicWandIcon size={16} />
        </ActionIcon>
      </Tooltip>

      <div className={styles.toolbarDivider} />

      {/* Zoom */}
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
      <Tooltip label="Fit to screen" withArrow>
        <ActionIcon size="sm" variant="subtle" color="gray" onClick={onFitView} aria-label="Fit view">
          <FrameCornersIcon size={16} />
        </ActionIcon>
      </Tooltip>

      <div className={styles.toolbarDivider} />

      {/* Save */}
      <Button
        size="xs"
        variant={saved ? "subtle" : "filled"}
        color="blue"
        leftSection={<FloppyDiskIcon size={14} aria-label="Save" />}
        onClick={onSave}
      >
        {saved ? "Saved" : "Save"}
      </Button>

      {nodeCount > 0 && (
        <Badge size="sm" color="gray" variant="light" ml={4}>
          {nodeCount}
        </Badge>
      )}
    </div>
  );
}
