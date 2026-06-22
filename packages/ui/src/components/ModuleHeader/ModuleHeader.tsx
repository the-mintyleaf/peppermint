"use client";

import { Box, Divider, Group } from "@mantine/core";
import { PageBreadcrumb } from "../PageBreadcrumb";
import { SubNavExpandButton } from "../SubNavExpandButton";
import type { ModuleHeaderProps } from "./ModuleHeader.types";

export function ModuleHeader({
  breadcrumbItems = [],
  breadcrumbColor,
  center,
  right,
  withDivider = true,
}: ModuleHeaderProps) {
  const breadcrumb = (
    <PageBreadcrumb items={breadcrumbItems} color={breadcrumbColor} />
  );

  const leftContent = (
    <Group gap={0} align="center" wrap="nowrap">
      <SubNavExpandButton />
      {breadcrumb}
    </Group>
  );

  return (
    <>
      {center ? (
        <Box pos="relative" h={38}>
          <Group pl="md" h="100%" justify="space-between" wrap="nowrap">
            {leftContent}
            {right}
          </Group>

          <Box
            pos="absolute"
            left="50%"
            top="50%"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            {center}
          </Box>
        </Box>
      ) : (
        <Group pl="md" h={38} justify="space-between" wrap="nowrap">
          {leftContent}
          {right}
        </Group>
      )}

      {withDivider && <Divider />}
    </>
  );
}
