"use client";

import { ActionIcon, Select, Tooltip } from "@peppermint/ui";
import { ArrowsInSimpleIcon } from "@phosphor-icons/react/dist/csr/ArrowsInSimple";
import { ArrowsOutSimpleIcon } from "@phosphor-icons/react/dist/csr/ArrowsOutSimple";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { CornersOutIcon } from "@phosphor-icons/react/dist/csr/CornersOut";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import styles from "../../Structure.module.css";
import type { ToolbarProps } from "./Toolbar.types";

export function Toolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onRefresh,
  onExpandAll,
  onCollapseAll,
  isFullyCollapsed,
  searchOptions,
  searchValue,
  onSearchChange,
}: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <Select
        placeholder="Find a unit…"
        size="xs"
        searchable
        clearable
        data={searchOptions}
        value={searchValue}
        onChange={onSearchChange}
        nothingFoundMessage="No units found"
        leftSection={<MagnifyingGlassIcon size={13} aria-label="Find unit" />}
        comboboxProps={{ withinPortal: true }}
        className={styles.toolbarSearch}
      />
      <div className={styles.toolbarDivider} />
      <Tooltip label="Zoom out" position="top" withArrow>
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={onZoomOut}
          aria-label="Zoom out"
        >
          <MinusIcon size={14} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Zoom in" position="top" withArrow>
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={onZoomIn}
          aria-label="Zoom in"
        >
          <PlusIcon size={14} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Fit view" position="top" withArrow>
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={onFitView}
          aria-label="Fit view"
        >
          <CornersOutIcon size={14} />
        </ActionIcon>
      </Tooltip>
      <div className={styles.toolbarDivider} />
      <Tooltip
        label={isFullyCollapsed ? "Expand all" : "Collapse all"}
        position="top"
        withArrow
      >
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={isFullyCollapsed ? onExpandAll : onCollapseAll}
          aria-label={isFullyCollapsed ? "Expand all" : "Collapse all"}
        >
          {isFullyCollapsed ? (
            <ArrowsOutSimpleIcon size={14} />
          ) : (
            <ArrowsInSimpleIcon size={14} />
          )}
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Refresh tree" position="top" withArrow>
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={onRefresh}
          aria-label="Refresh tree"
        >
          <ArrowsClockwiseIcon size={14} />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
