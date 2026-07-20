"use client";

import { Stack, Text, dayjs } from "@peppermint/ui";

import type { BsDateTextProps } from "./BsDateText.types";

/** AD value, formatted; `null` when there is nothing to show. */
function formatAd(value?: string | null): string | null {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : value;
}

/**
 * A date with its Bikram Sambat sibling underneath.
 *
 * The API emits a read-only `<field>_bs` object alongside every user-facing date.
 * The plain AD field stays the source of truth and is the only one ever written
 * back — `_bs` is response-only and must never appear in a request body, which is
 * why this component takes the sibling as a prop rather than deriving or editing
 * it.
 *
 * The BS line is secondary by design: operators reconcile against documents
 * written in BS, but the system's own dates are AD, so AD leads and BS supports.
 */
export function BsDateText({
  value,
  bs,
  script = "en",
  size = "xs",
  fallback = "—",
}: BsDateTextProps) {
  const ad = formatAd(value);
  const bsDisplay = script === "np" ? bs?.display_np : bs?.display_en;

  if (!ad && !bsDisplay) {
    return (
      <Text size={size} c="dimmed">
        {fallback}
      </Text>
    );
  }

  // With no sibling this collapses to a plain date, so it is safe to use for every
  // date cell rather than only the ones the backend decorates.
  if (!bsDisplay) {
    return <Text size={size}>{ad}</Text>;
  }

  return (
    <Stack gap={0}>
      <Text size={size}>{ad ?? fallback}</Text>
      <Text size="xs" c="dimmed">
        {bsDisplay} BS
      </Text>
    </Stack>
  );
}
