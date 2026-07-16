"use client";

import { ActionIcon, Loader, Select, Tooltip } from "@peppermint/ui";
import { ArrowsInSimpleIcon } from "@phosphor-icons/react/dist/csr/ArrowsInSimple";
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
  onCollapseAll,
  searchResults,
  searchQuery,
  onSearchQueryChange,
  onSelectUnit,
  searchLoading = false,
}: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <Select
        placeholder="Search units…"
        size="xs"
        searchable
        clearable
        data={searchResults}
        value={null}
        onChange={onSelectUnit}
        searchValue={searchQuery}
        onSearchChange={onSearchQueryChange}
        // Results are already filtered by the server — show them as-is.
        filter={({ options }) => options}
        nothingFoundMessage={
          searchLoading
            ? "Searching…"
            : searchQuery.trim().length >= 2
              ? "No units found"
              : "Type to search units"
        }
        leftSection={<MagnifyingGlassIcon size={13} aria-label="Find unit" />}
        rightSection={searchLoading ? <Loader size={12} /> : undefined}
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
      <Tooltip label="Collapse all" position="top" withArrow>
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={onCollapseAll}
          aria-label="Collapse all"
        >
          <ArrowsInSimpleIcon size={14} />
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
