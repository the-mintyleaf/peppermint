"use client";

import { Box } from "@peppermint/ui";

import { CrossMark, MonoText } from "@/components";
import type { StatusRailProps } from "./StatusRail.types";
import classes from "./StatusRail.module.css";

/**
 * The frame's closing rail — where am I, on what route, on what build. It is
 * instrumentation, not navigation: nothing in it is interactive, and every slot
 * is mono meta.
 *
 * A missing `section` means the route is outside the nav (a placeholder path, a
 * 404). Say so rather than rendering an empty slot — a blank rail reads as a
 * broken shell.
 */
export function StatusRail({ section, pathname, version }: StatusRailProps) {
  return (
    <Box className={classes.rail}>
      <CrossMark className={classes.junctionStart} />
      <CrossMark className={classes.junctionEnd} />

      <MonoText label fz="10px" fw={700} c="var(--ml-meta-ink)">
        {section ?? "Off-map"}
      </MonoText>

      <MonoText fz="10px" c="var(--ml-meta-ink)" className={classes.railCentre}>
        {pathname}
      </MonoText>

      <MonoText label fz="10px" c="var(--ml-meta-ink)">
        Mintplayground v{version}
      </MonoText>
    </Box>
  );
}
