"use client";

import { Anchor, Breadcrumbs } from "@mantine/core";

interface PageBreadcrumbProps {
  items: { label: string; href: string }[];
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  return (
    <Breadcrumbs separatorMargin={4} opacity={0.5}>
      {items.map((item, index) => (
        <Anchor key={index} c="black" size="xs" href={item.href}>
          {item.label}
        </Anchor>
      ))}
    </Breadcrumbs>
  );
}
