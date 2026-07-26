"use client";

import type { ProfileLayoutProps } from "./ProfileLayout.types";
import classes from "./ProfileLayout.module.css";

/**
 * The two-column profile frame: a 5/12 overview sidebar and a 7/12 content
 * column, split by a single full-height cut line (the middle grid track). The
 * sidebar's inner block sticks while the content scrolls; on narrow viewports
 * the columns stack (sidebar first), the divider hides, and nothing sticks.
 */
export function ProfileLayout({ sidebar, children }: ProfileLayoutProps) {
  return (
    <div className={classes.grid}>
      <div className={classes.sidebar}>
        <div className={classes.sidebarSticky}>{sidebar}</div>
      </div>
      <div className={classes.divider} aria-hidden />
      <div className={classes.content}>{children}</div>
    </div>
  );
}
