"use client";

import { Text, Tooltip, UnstyledButton, spotlight } from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

import type { SearchFieldProps } from "./SearchField.types";
import classes from "./SearchField.module.css";

/** Full-width search trigger — opens the command palette (also `mod + K`). */
export function SearchField({ collapsed = false }: SearchFieldProps) {
  if (collapsed) {
    return (
      <Tooltip label="Search" withArrow position="right">
        <UnstyledButton
          className={classes.iconTrigger}
          onClick={() => spotlight.open()}
          aria-label="Search"
        >
          <MagnifyingGlassIcon size={16} className={classes.icon} />
        </UnstyledButton>
      </Tooltip>
    );
  }

  return (
    <UnstyledButton
      className={classes.field}
      onClick={() => spotlight.open()}
      aria-label="Search"
    >
      <MagnifyingGlassIcon size={14} className={classes.icon} />
      <Text component="span" className={classes.placeholder}>
        Search
      </Text>
      <Text component="span" className={classes.kbd}>
        ⌘K
      </Text>
    </UnstyledButton>
  );
}
