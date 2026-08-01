"use client";

import { Grid, Stack, Text } from "@peppermint/ui";
import { TYPE_SECTION } from "../dashboard.typeScale";
import type { SectionBandProps } from "./SectionBand.types";

/**
 * One horizontal band of the dashboard: a title, the question it answers, and
 * the 12-column grid its cards sit in. The band owns the grid so every card on
 * the page measures against the SAME twelve columns — a card is 6/12 or 4/12 or
 * 2/12 of the page, never of some nested grid that happens to look similar.
 *
 * The band title is a step below the greeting and a step above a card title, so
 * the page reads as three levels at a squint and not as one flat wall.
 */
export function SectionBand({ title, subtitle, children }: SectionBandProps) {
  return (
    <Stack gap="sm">
      <Stack gap={2}>
        <Text {...TYPE_SECTION}>{title}</Text>
        {subtitle ? (
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
      {/* Mantine 9 `Grid` is `gap`, not v7's `gutter`; 12 columns and
          `align="stretch"` are already the defaults. */}
      <Grid gap="md">{children}</Grid>
    </Stack>
  );
}
