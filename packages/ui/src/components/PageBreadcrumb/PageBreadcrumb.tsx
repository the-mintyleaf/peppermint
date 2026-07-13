"use client";

import { Anchor, Box, Breadcrumbs } from "@mantine/core";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { HouseSimpleIcon } from "@phosphor-icons/react/dist/csr/HouseSimple";
import type { MantineColor } from "@mantine/core";

interface PageBreadcrumbProps {
  items?: { label: string; href: string }[];
  color?: MantineColor;
}

export function PageBreadcrumb({
  items = [],
  color = "gray",
}: PageBreadcrumbProps) {
  if (items.length === 0) return null;

  const lastItem = items[items.length - 1];

  return (
    <>
      <Box hiddenFrom="sm">
        <Anchor c={color} size="xs" href={lastItem.href}>
          {lastItem.label}
        </Anchor>
      </Box>

      <Box visibleFrom="sm">
        <Breadcrumbs
          separatorMargin={8}
          separator={<CaretRightIcon weight="bold" size={12} />}
        >
          <HouseSimpleIcon
            weight="fill"
            size={12}
            color="var(--mantine-color-brand-6)"
          />
          {items.map((item, index) => (
            <Anchor key={index} c={color} size="xs" href={item.href}>
              {item.label}
            </Anchor>
          ))}
        </Breadcrumbs>
      </Box>
    </>
  );
}
