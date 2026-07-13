"use client";

import { Badge } from "@peppermint/ui";
import type { MantineSize } from "@peppermint/ui";

export interface StatusBadgeProps<S extends string = string> {
  value: S;
  /** Status value → Mantine color. Unmapped values fall back to gray. */
  colorMap: Partial<Record<S, string>>;
  /** Optional status value → display label. Defaults to the raw value. */
  labelMap?: Partial<Record<S, string>>;
  size?: MantineSize;
}

/**
 * The status pill copied 8+ times across list modules, consolidated. Status is
 * conveyed by label text (not color alone), per the design doctrine.
 */
export function StatusBadge<S extends string = string>({
  value,
  colorMap,
  labelMap,
  size = "xs",
}: StatusBadgeProps<S>) {
  return (
    <Badge size={size} color={colorMap[value] ?? "gray"}>
      {labelMap?.[value] ?? value}
    </Badge>
  );
}
