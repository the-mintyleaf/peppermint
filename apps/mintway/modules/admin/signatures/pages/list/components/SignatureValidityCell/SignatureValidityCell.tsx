"use client";

import { Badge, Text, Tooltip } from "@peppermint/ui";
import type {
  SignatureValidity,
  SignatureValidityCellProps,
} from "./SignatureValidityCell.types";
import {
  formatValidityRange,
  getSignatureValidity,
} from "./SignatureValidityCell.utils";

/**
 * Answers one question: *can this signatory be used on a certificate dated today?*
 *
 * It is a fact, not a lever — a badge, never a control (lifecycle lives in the neighbouring
 * status cell). Only the two states that need attention are badged; an unbounded or
 * in-window signatory is the normal case and reads as quiet text, so a scan down the column
 * surfaces exactly the rows that are a problem. Each state is words + colour, never colour
 * alone.
 */
const VALIDITY_META: Record<
  Exclude<SignatureValidity, "unbounded" | "in_window">,
  { label: string; color: string }
> = {
  not_yet_valid: { label: "Not yet valid", color: "yellow" },
  expired: { label: "Expired", color: "red" },
};

export function SignatureValidityCell({
  signature,
}: SignatureValidityCellProps) {
  const validity = getSignatureValidity(signature);
  const range = formatValidityRange(signature);

  if (validity === "unbounded") {
    return (
      <Text size="xs" c="dimmed">
        No limit
      </Text>
    );
  }

  if (validity === "in_window") {
    return (
      <Text size="xs" c="dimmed">
        {range}
      </Text>
    );
  }

  const meta = VALIDITY_META[validity];
  return (
    <Tooltip label={`Valid ${range}`} withArrow>
      <Badge size="xs" variant="light" color={meta.color}>
        {meta.label}
      </Badge>
    </Tooltip>
  );
}
