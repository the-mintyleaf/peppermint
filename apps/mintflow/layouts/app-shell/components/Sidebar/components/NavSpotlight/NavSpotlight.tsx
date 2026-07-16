"use client";

import { useMemo } from "react";
import { Spotlight, type SpotlightActionData } from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

import type { NavSpotlightProps } from "./NavSpotlight.types";

/**
 * Command palette over every nav destination, grouped by section. Opened by the
 * panel search field (`spotlight.open()`) or the `mod + K` shortcut.
 */
export function NavSpotlight({ groups, onNavigate }: NavSpotlightProps) {
  const actions = useMemo<SpotlightActionData[]>(
    () =>
      groups.flatMap((group) =>
        group.items.map((item) => {
          const Icon = item.icon;
          return {
            id: item.id,
            label: item.label,
            group: group.label,
            leftSection: <Icon size={20} weight="duotone" />,
            onClick: () => onNavigate?.(item.href),
          };
        }),
      ),
    [groups, onNavigate],
  );

  return (
    <Spotlight
      actions={actions}
      shortcut={["mod + K"]}
      nothingFound="Nothing found..."
      highlightQuery
      limit={10}
      scrollable
      maxHeight={400}
      searchProps={{
        leftSection: <MagnifyingGlassIcon size={20} />,
        placeholder: "Search...",
      }}
    />
  );
}
