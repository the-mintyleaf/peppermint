"use client";

import type { ProfileLayoutProps } from "./ProfileLayout.types";
import classes from "./ProfileLayout.module.css";

/**
 * The two-column profile frame: a sticky 5/12 overview sidebar beside a 7/12
 * content column. On narrow viewports the columns stack (sidebar first) and the
 * sidebar stops sticking, so the whole profile reads top-to-bottom on mobile.
 */
export function ProfileLayout({ sidebar, children }: ProfileLayoutProps) {
  return (
    <div className={classes.grid}>
      <div className={classes.sidebar}>{sidebar}</div>
      <div className={classes.content}>{children}</div>
    </div>
  );
}
