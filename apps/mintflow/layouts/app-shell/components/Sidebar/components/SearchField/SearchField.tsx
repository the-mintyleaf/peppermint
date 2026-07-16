"use client";

import { Text, UnstyledButton, spotlight } from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

import classes from "./SearchField.module.css";

/** Full-width search trigger — opens the command palette (also `mod + K`). */
export function SearchField() {
  return (
    <UnstyledButton
      className={classes.field}
      onClick={() => spotlight.open()}
      aria-label="Search"
    >
      <MagnifyingGlassIcon size={16} className={classes.icon} />
      <Text component="span" className={classes.placeholder}>
        Search…
      </Text>
      <Text component="span" className={classes.kbd}>
        ⌘K
      </Text>
    </UnstyledButton>
  );
}
