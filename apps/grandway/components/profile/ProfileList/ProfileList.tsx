"use client";

import { Children, Fragment, isValidElement } from "react";
import Link from "next/link";
import { Divider, Stack } from "@peppermint/ui";
import type {
  ProfileListProps,
  ProfileListRowProps,
} from "./ProfileList.types";
import classes from "./ProfileList.module.css";

/**
 * The full-width list of related records — family members, emergency contacts,
 * journeys, documents. Cards in a 2-up grid boxed each record in its own
 * chrome and halved the width available for it; a divided list gives every row
 * the whole column, so a trailing actions menu and a status badge can sit on
 * the same line as the name.
 *
 * Loading, empty, and error states belong to the calling panel — this draws a
 * non-empty list only.
 */
export function ProfileList({ children }: ProfileListProps) {
  const rows = Children.toArray(children);

  return (
    <Stack gap={0}>
      {rows.map((row, index) => (
        // The wrapper carries the CHILD's key, never the index. These lists are
        // filtered by a search box, so an index key would let React reuse the
        // previous row's subtree at the same position — attaching an open
        // actions menu or the focus ring to the wrong record.
        <Fragment key={isValidElement(row) ? row.key : index}>
          {index > 0 ? <Divider /> : null}
          {row}
        </Fragment>
      ))}
    </Stack>
  );
}

/** One row of a `ProfileList` — consistent vertical rhythm, optional whole-row link. */
export function ProfileListRow({ children, href }: ProfileListRowProps) {
  if (href) {
    return (
      <Link href={href} className={`${classes.row} ${classes.linkRow}`}>
        {children}
      </Link>
    );
  }

  return <div className={classes.row}>{children}</div>;
}
