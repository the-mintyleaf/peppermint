"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Spotlight,
  type SpotlightActionData,
} from "@peppermint/ui";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { buildNavSpotlightTargets } from "../../../navSpotlight.utils";
import type {
  AdminShellMainNavAdditional,
  AdminShellMainNavItem,
} from "../../../AdminShell.types";

interface MainNavSpotlightProps {
  mainNav: AdminShellMainNavItem[];
  additional?: AdminShellMainNavAdditional[];
}

export function MainNavSpotlight({
  mainNav,
  additional,
}: MainNavSpotlightProps) {
  const router = useRouter();

  const actions = useMemo<SpotlightActionData[]>(() => {
    return buildNavSpotlightTargets(mainNav, additional).map((target) => {
      const IconComponent = target.icon;

      return {
        id: target.id,
        label: target.label,
        description: target.description,
        group: target.group,
        keywords: target.keywords,
        leftSection: IconComponent ? (
          <IconComponent size={20} weight="duotone" />
        ) : undefined,
        onClick: () => {
          if (target.onClick) {
            target.onClick();
            return;
          }

          if (target.href) {
            router.push(target.href);
          }
        },
      };
    });
  }, [mainNav, additional, router]);

  return (
    <Spotlight
      actions={actions}
      nothingFound="No modules found..."
      highlightQuery
      limit={10}
      scrollable
      maxHeight={400}
      styles={{
        actionLabel: { fontSize: "var(--mantine-font-size-sm)" },
        actionDescription: { fontSize: "var(--mantine-font-size-xs)" },
        empty: { fontSize: "var(--mantine-font-size-sm)" },
      }}
      searchProps={{
        size: "sm",
        leftSection: <MagnifyingGlass size={20} />,
        placeholder: "Search modules...",
      }}
    />
  );
}
