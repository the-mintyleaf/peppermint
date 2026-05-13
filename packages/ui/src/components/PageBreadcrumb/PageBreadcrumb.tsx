"use client";

import { Anchor, Breadcrumbs, Group, Paper, Text } from "@mantine/core";

export function PageBreadcrumb() {
  return (
    <>
      <Breadcrumbs separatorMargin={4} opacity={0.5}>
        <Anchor c="black" size="xs">
          Admin
        </Anchor>
        <Anchor c="black" size="xs">
          Products
        </Anchor>
        <Anchor c="black" size="xs">
          Create
        </Anchor>
      </Breadcrumbs>
    </>
  );
}
