"use client";

import { useMemo } from "react";
import { Spotlight, type SpotlightActionData } from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

import type { NavSpotlightProps } from "./NavSpotlight.types";

/**
 * Command-palette search over the rail destinations. Opened by the rail search
 * button (`spotlight.open()`) or the `mod + K` shortcut.
 */
export function NavSpotlight({
  nav,
  additional,
  onNavigate,
}: NavSpotlightProps) {
  const actions = useMemo<SpotlightActionData[]>(() => {
    const items: SpotlightActionData[] = nav.map((item) => {
      const Icon = item.icon;
      return {
        id: item.id,
        label: item.label,
        leftSection: <Icon size={20} weight="duotone" />,
        onClick: () => onNavigate?.(item.href),
      };
    });

    for (const item of additional ?? []) {
      if (!item.href && !item.onClick) continue;
      const Icon = item.icon;
      items.push({
        id: item.id,
        label: item.label,
        leftSection: <Icon size={20} weight="duotone" />,
        onClick: () => {
          if (item.onClick) {
            item.onClick();
            return;
          }
          if (item.href) onNavigate?.(item.href);
        },
      });
    }

    return items;
  }, [nav, additional, onNavigate]);

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
