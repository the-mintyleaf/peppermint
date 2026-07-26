"use client";

import Link from "next/link";
import { Card } from "@peppermint/ui";
import type { ProfileCardProps } from "./ProfileCard.types";
import classes from "./ProfileCard.module.css";

/**
 * The one card shape used to represent a data item across every profile —
 * consistent border, radius, and padding so family members, journeys, and
 * documents all read as the same object type. Pass `href` to make the whole
 * card a keyboard-focusable link with a hover affordance.
 */
export function ProfileCard({ href, children }: ProfileCardProps) {
  if (href) {
    return (
      <Card
        withBorder
        radius="md"
        padding="md"
        component={Link}
        href={href}
        className={`${classes.card} ${classes.linkCard}`}
      >
        {children}
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" padding="md" className={classes.card}>
      {children}
    </Card>
  );
}
